'use strict';

import { MongoClient } from 'mongodb';

const mongodbUri = process.env.MONGODB_URI;
if (mongodbUri === undefined) {
  throw new Error('Must provide MONGODB_URI env variable');
}

let client;

const connection = async () => {
  if (!client) {
    client = await MongoClient.connect(mongodbUri);
  }

  return client;
};

const database = async () => {
  const client = await connection();

  return client.db(client.s.options.dbName);
};

export { connection, database };
