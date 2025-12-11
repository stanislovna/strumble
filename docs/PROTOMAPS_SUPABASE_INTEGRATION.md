# Protomaps + Supabase Integration Guide

Complete guide to integrating Protomaps self-hosted maps with your Supabase-powered Strumble application.

## Table of Contents

1. [What is Protomaps?](#what-is-protomaps)
2. [Architecture Overview](#architecture-overview)
3. [Quick Start](#quick-start)
4. [Supabase Integration](#supabase-integration)
5. [Custom Styling](#custom-styling)
6. [Advanced Features](#advanced-features)
7. [Production Deployment](#production-deployment)

---

## What is Protomaps?

**Protomaps** is an open-source mapping system that allows you to:
- ✅ **Self-host** map tiles (no API keys needed!)
- ✅ **No rate limits** or usage costs
- ✅ **Full control** over map styling
- ✅ **Offline capable** - works without internet
- ✅ **Small file size** - efficient PMTiles format
- ✅ **Fast** - optimized for performance

### vs. Other Solutions

| Feature | Protomaps | Mapbox | Google Maps | Maptiler |
|---------|-----------|--------|-------------|----------|
| Self-hosted | ✅ Yes | ❌ No | ❌ No | Paid |
| API Keys | ❌ Not needed | ✅ Required | ✅ Required | ✅ Required |
| Rate Limits | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| Cost | 🆓 Free | 💰 Pay per use | 💰 Pay per use | 💰 Freemium |
| Offline | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Custom Styling | ✅ Full control | ✅ Yes | Limited | ✅ Yes |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Your Application                     │
│                                                          │
│  ┌──────────────┐         ┌─────────────────┐          │
│  │   Next.js    │────────▶│   MapLibre GL   │          │
│  │  (React UI)  │         │  (Map Renderer) │          │
│  └──────────────┘         └─────────────────┘          │
│         │                           │                    │
│         │                           │                    │
│         ▼                           ▼                    │
│  ┌──────────────┐         ┌─────────────────┐          │
│  │   Supabase   │         │   Protomaps     │          │
│  │  (Database)  │         │  (Tile Server)  │          │
│  │              │         │                 │          │
│  │ • Places     │         │ • Basemap tiles │          │
│  │ • Stories    │         │ • PMTiles file  │          │
│  │ • Styles     │         │ • Local/Docker  │          │
│  └──────────────┘         └─────────────────┘          │
└─────────────────────────────────────────────────────────┘

Flow:
1. User opens map → MapLibre loads
2. MapLibre fetches places from Supabase API
3. MapLibre renders basemap from Protomaps
4. User clicks marker → Story data from Supabase
5. User creates story → Saved to Supabase
```

---

## Quick Start

### Step 1: Start Protomaps Server

```bash
# Start all services including Protomaps
docker-compose up
```

This starts:
- ✅ Next.js app on port **3000**
- ✅ Protomaps server on port **8080**

### Step 2: Download Basemap (Optional)

For self-hosting, download a basemap:

```bash
cd protomaps
chmod +x download-basemap.sh
./download-basemap.sh
```

Select a size:
- **Tiny (100MB)** - Good for testing
- **Low Detail (1GB)** - Global view
- **Medium (5GB)** - Production recommended
- **High Detail (15GB)** - Full OSM data

### Step 3: Verify Setup

Open your browser to http://localhost:3000

You should see:
- 🗺️ Beautiful map with nice styling
- 📍 Place markers from your database
- 🎨 Custom colors and labels

---

## Supabase Integration

### Database Schema

Your `places` table already has everything needed:

```sql
CREATE TABLE places (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,    -- Latitude for map
    lng DECIMAL(11, 8) NOT NULL,    -- Longitude for map
    slug VARCHAR(255) UNIQUE,
    country VARCHAR(100),
    continent VARCHAR(50),
    description TEXT
);
```

### Data Flow

```
User clicks map marker
    ↓
MapLibre popup opens
    ↓
Shows place data from Supabase
    ↓
User clicks "Add Story"
    ↓
Story form with placeId
    ↓
POST /api/stories
    ↓
Story saved to Supabase
    ↓
Linked via story_places table
```

### API Endpoints

Your app uses these APIs to connect map to database:

```typescript
// Fetch places for map markers
GET /api/places
Response: { places: [{ id, name, lat, lng, country }] }

// Create new story for a place
POST /api/stories
Body: { placeId, answerText, tags }
Response: { success: true, story: {...} }

// Get stories for a place
GET /api/stories?placeId={uuid}
Response: { stories: [...] }
```

---

## Custom Styling

### Map Style Location

The map style is located at:
```
public/map-style.json
```

### Color Scheme

Current colors (light theme):

| Element | Color | Description |
|---------|-------|-------------|
| Background | `#f8f9fa` | Light gray |
| Water | `#aad3df` | Light blue |
| Parks | `#d4edda` | Light green |
| Roads | `#ffffff` | White |
| Highways | `#ffc107` | Yellow/Gold |
| Buildings | `#d9d9d9` | Gray |
| Labels | `#212529` | Dark gray |

### Customize Colors

Edit `public/map-style.json`:

```json
{
  "id": "water",
  "type": "fill",
  "paint": {
    "fill-color": "#0066cc"  // Change to your preferred blue
  }
}
```

### Store Styles in Supabase

For dynamic styling, store map styles in Supabase:

#### 1. Create Table

```sql
CREATE TABLE map_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    style_json JSONB NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Create API Endpoint

```typescript
// app/api/map-style/route.ts
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: style } = await supabase
    .from('map_styles')
    .select('style_json')
    .eq('is_active', true)
    .single()

  return Response.json(style?.style_json || defaultStyle)
}
```

#### 3. Update Map Component

```typescript
// Fetch style from Supabase
const styleUrl = '/api/map-style'
```

---

## Advanced Features

### 1. Storing Protomaps in Supabase Storage

For cloud deployment, store PMTiles in Supabase Storage:

#### Create Storage Bucket

```sql
-- In Supabase dashboard: Storage → Create bucket
-- Bucket name: "map-tiles"
-- Public: Yes
```

#### Upload PMTiles

```bash
# Using Supabase CLI
supabase storage upload map-tiles/basemap.pmtiles ./protomaps/basemap.pmtiles
```

#### Update Map Style

```json
{
  "sources": {
    "protomaps": {
      "type": "vector",
      "url": "https://your-project.supabase.co/storage/v1/object/public/map-tiles/basemap.pmtiles"
    }
  }
}
```

### 2. User-Created Places with Geocoding

Allow users to add places by clicking the map:

```typescript
// In Map component
<Map
  onClick={async (event) => {
    const { lngLat } = event

    // Reverse geocode to get place name
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `lat=${lngLat.lat}&lon=${lngLat.lng}&format=json`
    )
    const data = await response.json()

    // Create place in Supabase
    await fetch('/api/places', {
      method: 'POST',
      body: JSON.stringify({
        name: data.display_name,
        lat: lngLat.lat,
        lng: lngLat.lng,
        country: data.address.country
      })
    })
  }}
>
```

### 3. Place Categories and Filtering

Add categories to places:

```sql
ALTER TABLE places ADD COLUMN category VARCHAR(50);
CREATE INDEX idx_places_category ON places(category);
```

Filter by category:

```typescript
// Fetch only restaurants
GET /api/places?category=restaurant

// In API route
const { category } = searchParams
if (category) {
  query = query.eq('category', category)
}
```

### 4. Heat Maps for Popular Places

Show story density:

```typescript
// Count stories per place
SELECT
  p.id, p.name, p.lat, p.lng,
  COUNT(sp.story_id) as story_count
FROM places p
LEFT JOIN story_places sp ON p.id = sp.place_id
GROUP BY p.id
```

Visualize with marker size:

```typescript
<Marker
  latitude={place.lat}
  longitude={place.lng}
>
  <div style={{
    width: `${10 + place.story_count * 2}px`,
    height: `${10 + place.story_count * 2}px`
  }}>
    📍
  </div>
</Marker>
```

### 5. Custom Map Overlays

Add custom GeoJSON layers from Supabase:

```sql
CREATE TABLE map_overlays (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    geojson JSONB,
    style JSONB
);
```

Render overlay:

```typescript
import { Source, Layer } from 'react-map-gl/maplibre'

<Source type="geojson" data={overlay.geojson}>
  <Layer {...overlay.style} />
</Source>
```

---

## Production Deployment

### Option 1: Self-Hosted Protomaps (Recommended)

Best for: Full control, no external dependencies

**Deploy Protomaps to your server:**

```bash
# On your server
docker run -d \
  -p 8080:8080 \
  -v /path/to/basemap.pmtiles:/tiles/basemap.pmtiles \
  protomaps/go-pmtiles serve /tiles --cors="*"
```

**Update map style URL:**

```env
NEXT_PUBLIC_MAP_TILES_URL=https://tiles.yourdomain.com
```

### Option 2: Supabase Storage + CDN

Best for: Scalability, global distribution

1. **Upload to Supabase Storage**
2. **Enable CDN** (Supabase uses Cloudflare)
3. **Update map URL** to storage URL

### Option 3: Hybrid (Recommended for Production)

- **Basemap**: Protomaps server (your infrastructure)
- **Data**: Supabase (places, stories, users)
- **Assets**: Supabase Storage (photos, audio)
- **App**: Vercel/Netlify (Next.js)

```
┌─────────────────────────────────────┐
│         Users (Global)              │
└─────────────┬───────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
┌────────┐         ┌──────────┐
│ Vercel │         │ Supabase │
│Next.js │◀────────│ Database │
└────┬───┘         └──────────┘
     │
     ▼
┌──────────────┐
│  Protomaps   │
│ Tile Server  │
│ (Your VPS)   │
└──────────────┘
```

### Environment Variables

```env
# Production .env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_MAP_STYLE_URL=https://your-app.com/map-style.json
PROTOMAPS_TILES_URL=https://tiles.yourdomain.com
```

---

## Performance Optimization

### 1. Viewport-Based Loading

Only load places in current view:

```typescript
const [bounds, setBounds] = useState<string>()

<Map
  onMoveEnd={(e) => {
    const b = e.target.getBounds()
    setBounds(`${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`)
  }}
>

// Fetch places with bounds
usePlaces(bounds)
```

### 2. Place Clustering

For many places, use clustering:

```bash
npm install supercluster
```

```typescript
import Supercluster from 'supercluster'

const cluster = new Supercluster({
  radius: 40,
  maxZoom: 16
})
```

### 3. Cached Tiles

Cache tiles in Service Worker:

```typescript
// service-worker.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('pmtiles')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    )
  }
})
```

### 4. Lazy Load Stories

Load stories only when marker is clicked:

```typescript
const [selectedPlace, setSelectedPlace] = useState(null)
const { data: stories } = useStories(selectedPlace?.id, {
  enabled: !!selectedPlace  // Only fetch when place selected
})
```

---

## Troubleshooting

### Map not loading

1. Check Protomaps server is running: `curl http://localhost:8080`
2. Check basemap exists: `ls -lh protomaps/basemap.pmtiles`
3. Check browser console for errors

### Markers not appearing

1. Verify places in database: `SELECT COUNT(*) FROM places;`
2. Check API response: `curl http://localhost:3000/api/places`
3. Check browser network tab

### Slow map performance

1. Download smaller basemap region
2. Enable place clustering
3. Use viewport-based loading
4. Optimize database indexes

---

## Resources

### Documentation
- **Protomaps**: https://protomaps.com/
- **PMTiles Spec**: https://docs.protomaps.com/pmtiles
- **MapLibre**: https://maplibre.org/
- **Supabase Storage**: https://supabase.com/docs/guides/storage

### Downloads
- **Protomaps Builds**: https://protomaps.com/downloads/osm
- **PMTiles Tools**: https://github.com/protomaps/go-pmtiles
- **MapLibre Styles**: https://github.com/maplibre/maplibre-gl-styles

### Community
- **Protomaps Discord**: https://protomaps.com/discord
- **MapLibre Slack**: https://maplibre.org/slack
- **Supabase Discord**: https://discord.supabase.com

---

## Summary

You now have:
- ✅ Self-hosted Protomaps tile server in Docker
- ✅ Beautiful custom map styling
- ✅ Places stored in Supabase
- ✅ Stories linked to places
- ✅ Interactive map with popups
- ✅ Production-ready architecture

**Next steps:**
1. Customize map colors in `public/map-style.json`
2. Add more places to your database
3. Create stories for places
4. Deploy to production

Happy mapping! 🗺️
