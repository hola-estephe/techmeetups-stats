'use strict';

import express from 'express';
import { connection, database } from './src/infra/database/index';

const app = express();

const router = express.Router();
router.get('/stats', async (req, res) => {
  const db = await database();
  const result = await db.collection('events').aggregate([
    {
      "$group": {
        _id: "$city.city",
        city: { $addToSet: "$city" },
        events: { "$sum": 1 }
      }
    }
  ]).toArray();

  res.json(result.map(stats => {
    return { city: stats.city, events: stats.events };
  }));
});

router.get('/events.geojson', async (req, res) => {
  const db = await database();
  const events = await db.collection('events').find().toArray();

  res.json({
    type: "FeatureCollection",
    features: events.map(event => {
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
