export async function fetchBathrooms(lat, lng, destLat, destLng) {
  const results = await Promise.allSettled([
    fetchRefugeRestrooms(lat, lng),
    fetchOverpassToilets(lat, lng, destLat, destLng),
  ]);

  const refuge = results[0].status === 'fulfilled' ? results[0].value : [];
  const overpass = results[1].status === 'fulfilled' ? results[1].value : [];

  return deduplicateByProximity([...refuge, ...overpass], 50);
}

async function fetchRefugeRestrooms(lat, lng) {
  const url = `https://www.refugerestrooms.org/api/v1/restrooms/by_location?lat=${lat}&lng=${lng}&per_page=20`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.map((r) => ({
    lat: r.latitude,
    lng: r.longitude,
    name: r.name || 'Restroom',
    accessible: r.accessible,
    source: 'refuge',
  }));
}

async function fetchOverpassToilets(lat, lng, destLat, destLng) {
  // Build bounding box around the route corridor
  const minLat = Math.min(lat, destLat) - 0.005;
  const maxLat = Math.max(lat, destLat) + 0.005;
  const minLng = Math.min(lng, destLng) - 0.005;
  const maxLng = Math.max(lng, destLng) + 0.005;

  const query = `
    [out:json][timeout:10];
    node["amenity"="toilets"](${minLat},${minLng},${maxLat},${maxLng});
    out body;
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return (data.elements || []).map((el) => ({
    lat: el.lat,
    lng: el.lon,
    name: el.tags?.name || 'Public Toilet',
    accessible: el.tags?.wheelchair === 'yes',
    source: 'overpass',
  }));
}

function deduplicateByProximity(bathrooms, thresholdMeters) {
  const result = [];
  for (const b of bathrooms) {
    const isDuplicate = result.some((existing) => {
      const dist = haversine(existing.lat, existing.lng, b.lat, b.lng);
      return dist < thresholdMeters;
    });
    if (!isDuplicate) result.push(b);
  }
  return result;
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
