'use strict';

import express from 'express';
import database from './src/infra/database/index';

const app = express();

const router = express.Router();
router.get('/stats', async (req, res) => {
    const { rows } = await database.query(`
SELECT city->>'city' AS city, COUNT(*) AS events
FROM public.events
GROUP BY city
ORDER BY events DESC
    `);
    res.json(rows);
});
app.use(router);

app.set('port', (process.env.PORT || 3001));
app.listen(app.get('port'), () => {
    console.log(`Listening on ${app.get('port')}`);
});
