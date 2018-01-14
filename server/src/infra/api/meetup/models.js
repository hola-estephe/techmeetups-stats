'use strict';

import t from 'tcomb';

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

export {
    City,
    Group,
    Venue,
    Event,
    Meta,
    Events,
}
