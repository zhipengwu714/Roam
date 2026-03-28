const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function createSession(lat, lng) {
  const res = await fetch(`${API_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng }),
  });
  return res.json();
}

export async function getSession(code) {
  const res = await fetch(`${API_URL}/sessions/${code}`);
  if (!res.ok) throw new Error('Session not found');
  return res.json();
}

export async function getBathrooms(lat, lng, destLat, destLng) {
  const res = await fetch(
    `${API_URL}/bathrooms?lat=${lat}&lng=${lng}&destLat=${destLat}&destLng=${destLng}`
  );
  return res.json();
}
