'use strict';

import axios from 'axios';

const request = async (url, query = {}) => {
    try {
        // @todo merge meetupApiKey to query
        const response = await axios({
            method: 'GET',
            url: url,
            baseURL: 'https://api.meetup.com/',
            timeout: 0,
            params: query,
            responseType: 'json',
        });

        // @todo move this in an Interceptor like this: https://github.com/axios/axios/issues/934#issuecomment-322003342
        if (429 === response.status) {
            console.log(response.status);
            console.log(response.headers);
            throw new Error('Rate limit reached');
        }

        return response.data;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);

            const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
            await sleep(1000);

            return request(url, query);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
        }

        throw error;
    }
};

export default request;
