"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";

const DEFAULT_LAT = 20;
const DEFAULT_LNG = 0;

export default function StrumbleMap() {
  const styleUrl =
    process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
    "https://demotiles.maplibre.org/style.json";

  return (
    <div className="h-[60vh] rounded-2xl overflow-hidden border">
      <Map
        mapLib={maplibregl}
        initialViewState={{ longitude: DEFAULT_LNG, latitude: DEFAULT_LAT, zoom: 1.8 }}
        mapStyle={styleUrl}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-left" />
        <Marker longitude={13.405} latitude={52.52} />
      </Map>
    </div>
  );
}