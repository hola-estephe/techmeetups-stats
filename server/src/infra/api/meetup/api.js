'use strict';

import { City, Group, Venue, Event, Meta, Events } from './models';
import request from './http';

const meetupApiKey = process.env.MEETUP_API_KEY;
if (meetupApiKey === undefined) {
    throw new Error('Must provide MEETUP_API_KEY env variable');
}

const searchCities = async (query) => {
    const data = await request('/2/cities', {
        country: 'FR',
        limit: 200,
        query: query,
        key: meetupApiKey,
    });

    return data.results.map(city => new City(city));
};

const getCities = async () => {
    let data = await request('/2/cities', {
        country: 'FR',
        limit: 200,
        key: meetupApiKey,
    });
    let cities = data.results;
    let meta = data.meta;

    while ('' !== meta.next) {
        data = await request(meta.next);
        meta = data.meta;
        cities.push(...data.results);
    }

    return cities
        .sort((a, b) => b.member_count - a.member_count)
        .slice(0, 99)
        .map(city => new City(city));
};

const findTechGroupsByCity = async (city) => {
    const data = await request('/find/groups', {
        lat: city.lat,
        lon: city.lon,
        radius: 0,
        category: 34,
        key: meetupApiKey,
    });

    return data.map(group => new Group(group));
};

const findPastEvents = async (groupIds) => {
    const beginningOf2017 = new Date('January 01, 2017 00:00:00 UTC');
    const endOf2017 = new Date('December 31, 2017 23:59:59 UTC');
    let data = await request('/2/events', {
        group_id: groupIds.join(','),
        status: 'past',
        limited_events: false,
        page: 200,
        time: `${beginningOf2017.getTime()},${endOf2017.getTime()}`,
    });
    let events = data.results;
    let meta = data.meta;

    while ('' !== meta.next) {
        data = await request(meta.next);
        meta = data.meta;
        events.push(...data.results);
    }

    return events.map(event => new Event(event));
};

export {
    searchCities,
    getCities,
    findTechGroupsByCity,
    findPastEvents
};
