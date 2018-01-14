'use strict';

import { City, Group, Venue, Event, Meta, Events } from './models';
import request from './http';

const meetupApiKey = process.env.MEETUP_API_KEY;
if (meetupApiKey === undefined) {
    throw new Error('Must provide MEETUP_API_KEY env variable');
}

const getCities = async () => {
    const data = await request('/2/cities', {
        country: 'FR',
        limit: 1000,
        key: meetupApiKey,
    });

    return data.results
        .filter(city => city.ranking <= 20)
        .map(city => new City(city));
};

const findTechGroupsByCity = async (city) => {
    const data = await request('/find/groups', {
        location: city.city,
        radius: 0,
        category: 34,
        key: meetupApiKey,
    });

    return data.map(group => new Group(group));
};

const findPastEvents = async (groupIds) => {
    const beginningOf2017 = new Date('January 01, 2017 00:00:00 UTC');
    const endOf2017 = new Date('December 31, 2017 23:59:59 UTC');
    const data = await request('/2/events', {
        group_id: groupIds.join(','),
        status: 'past',
        limited_events: false,
        page: 200,
        time: `${beginningOf2017.getTime()},${endOf2017.getTime()}`,
    });

    return new Events(data);
};

export {
    getCities,
    findTechGroupsByCity,
    findPastEvents
};
