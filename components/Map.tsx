"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useState, useMemo } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { usePlaces, type Place } from "@/lib/queries/places";
import Link from "next/link";

const DEFAULT_LAT = 20;
const DEFAULT_LNG = 0;

export default function StrumbleMap() {
  const { data: places, isLoading } = usePlaces();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const styleUrl =
    process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
    "https://demotiles.maplibre.org/style.json";

  // Create markers for all places
  const markers = useMemo(() => {
    if (!places || places.length === 0) return [];

    return places.map((place) => (
      <Marker
        key={place.id}
        longitude={place.lng}
        latitude={place.lat}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setSelectedPlace(place);
        }}
      >
        <div
          className="cursor-pointer transform hover:scale-110 transition-transform"
          title={place.name}
        >
          {/* Custom marker pin */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#EF4444">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </Marker>
    ));
  }, [places]);

  return (
    <div className="h-[60vh] rounded-2xl overflow-hidden border relative">
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
          Loading places...
        </div>
      )}

      {/* Places count */}
      {places && places.length > 0 && (
        <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-lg shadow text-sm z-10">
          {places.length} {places.length === 1 ? 'place' : 'places'}
        </div>
      )}

      <Map
        mapLib={maplibregl}
        initialViewState={{
          longitude: DEFAULT_LNG,
          latitude: DEFAULT_LAT,
          zoom: 1.8
        }}
        mapStyle={styleUrl}
        style={{ width: "100%", height: "100%" }}
        onClick={() => setSelectedPlace(null)}
      >
        <NavigationControl position="top-left" />

        {/* Render all place markers */}
        {markers}

        {/* Popup when a place is selected */}
        {selectedPlace && (
          <Popup
            longitude={selectedPlace.lng}
            latitude={selectedPlace.lat}
            anchor="top"
            onClose={() => setSelectedPlace(null)}
            closeButton={true}
            closeOnClick={false}
            className="place-popup"
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold text-lg mb-1">
                {selectedPlace.name}
              </h3>
              {selectedPlace.country && (
                <p className="text-sm text-gray-600 mb-3">
                  📍 {selectedPlace.country}
                </p>
              )}
              <div className="flex flex-col gap-2">
                <Link
                  href={`/place/${selectedPlace.id}`}
                  className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-center transition-colors"
                >
                  View Stories
                </Link>
                <Link
                  href={`/submit/story?placeId=${selectedPlace.id}`}
                  className="text-sm bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 text-center transition-colors"
                >
                  Add Story
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}