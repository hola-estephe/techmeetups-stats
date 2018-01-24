'use strict';

import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl === undefined) {
  throw new Error('Must provide DATABASE_URL env variable');
}

export default new Pool({
  connectionString: databaseUrl,
});
