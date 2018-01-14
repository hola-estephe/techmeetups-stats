'use strict';

import fetch from 'node-fetch';
import queryString from 'querystring';

const request = async (resource, query = {}) => {
    try {
        // @todo merge meetupApiKey to query
        const url = `https://api.meetup.com${resource}?${queryString.stringify(query)}`;
        const response = await fetch(url);

        if (429 === response.status) {
            console.log(response.status);
            console.log(response.headers);
            throw new Error('Rate limit reached');
        }

        if (200 !== response.status) {
            console.log(response);
            throw new Error(`Request failed: [${response.status}]`);
        }

        return await response.json();
    } catch (e) {
        console.error(e.stack);
        throw e;
    }
};

export default request;
