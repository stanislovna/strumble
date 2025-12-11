# PMTiles Data Directory

This directory stores extracted PMTiles basemap files for Protomaps.

## Current Setup

- **europe.pmtiles** - Europe region tileset (~500MB)
- Extracted from global tileset: https://build.protomaps.com/20251105.pmtiles
- Bounding box: -10.5°W to 40.5°E, 36.0°N to 71.0°N
- Covers: All of Europe from Portugal to Russia, North Africa to Scandinavia

## Quick Start

### Extract Europe tiles:
```bash
./setup-protomaps.sh
```

Or manually:
```bash
docker-compose --profile setup run pmtiles-extract
```

### Start services:
```bash
docker-compose up
```

## Adding More Regions

You can add additional regions to this directory:

### Example: North America
```bash
docker-compose run --rm protomaps extract \
  https://build.protomaps.com/20251105.pmtiles \
  /data/north-america.pmtiles \
  --bbox=-170,15,-50,75
```

### Example: Asia
```bash
docker-compose run --rm protomaps extract \
  https://build.protomaps.com/20251105.pmtiles \
  /data/asia.pmtiles \
  --bbox=60,-10,150,55
```

Then update your map style to point to the desired tileset:
```json
"url": "pmtiles://http://localhost:8080/asia.pmtiles"
```

## Bounding Boxes

Common region bounding boxes (format: west,south,east,north):

| Region | Bounding Box |
|--------|--------------|
| Europe | -10.5,36.0,40.5,71.0 |
| North America | -170,15,-50,75 |
| South America | -82,-56,-34,13 |
| Africa | -18,-35,52,38 |
| Asia | 60,-10,150,55 |
| Oceania | 110,-48,180,-10 |

## File Sizes

| Tileset | Approximate Size |
|---------|------------------|
| Global | ~15 GB |
| Europe | ~500 MB |
| North America | ~1.2 GB |
| Asia | ~2 GB |

## Updating Tiles

To get the latest tiles:

1. Check for new builds: https://protomaps.com/downloads/osm
2. Update the date in docker-compose.yaml extract command
3. Delete old tiles: `rm data/europe.pmtiles`
4. Re-run: `./setup-protomaps.sh`

## Troubleshooting

### Extract fails
- Check internet connection
- Verify bounding box coordinates
- Ensure enough disk space

### Tiles not loading
- Verify file exists: `ls -lh data/europe.pmtiles`
- Check protomaps service is running: `docker-compose ps`
- Check URL in map style matches filename

### Out of disk space
- Extract smaller regions instead of global
- Delete unused tilesets
- Use compression: PMTiles is already compressed

## Resources

- **PMTiles Spec**: https://docs.protomaps.com/pmtiles
- **Protomaps Builds**: https://protomaps.com/downloads/osm
- **Bounding Box Tool**: http://bboxfinder.com/
