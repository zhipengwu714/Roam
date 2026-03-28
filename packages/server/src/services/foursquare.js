const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY;

// Free/cheap activity categories on Foursquare
const CATEGORY_IDS = [
  '16032', // Park
  '16020', // Garden
  '16026', // Plaza
  '10027', // Museum
  '16000', // Landmark
  '16004', // Historic site
  '16019', // Public art
  '16009', // Bridge
  '16046', // Trail
  '16035', // River
  '16008', // Beach
  '10056', // Market
  '16025', // Observation deck
].join(',');

export async function fetchNearbyFreePlaces(lat, lng, radius = 3000) {
  if (!FOURSQUARE_API_KEY) {
    console.warn('FOURSQUARE_API_KEY not set, returning empty places');
    return [];
  }

  const url = new URL('https://api.foursquare.com/v3/places/search');
  url.searchParams.set('ll', `${lat},${lng}`);
  url.searchParams.set('radius', String(radius));
  url.searchParams.set('categories', CATEGORY_IDS);
  url.searchParams.set('limit', '30');
  url.searchParams.set('sort', 'DISTANCE');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: FOURSQUARE_API_KEY,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    console.error('Foursquare API error:', res.status, await res.text());
    return [];
  }

  const data = await res.json();

  return data.results
    .filter((place) => {
      // Filter out places that are explicitly expensive (price 3-4)
      if (place.price && place.price >= 3) return false;
      return true;
    })
    .slice(0, 20)
    .map((place) => ({
      id: place.fsq_id,
      name: place.name,
      category: place.categories?.[0]?.name || 'Place',
      address: place.location?.formatted_address || place.location?.address || '',
      lat: place.geocodes?.main?.latitude,
      lng: place.geocodes?.main?.longitude,
    }));
}
