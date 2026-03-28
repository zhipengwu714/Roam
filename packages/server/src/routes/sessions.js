import { Router } from 'express';
import { createSession, getSession } from '../sessionStore.js';
import { fetchNearbyFreePlaces } from '../services/foursquare.js';

const router = Router();

// Fallback places when Foursquare API key is not set
const FALLBACK_PLACES = [
  { id: 'p1', name: 'Central Park', category: 'Park', address: 'Manhattan, NY', lat: 40.7829, lng: -73.9654 },
  { id: 'p2', name: 'Brooklyn Bridge', category: 'Landmark', address: 'Brooklyn, NY', lat: 40.7061, lng: -73.9969 },
  { id: 'p3', name: 'The High Line', category: 'Park', address: 'Chelsea, NY', lat: 40.748, lng: -74.0048 },
  { id: 'p4', name: 'Washington Square Park', category: 'Park', address: 'Greenwich Village, NY', lat: 40.7308, lng: -73.9973 },
  { id: 'p5', name: 'Times Square', category: 'Plaza', address: 'Midtown, NY', lat: 40.758, lng: -73.9855 },
  { id: 'p6', name: 'Grand Central Terminal', category: 'Landmark', address: 'Midtown, NY', lat: 40.7527, lng: -73.9772 },
  { id: 'p7', name: 'DUMBO Waterfront', category: 'Viewpoint', address: 'Brooklyn, NY', lat: 40.7033, lng: -73.9894 },
  { id: 'p8', name: 'Roosevelt Island', category: 'Island', address: 'Roosevelt Island, NY', lat: 40.762, lng: -73.95 },
  { id: 'p9', name: 'Hudson Yards Vessel', category: 'Art', address: 'Hudson Yards, NY', lat: 40.7536, lng: -74.0022 },
  { id: 'p10', name: 'Battery Park', category: 'Park', address: 'Lower Manhattan, NY', lat: 40.7033, lng: -74.0170 },
  { id: 'p11', name: 'Chinatown', category: 'Neighborhood', address: 'Lower Manhattan, NY', lat: 40.7158, lng: -73.997 },
  { id: 'p12', name: 'SoHo Streets', category: 'Neighborhood', address: 'SoHo, NY', lat: 40.7233, lng: -73.9985 },
  { id: 'p13', name: 'Prospect Park', category: 'Park', address: 'Brooklyn, NY', lat: 40.6602, lng: -73.969 },
  { id: 'p14', name: 'Williamsburg Bridge Walk', category: 'Walk', address: 'Williamsburg, NY', lat: 40.7134, lng: -73.9724 },
  { id: 'p15', name: 'East River Esplanade', category: 'Walk', address: 'East Side, NY', lat: 40.7468, lng: -73.9718 },
];

// POST /api/sessions — create a new session
router.post('/', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    let places = await fetchNearbyFreePlaces(lat, lng);
    if (places.length === 0) {
      places = FALLBACK_PLACES;
    }
    const session = createSession(null, places);
    res.json({ code: session.code, places: session.places });
  } catch (e) {
    console.error('Failed to create session:', e);
    const session = createSession(null, FALLBACK_PLACES);
    res.json({ code: session.code, places: session.places });
  }
});

// GET /api/sessions/:code — get session state
router.get('/:code', (req, res) => {
  const session = getSession(req.params.code);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json({
    code: session.code,
    users: session.users.map((u) => ({ nickname: u.nickname })),
    places: session.places,
    votes: session.votes,
    phase: session.phase,
    timerDuration: session.timerDuration,
    timerStartedAt: session.timerStartedAt,
  });
});

export default router;
