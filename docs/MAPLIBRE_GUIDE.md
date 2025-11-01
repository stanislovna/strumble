# MapLibre Integration Guide for Strumble

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Frontend Map                      │
│  (MapLibre GL + react-map-gl)                       │
└────────────────┬────────────────────────────────────┘
                 │
                 ├─→ Fetch places from API
                 │   GET /api/places
                 │
                 ├─→ Display markers on map
                 │   (countries, cities, villages)
                 │
                 └─→ Click marker → Navigate to place page
                     /place/{placeId} → Create story
```

## Database Schema

Your `places` table:
```sql
CREATE TABLE places (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,      -- Latitude
    lng DECIMAL(11, 8) NOT NULL,      -- Longitude
    slug VARCHAR(255) UNIQUE NOT NULL,
    country VARCHAR(100),
    continent VARCHAR(50),
    description TEXT
);
```

## Libraries You Already Have ✅

1. **maplibre-gl** - Core mapping engine
   - Docs: https://maplibre.org/maplibre-gl-js/docs/
   - GitHub: https://github.com/maplibre/maplibre-gl-js

2. **react-map-gl** - React wrapper
   - Docs: https://visgl.github.io/react-map-gl/
   - Examples: https://visgl.github.io/react-map-gl/examples

3. **@supabase/supabase-js** - Database connection

## Implementation Steps

### Step 1: Create Places API

Create `/app/api/places/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bounds = searchParams.get('bounds') // Optional: for viewport filtering

  try {
    const supabase = await createClient()

    let query = supabase
      .from('places')
      .select('id, name, lat, lng, slug, country, continent')

    // Optional: Filter by bounds for performance
    if (bounds) {
      const [south, west, north, east] = bounds.split(',').map(Number)
      query = query
        .gte('lat', south)
        .lte('lat', north)
        .gte('lng', west)
        .lte('lng', east)
    }

    const { data: places, error } = await query.limit(1000)

    if (error) throw error

    return NextResponse.json({ places })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch places' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, lat, lng, country, continent, description } = body

    const supabase = await createClient()

    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-')

    const { data: place, error } = await supabase
      .from('places')
      .insert({ name, lat, lng, slug, country, continent, description })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ place }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create place' },
      { status: 500 }
    )
  }
}
```

### Step 2: Create React Query Hook

Create `/lib/queries/places.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function usePlaces() {
  return useQuery({
    queryKey: ['places'],
    queryFn: async () => {
      const response = await fetch('/api/places')
      if (!response.ok) throw new Error('Failed to fetch places')
      const data = await response.json()
      return data.places
    },
  })
}

export function useCreatePlace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (place: {
      name: string
      lat: number
      lng: number
      country?: string
      continent?: string
    }) => {
      const response = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(place),
      })
      if (!response.ok) throw new Error('Failed to create place')
      return response.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['places'] }),
  })
}
```

### Step 3: Update Map Component

Update `/components/Map.tsx`:
```typescript
"use client"

import "maplibre-gl/dist/maplibre-gl.css"
import { useState, useMemo } from "react"
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/maplibre"
import maplibregl from "maplibre-gl"
import { usePlaces } from "@/lib/queries/places"
import Link from "next/link"

const DEFAULT_LAT = 20
const DEFAULT_LNG = 0

type Place = {
  id: string
  name: string
  lat: number
  lng: number
  slug: string
  country: string | null
  continent: string | null
}

export default function StrumbleMap() {
  const { data: places, isLoading } = usePlaces()
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)

  const styleUrl =
    process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
    "https://demotiles.maplibre.org/style.json"

  // Cluster places by proximity (optional)
  const markers = useMemo(() => {
    if (!places) return []
    return places.map((place: Place) => (
      <Marker
        key={place.id}
        longitude={place.lng}
        latitude={place.lat}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation()
          setSelectedPlace(place)
        }}
      >
        <div className="cursor-pointer transform hover:scale-110 transition-transform">
          {/* Custom marker icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#EF4444">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </Marker>
    ))
  }, [places])

  return (
    <div className="h-[60vh] rounded-2xl overflow-hidden border relative">
      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
          Loading places...
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
      >
        <NavigationControl position="top-left" />

        {/* Render all place markers */}
        {markers}

        {/* Popup when place is selected */}
        {selectedPlace && (
          <Popup
            longitude={selectedPlace.lng}
            latitude={selectedPlace.lat}
            anchor="top"
            onClose={() => setSelectedPlace(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold text-lg mb-1">
                {selectedPlace.name}
              </h3>
              {selectedPlace.country && (
                <p className="text-sm text-gray-600 mb-2">
                  {selectedPlace.country}
                </p>
              )}
              <div className="flex flex-col gap-2">
                <Link
                  href={`/place/${selectedPlace.id}`}
                  className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 text-center"
                >
                  View Stories
                </Link>
                <Link
                  href={`/submit/story?placeId=${selectedPlace.id}`}
                  className="text-sm bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 text-center"
                >
                  Add Story
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}
```

## Advanced Features

### 1. Clustering (for many places)

Install clustering library:
```bash
npm install supercluster
```

Then implement clustering to group nearby markers.

### 2. Custom Map Tiles

You can use different map styles:

**Free Options:**
- MapLibre Demo Tiles: `https://demotiles.maplibre.org/style.json`
- Maptiler Free Tier: https://www.maptiler.com/ (25k free requests/month)
- Protomaps: https://protomaps.com/ (self-hosted option)

**Setup Maptiler (recommended):**
```typescript
// In your .env.local
NEXT_PUBLIC_MAPTILER_KEY=your_key_here

// In Map.tsx
const styleUrl = `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
```

### 3. Geocoding (Add places by address)

Install geocoding library:
```bash
npm install @maptiler/geocoding-control
```

Or use geocoding API to convert addresses to coordinates.

### 4. Drawing Tool (Let users click map to add places)

```typescript
import { useControl } from 'react-map-gl/maplibre'

// Add click handler to map
<Map
  onClick={(event) => {
    const { lngLat } = event
    createPlace.mutate({
      name: 'New Place',
      lat: lngLat.lat,
      lng: lngLat.lng
    })
  }}
>
```

## Data Flow

```
1. User visits homepage
   ↓
2. Map component loads
   ↓
3. usePlaces() hook fetches from /api/places
   ↓
4. API queries Supabase places table
   ↓
5. Places rendered as markers on map
   ↓
6. User clicks marker
   ↓
7. Popup shows place details
   ↓
8. User clicks "Add Story"
   ↓
9. Navigate to /submit/story?placeId={id}
   ↓
10. Story form submits to /api/stories
    ↓
11. Story linked to place via story_places table
```

## Performance Tips

1. **Limit places in viewport**: Filter by map bounds
2. **Use clustering**: Group nearby markers
3. **Lazy load**: Only fetch places when map moves
4. **Index database**: Your schema already has indexes on lat/lng

## Links

- **MapLibre GL JS**: https://maplibre.org/maplibre-gl-js/docs/
- **react-map-gl**: https://visgl.github.io/react-map-gl/
- **MapLibre Examples**: https://maplibre.org/maplibre-gl-js/docs/examples/
- **Maptiler (free tiles)**: https://www.maptiler.com/
- **Protomaps**: https://protomaps.com/
- **GeoJSON Tools**: https://geojson.io/ (for testing)

## Next Steps

1. Create `/app/api/places/route.ts`
2. Create `/lib/queries/places.ts`
3. Update `/components/Map.tsx`
4. Update `/app/submit/story/page.tsx` to accept placeId query param
5. Seed your database with places
