import { useEffect, useRef, useState } from 'react';
import { DiscoveredBusiness } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface MapContainerProps {
  businesses: DiscoveredBusiness[];
  city: string;
  state: string;
  hoveredBusinessId: string | null;
  selectedBusinessId: string | null;
  onMarkerClick: (business: DiscoveredBusiness) => void;
  onMarkerHover: (businessId: string) => void;
  onMarkerLeave: () => void;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export const MapContainer = ({
  businesses,
  city,
  state,
  hoveredBusinessId,
  selectedBusinessId,
  onMarkerClick,
  onMarkerHover,
  onMarkerLeave,
}: MapContainerProps) => {
  const { theme } = useTheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (window.google) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 30.2672, lng: -97.7431 }, // Default to Austin
      zoom: 12,
      styles: theme === 'dark' ? [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      ] : [],
    });

    mapInstanceRef.current = map;
  }, [mapLoaded, theme]);

  // Geocode city to center map
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !city || !state) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { address: `${city}, ${state}` },
      (results: any[], status: string) => {
        if (status === 'OK' && results[0]) {
          mapInstanceRef.current.setCenter(results[0].geometry.location);
          mapInstanceRef.current.setZoom(12);
        }
      }
    );
  }, [mapLoaded, city, state]);

  // Update markers
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (businesses.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    businesses.forEach((business) => {
      const position = { lat: business.lat, lng: business.lng };
      bounds.extend(position);

      const isSelected = selectedBusinessId === business.id;
      const isHovered = hoveredBusinessId === business.id;

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: business.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 10 : isHovered ? 8 : 6,
          fillColor: isSelected ? '#6366f1' : isHovered ? '#818cf8' : '#94a3b8',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        animation: window.google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        onMarkerClick(business);
      });

      marker.addListener('mouseover', () => {
        onMarkerHover(business.id);
      });

      marker.addListener('mouseout', () => {
        onMarkerLeave();
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (businesses.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
      if (mapInstanceRef.current.getZoom() > 15) {
        mapInstanceRef.current.setZoom(15);
      }
    }
  }, [mapLoaded, businesses, selectedBusinessId, hoveredBusinessId, onMarkerClick, onMarkerHover, onMarkerLeave]);

  const cardBg = theme === 'dark' ? 'bg-[#111827] border-[#1F2937]' : 'bg-white border-gray-200';

  return (
    <div className={`flex-1 ${cardBg} border rounded-xl h-[600px] relative overflow-hidden transition-colors duration-200`}>
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-500">Loading map...</div>
        </div>
      )}
    </div>
  );
};
