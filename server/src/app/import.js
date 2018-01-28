'use strict';

import {
  getCities,
  findTechGroupsByCity,
  findPastEvents,
} from '../infra/api/meetup/api';
import { connection, database } from '../infra/database/index';
import moment from 'moment';
import uuid from 'uuid/v4';

export default async (cities, year) => {
  const client = await connection();
  const db = await database();
  const eventsCollection = db.collection('events');

  try {
    for (const city of cities) {
      console.log(`Importing ${city.city}...`);
      const groups = await findTechGroupsByCity(city);
      const groupIds = groups.map(group => group.id);

      if (0 === groupIds.length) {
        continue;
      }

      try {
        const events = (await findPastEvents(groupIds, year)).map(event => {
          return {
            id: event.id,
            name: event.name,
            link: event.event_url,
            time: moment(event.time + event.utc_offset)
              .utc()
              .format(),
            attendees: event.yes_rsvp_count,
            city: {
              city: city.city,
              lat: city.lat,
              lon: city.lon,
            },
            group: {
              id: event.group.id,
              name: event.group.name,
              urlname: event.group.urlname,
              created: event.group.created,
            },
            venue: event.venue,
          };
        });

        console.log(` - Found ${events.length} events`);

        const savedDocuments = await eventsCollection.find(
          { id: { $in: events.map(event => event.id) } },
          { projection: {id: 1}}
        ).toArray();
        const savedIds = savedDocuments.map(event => event.id);

        const newEvents = events.filter(event => !savedIds.includes(event.id));
        if (0 === newEvents.length) {
          console.log(' - All events already saved... skipped');

          continue;
        }

        db.collection('events').insertMany(events);
        console.log(` - Imported ${events.length} events`);
      } catch (err) {
        console.error(err.stack);
        throw err;
      }
    }
  } catch (err) {
    console.error(err.stack);
    throw err;
  } finally {
    client.close();
  }
};
