'use client';

import { useEffect, useRef } from 'react';
import { Map, config } from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

export default function GlobeMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY as string;
    config.apiKey = apiKey;

    // Инициализация карты
    const map = new Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/ocean/style.json?key=${apiKey}`,
      center: [10, 40], // Европа
      zoom: 2.8,
      pitch: 55,
      bearing: 0,
      maxPitch: 60,
      projection: 'globe'
      // (!)
      // terrain не включаем здесь, чтобы избежать ошибок — добавим вручную в style.load
    });

    mapRef.current = map;

    // -------------------------------
    // Правильное добавление TERRAIN
    // -------------------------------
    map.on('style.load', () => {
      // 1) Источник высот
      map.addSource('terrain-source', {
        type: 'raster-dem',
        url: `https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp?key=${apiKey}`,
        tileSize: 512,
        maxzoom: 15
      });

      // 2) Подключение terrain
      map.setTerrain({
        source: 'terrain-source',
        exaggeration: 1.2
      });

      // 3) Отключение fog для globe, чтобы убрать warnings
      map.setFog(null);
    });

    // Очистка
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />;
}
