'use strict';

import {
    getCities,
    findTechGroupsByCity,
    findPastEvents
} from '../infra/api/meetup/api';
import database from '../infra/database/index';
import moment from 'moment';

const importEvents = async () => {
    try {
        const cities = await getCities();

        const montpellier = cities.filter(city => 'Montpellier' === city.city)[0];

        const groups = await findTechGroupsByCity(montpellier);
        const groupIds = groups.map(group => group.id);

        const pastEvents = await findPastEvents(groupIds);
        const events = pastEvents.results.map((event) => {
            return {
                id: event.id,
                name: event.name,
                link: event.event_url,
                time: moment(event.time + event.utc_offset).utc().format(),
                attendees: event.yes_rsvp_count,
                city: {
                    city: montpellier.city,
                    lat: montpellier.lat,
                    lon: montpellier.lon,
                }, // @todo change this
                group: {
                    id: event.group.id,
                    name: event.group.name,
                    urlname: event.group.urlname,
                    created: event.group.created,
                },
            }
        });

        (async () => {
            const client = await database.connect();

            try {
                await client.query('BEGIN');
                events.forEach(async (event) => {
                    await client.query('INSERT INTO events(id, name, link, time, attendees, city, event_group) VALUES($1, $2, $3, $4, $5, $6, $7)', Object.values(event));
                });
                await client.query('COMMIT');
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }
        })().catch(e => console.error(e.stack));

        console.log(`Import ${pastEvents.meta.count} events from ${montpellier.city}`);
    } catch (e) {
        console.error(e.stack);
        throw e;
    }
};

export default importEvents;
