import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getBathrooms } from '../lib/api';
import RouteMap from '../components/RouteMap';

export default function MapResult() {
  const { code } = useParams();
  const location = useLocation();
  const { winner, votes, places } = location.state || {};

  const [route, setRoute] = useState(null);
  const [bathrooms, setBathrooms] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!winner) return;

    // Get user location then fetch route + bathrooms
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);

        try {
          const data = await getBathrooms(loc.lat, loc.lng, winner.lat, winner.lng);
          setRoute(data.route?.geometry || null);
          setBathrooms(data.bathrooms || []);
        } catch (e) {
          console.error('Failed to fetch route/bathrooms:', e);
        }
        setLoading(false);
      },
      () => {
        // Fallback: use a default location near the winner
        const fallback = { lat: winner.lat + 0.005, lng: winner.lng + 0.005 };
        setUserLocation(fallback);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [winner]);

  if (!winner) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-gray-400">No results available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-lg mx-auto">
        <p className="text-gray-400 text-sm uppercase tracking-wider mb-1 text-center">
          The group has spoken!
        </p>
        <h1 className="text-3xl font-bold mb-1 text-center">{winner.name}</h1>
        <p className="text-gray-400 text-center mb-1">{winner.category}</p>
        <p className="text-gray-500 text-sm text-center mb-6">{winner.address}</p>

        <div className="w-full h-80 mb-6">
          {loading || !userLocation ? (
            <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center">
              <p className="text-gray-500">Loading map...</p>
            </div>
          ) : (
            <RouteMap
              userLocation={userLocation}
              destination={winner}
              route={route}
              bathrooms={bathrooms}
            />
          )}
        </div>

        {bathrooms.length > 0 && (
          <p className="text-gray-400 text-sm text-center mb-4">
            {bathrooms.length} bathroom{bathrooms.length !== 1 ? 's' : ''} along the route
          </p>
        )}

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${winner.lat},${winner.lng}&travelmode=walking`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-semibold text-center"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
