import { Router } from 'express';
import { fetchBathrooms } from '../services/bathrooms.js';
import { fetchRoute } from '../services/routing.js';

const router = Router();

// GET /api/bathrooms?lat=&lng=&destLat=&destLng=
router.get('/', async (req, res) => {
  try {
    const { lat, lng, destLat, destLng } = req.query;

    const [bathrooms, route] = await Promise.all([
      fetchBathrooms(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(destLat),
        parseFloat(destLng)
      ),
      fetchRoute(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(destLat),
        parseFloat(destLng)
      ),
    ]);

    res.json({ bathrooms, route });
  } catch (e) {
    console.error('Failed to fetch bathrooms/route:', e);
    res.json({ bathrooms: [], route: null });
  }
});

export default router;
