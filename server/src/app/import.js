'use strict';

import {
  getCities,
  findTechGroupsByCity,
  findPastEvents,
} from '../infra/api/meetup/api';
import database from '../infra/database/index';
import moment from 'moment';
import uuid from 'uuid/v4';

export default async (cities, year) => {
  const client = await database.connect();

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

        const result = await client.query({
          text: 'SELECT id FROM events WHERE id = ANY ($1)',
          values: [events.map(event => event.id)],
        });
        const savedIds = result.rows.map(row => row.id);

        const newEvents = events.filter(event => !savedIds.includes(event.id));
        if (0 === newEvents.length) {
          console.log(' - All events already saved... skipped');

          continue;
        }

        await client.query('BEGIN');
        newEvents.forEach(async event => {
          await client.query(
            'INSERT INTO events(id, name, link, time, attendees, city, event_group, venue) VALUES($1, $2, $3, $4, $5, $6, $7, $8)',
            Object.values(event)
          );
        });
        await client.query('COMMIT');

        console.log(` - Imported ${newEvents.length} events`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.stack);
        throw err;
      }
    }
  } catch (err) {
    console.error(err.stack);
    throw err;
  } finally {
    client.release();
  }
};
