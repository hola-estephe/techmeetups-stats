'use strict';

import {
    getCities,
    findTechGroupsByCity,
    findPastEvents
} from '../infra/api/meetup/api';
import database from '../infra/database/index';
import moment from 'moment';
import uuid from 'uuid/v4';

const importEvents = async () => {
    const client = await database.connect();

    try {
        const cities = await getCities();
        for (const city of cities) {
            console.log(`Importing ${city.city}...`);
            const groups = await findTechGroupsByCity(city);
            const groupIds = groups.map(group => group.id);

            try {
                await client.query('BEGIN');
                const events = await findPastEvents(groupIds);
                events.forEach(async event => {
                    const data = {
                        id: uuid(),
                        event_id: event.id,
                        name: event.name,
                        link: event.event_url,
                        time: moment(event.time + event.utc_offset).utc().format(),
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
                    };

                    await client.query('INSERT INTO events(id, event_id, name, link, time, attendees, city, event_group) VALUES($1, $2, $3, $4, $5, $6, $7, $8)', Object.values(data));
                });
                await client.query('COMMIT');

                console.log(`Imported ${events.length} events from ${city.city}`);
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

export default importEvents;
