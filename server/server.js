'use strict';

import express from 'express';
import database from './src/infra/database/index';

const app = express();

const router = express.Router();
router.get('/stats', async (req, res) => {
    const { rows } = await database.query(`
SELECT city, COUNT(*) AS events
FROM public.events
GROUP BY city
HAVING COUNT(*) > 50
ORDER BY events DESC
    `);
    res.json(rows);
});

router.get('/events.geojson', async (req, res) => {
    const { rows } = await database.query(`
SELECT id, link, city, venue
FROM public.events
    `);

    res.json({
        type: "FeatureCollection",
        features: rows.map(event => {
            return {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [
                        event.venue ? event.venue.lon : event.city.lon,
                        event.venue ? event.venue.lat : event.city.lat
                    ],
                },
                properties: {
                    id: event.id,
                },
            };
        }),
    });
});

app.use(router);

app.set('port', (process.env.PORT || 3001));
app.listen(app.get('port'), () => {
    console.log(`Listening on ${app.get('port')}`);
});
