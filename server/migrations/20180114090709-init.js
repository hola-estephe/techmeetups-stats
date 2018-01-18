'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};

exports.up = function (db) {
    return db.createTable('events', {
        id: { type: 'uuid', primaryKey: true },
        event_id: { type: 'string' },
        name: 'string',
        link: 'string',
        time: 'timestamp',
        attendees: 'int',
        city: 'jsonb',
        event_group: 'jsonb',
    });
};

exports.down = function (db) {
    return db.dropTable('events');
};

exports._meta = {
    version: 1
};
