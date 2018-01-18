'use strict';

import axios from 'axios';

const request = async (url, query = {}) => {
    try {
        // @todo merge meetupApiKey to query
        const response = await axios({
            method: 'GET',
            url: url,
            baseURL: 'https://api.meetup.com/',
            params: query,
            responseType: 'json',
        })

        // @todo move this in an Interceptor like this: https://github.com/axios/axios/issues/934#issuecomment-322003342
        if (429 === response.status) {
            console.log(response.status);
            console.log(response.headers);
            throw new Error('Rate limit reached');
        }

        return response.data;
    } catch (e) {
        console.error(e.stack);
        throw e;
    }
};

export default request;
