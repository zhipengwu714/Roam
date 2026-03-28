const ORS_API_KEY = process.env.ORS_API_KEY;

export async function fetchRoute(startLat, startLng, endLat, endLng, profile = 'foot-walking') {
  if (!ORS_API_KEY) {
    console.warn('ORS_API_KEY not set, returning empty route');
    return null;
  }

  const url = new URL(`https://api.openrouteservice.org/v2/directions/${profile}`);
  url.searchParams.set('api_key', ORS_API_KEY);
  url.searchParams.set('start', `${startLng},${startLat}`);
  url.searchParams.set('end', `${endLng},${endLat}`);

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    console.error('ORS API error:', res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;

  return {
    geometry: feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distance: feature.properties.summary.distance,
    duration: feature.properties.summary.duration,
  };
}
