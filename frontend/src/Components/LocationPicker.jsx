import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Crosshair, Loader2 } from 'lucide-react';

// Fix for default marker icon issues in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map center updates
const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13);
    }
  }, [center, map]);
  return null;
};

const LocationMarker = ({ setLocation, position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLocation({ 
        lat: e.latlng.lat, 
        lng: e.latlng.lng,
        address: `Pinned Location (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})` 
      });
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const LocationPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  const [center, setCenter] = useState([27.7172, 85.3240]); // Default Kathmandu
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  // Function to handle address search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setSearching(true);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        
        setCenter([newPos.lat, newPos.lng]);
        setPosition(newPos);
        onLocationSelect({
          lat: newPos.lat,
          lng: newPos.lng,
          address: display_name
        });
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching location');
    } finally {
      setSearching(false);
    }
  };

  // Function to get current location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = { lat: latitude, lng: longitude };
        
        setCenter([latitude, longitude]);
        setPosition(newPos);
        onLocationSelect({
          lat: latitude,
          lng: longitude,
          address: 'Current Location'
        });
        setLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to retrieve your location');
        setLocating(false);
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Locate Controls */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search location (e.g. Kathmandu)..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <button
          onClick={handleSearch}
          disabled={searching}
          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
        >
          {searching ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
        </button>
        <button
          onClick={handleLocateMe}
          disabled={locating}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          title="Locate Me"
        >
          {locating ? <Loader2 className="animate-spin" size={20} /> : <Crosshair size={20} />}
        </button>
      </div>

      {/* Map */}
      <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative z-0">
        <MapContainer 
          center={center} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={center} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            setLocation={onLocationSelect} 
            position={position} 
            setPosition={setPosition} 
          />
        </MapContainer>
        <div className="absolute bottom-2 left-2 bg-white/90 p-2 rounded-lg text-xs font-bold shadow-md z-[401]">
            Click to pin or use search/locate
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
