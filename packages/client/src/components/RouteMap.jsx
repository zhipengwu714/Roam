import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icons in Leaflet + bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const bathroomIcon = new L.DivIcon({
  html: '<div style="font-size:20px;text-align:center">🚻</div>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function RouteMap({ userLocation, destination, route, bathrooms }) {
  const center = [
    (userLocation.lat + destination.lat) / 2,
    (userLocation.lng + destination.lng) / 2,
  ];

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="w-full h-full rounded-xl"
      style={{ minHeight: '300px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User location */}
      <Marker position={[userLocation.lat, userLocation.lng]}>
        <Popup>You are here</Popup>
      </Marker>

      {/* Destination */}
      <Marker position={[destination.lat, destination.lng]}>
        <Popup>{destination.name}</Popup>
      </Marker>

      {/* Route polyline */}
      {route && (
        <Polyline positions={route} color="#3b82f6" weight={4} opacity={0.8} />
      )}

      {/* Bathroom markers */}
      {bathrooms?.map((b, i) => (
        <Marker key={i} position={[b.lat, b.lng]} icon={bathroomIcon}>
          <Popup>
            {b.name}
            {b.accessible && ' (Accessible)'}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
