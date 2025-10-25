'use client';

import { useEffect, useState } from 'react';

interface MapPreviewProps {
  latitude: number | "";
  longitude: number | "";
}

export default function MapPreview({ latitude, longitude }: MapPreviewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show placeholder if coordinates are not provided or component is not hydrated
  if (!isClient || latitude === "" || longitude === "" || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return (
      <div className="h-40 bg-gray-100 rounded grid place-items-center text-xs text-gray-600">
        [ Map preview placeholder ]
      </div>
    );
  }

  // Create OpenStreetMap embed URL
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className="h-40 w-full">
      <iframe
        width="100%"
        height="100%"
        src={mapUrl}
        style={{ border: 'none', borderRadius: '0.5rem' }}
        title="Location Map"
        loading="lazy"
      />
    </div>
  );
}
