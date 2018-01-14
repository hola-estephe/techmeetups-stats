'use strict';

const fetch = require('node-fetch');
const queryString = require('querystring');
const t = require('tcomb');
const moment = require('moment');
const { Pool } = require('pg');

// const types = require('pg').types;
// const timestampOID = 1114;
// types.setTypeParser(timestampOID, value => moment(value).utc().format());

const meetupApiKey = process.env.MEETUP_API_KEY;
if (meetupApiKey === undefined) {
    throw new Error('Must provide MEETUP_API_KEY env variable');
}

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl === undefined) {
    throw new Error('Must provide DATABASE_URL env variable');
}

const database = new Pool({
    connectionString: databaseUrl,
});

const City = t.struct({
    id: t.Number,
    city: t.String,
    lat: t.Number,
    lon: t.Number,
    country: t.String,
    localized_country_name: t.String,
    distance: t.Number,
    ranking: t.Integer,
    member_count: t.Integer,
    zip: t.String,
}, 'City');

const Group = t.struct({
    id: t.Number,
    name: t.String,
    join_mode: t.maybe(t.String),
    // lat: t.Number,
    // lon: t.Number,
    urlname: t.String,
    who: t.String,
    created: t.Number,
}, 'Group');

const Venue = t.struct({
    id: t.Number,
    name: t.String,
    lat: t.Number,
    lon: t.Number,
    address1: t.maybe(t.String),
    address2: t.maybe(t.String),
    address3: t.maybe(t.String),
    city: t.String,
    country: t.String,
    localized_country_name: t.String,
}, 'Venue');

const Event = t.struct({
    id: t.String,
    visibility: t.String,
    name: t.String,
    event_url: t.String,
    description: t.maybe(t.String),
    yes_rsvp_count: t.Integer,
    maybe_rsvp_count: t.Integer,
    rsvp_limit: t.maybe(t.Integer),
    headcount: t.Integer,
    waitlist_count: t.Integer,
    created: t.Integer,
    time: t.Integer,
    utc_offset: t.Integer,
    duration: t.maybe(t.Integer),
    updated: t.Integer,
    status: t.String,
    venue: t.maybe(Venue),
    how_to_find_us: t.maybe(t.String),
    group: Group,
}, 'Event');

const Meta = t.struct({
    id: t.String,
    method: t.String,
    title: t.String,
    description: t.String,
    link: t.String,
    url: t.String,
    count: t.Integer,
    total_count: t.Integer,
    lat: t.String,
    lon: t.String,
    next: t.String,
    updated: t.Integer,
}, 'Meta');

const Events = t.struct({
    results: t.list(Event),
    meta: Meta,
}, 'Events');

const getCities = async () => {
    const query = queryString.stringify({
        country: 'FR',
        limit: 1000,
        key: meetupApiKey,
    });
    const url = `https://api.meetup.com/2/cities?${query}`;
    const response = await fetch(url);

    if (200 !== response.status) {
        throw new Error('Request failed: ' + response);
    }

    const json = await response.json();

    return json.results
        .filter(city => city.ranking <= 20)
        .map(city => new City(city));
};

const findTechGroupsByCity = async (city) => {
    const query = queryString.stringify({
        location: city.city,
        radius: 0,
        category: 34,
        key: meetupApiKey,
    });
    const url = `https://api.meetup.com/find/groups?${query}`;
    const response = await fetch(url);

    if (200 !== response.status) {
        throw new Error(`Request failed: [${response.statusCode}]`);
    }

    const json = await response.json();

    return json.map(group => new Group(group));
};

const findPastEvents = async (groupIds) => {
    const beginningOf2017 = new Date('January 01, 2017 00:00:00 UTC');
    const endOf2017 = new Date('December 31, 2017 23:59:59 UTC');
    const query = queryString.stringify({
        group_id: groupIds.join(','),
        status: 'past',
        limited_events: false,
        page: 200,
        time: `${beginningOf2017.getTime()},${endOf2017.getTime()}`,
    });
    const url = `https://api.meetup.com/2/events?${query}`;
    const response = await fetch(url);

    if (429 === response.status) {
        console.log(response.status);
        console.log(response.headers);
    }

    if (200 !== response.status) {
        throw new Error(`Request failed: [${response.statusCode}]`);
    }

    const json = await response.json();

    return new Events(json);
};

const importPastEvents = async () => {
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
                city: montpellier.city, // @todo change this
                time: moment(event.time + event.utc_offset).utc().format(),
                attendees: event.yes_rsvp_count,
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
                    await client.query('INSERT INTO events(id, name, link, city, time, attendees, event_group) VALUES($1, $2, $3, $4, $5, $6, $7)', Object.values(event));
                });
                await client.query('COMMIT');
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }
        })().catch(e => console.error(e.stack));

        //console.log(events);
        //console.log(pastEvents.results.map(event => event.name));
        console.log(`Import ${pastEvents.meta.count} events from ${montpellier.city}`);

        // cities.forEach(async (city) => {
        //     const groups = await findTechGroupsByCity(city);
        //     console.log(groups);
        // });

        // cities.map(city => {
        //     const groups = await findTechGroupsByCity(city);
        //     console.log(groups);
        // })
    } catch (err) {
        console.log(err);
    }
};

importPastEvents();
