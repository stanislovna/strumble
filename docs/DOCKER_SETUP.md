# Docker Setup Guide

This guide explains how to run the Strumble application using Docker and Docker Compose.

## Prerequisites

Make sure you have installed:

- **Docker**: https://docs.docker.com/get-docker/
- **Docker Compose**: https://docs.docker.com/compose/install/

To verify installation:
```bash
docker --version
docker-compose --version
```

## Quick Start

### 1. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_DB_URL=postgresql://postgres:password@host:port/database
```

**Where to find these values:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

### 2. Setup Protomaps (First Time Only)

Extract Europe map tiles (one-time setup):

```bash
./setup-protomaps.sh
```

This will:
- Download and extract Europe region (~500MB)
- Start all services automatically

**Alternative - Manual extraction:**
```bash
docker-compose --profile setup run pmtiles-extract
docker-compose up
```

### 3. Start the Application

```bash
docker-compose up
```

Or run in detached mode (background):
```bash
docker-compose up -d
```

The application will be available at: **http://localhost:3000**

### 4. Stop the Application

```bash
docker-compose down
```

## Docker Files Explained

### Dockerfile

```dockerfile
FROM node:20-alpine          # Use Node.js 20 Alpine (lightweight)
WORKDIR /app                 # Set working directory
COPY package*.json ./        # Copy package files
RUN npm install              # Install dependencies
COPY . .                     # Copy all project files
EXPOSE 3000                  # Expose port 3000
CMD ["npm", "run", "dev"]    # Start dev server
```

### docker-compose.yaml

```yaml
services:
  nextjs:
    build: .                 # Build from Dockerfile
    ports:
      - "3000:3000"          # Map port 3000 to host
    volumes:
      - .:/app               # Mount current directory
      - /app/node_modules    # Prevent overwriting node_modules
      - /app/.next           # Prevent overwriting .next build
    environment:
      - NODE_ENV=development # Set to development mode
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
```

### .dockerignore

Prevents copying unnecessary files into the Docker image:
```
node_modules    # Don't copy local node_modules
.next           # Don't copy local build
.git            # Don't copy git history
.env*.local     # Don't copy environment files
```

## Common Commands

### Build the Docker image
```bash
docker-compose build
```

### Start with rebuild (if you change dependencies)
```bash
docker-compose up --build
```

### View logs
```bash
docker-compose logs -f
```

### Stop and remove containers
```bash
docker-compose down
```

### Remove containers and volumes
```bash
docker-compose down -v
```

### Access container shell
```bash
docker-compose exec nextjs sh
```

### Install new npm package
```bash
docker-compose exec nextjs npm install package-name
```

## Development Workflow

### Hot Reload

The Docker setup uses volume mounting, so changes to your code will automatically trigger Next.js hot reload. Just edit your files and see changes in the browser!

### Adding Dependencies

When you add a new npm package:

```bash
# Install inside Docker container
docker-compose exec nextjs npm install new-package

# Or rebuild the image
docker-compose up --build
```

### Database Migrations

Run database migrations from inside the container:

```bash
# Run migrations
docker-compose exec nextjs npm run db:apply

# Seed database
docker-compose exec nextjs npm run db:seed

# Seed places
docker-compose exec nextjs sh -c 'psql "$SUPABASE_DB_URL" -f atlas/seed-places.sql'
```

## Environment Variables

The Docker container needs these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous key |
| `NEXT_PUBLIC_MAP_STYLE_URL` | No | Custom map tiles URL |
| `SUPABASE_DB_URL` | For migrations | PostgreSQL connection string |

**Two ways to provide environment variables:**

1. **Using .env.local file** (recommended for development)
   ```bash
   # Create .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

2. **Using docker-compose environment**
   ```yaml
   # In docker-compose.yaml
   environment:
     - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
   ```
   Then export in your shell:
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL=your_url
   ```

## Troubleshooting

### Port 3000 already in use

If you get "port already allocated" error:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change the port in docker-compose.yaml
ports:
  - "3001:3000"  # Use port 3001 on host
```

### Changes not reflecting

1. Make sure volumes are mounted correctly
2. Check Next.js is running in dev mode
3. Try rebuilding:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

### Node modules issues

If you have dependency issues:

```bash
# Remove node_modules volume and rebuild
docker-compose down -v
docker-compose up --build
```

### Database connection issues

1. Check your `SUPABASE_DB_URL` is correct
2. Verify Supabase project is running
3. Check network connectivity from Docker:
   ```bash
   docker-compose exec nextjs ping supabase.co
   ```

## Production Deployment

For production, create a production Dockerfile:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

Then build and run:
```bash
docker build -t strumble-prod .
docker run -p 3000:3000 --env-file .env.local strumble-prod
```

## Docker Compose with Database (Advanced)

If you want to run a local PostgreSQL database with Docker:

```yaml
version: '3.8'

services:
  nextjs:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
      - SUPABASE_DB_URL=postgresql://postgres:postgres@postgres:5432/postgres

  postgres:
    image: supabase/postgres:latest
    ports:
      - "54322:5432"
    environment:
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Resources

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose Documentation**: https://docs.docker.com/compose/
- **Next.js Docker Guide**: https://nextjs.org/docs/deployment#docker-image
- **Node.js Docker Best Practices**: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md

## Summary

```bash
# Quick start commands
cp .env.example .env.local     # Create environment file
# Edit .env.local with your credentials
docker-compose up              # Start application
# Visit http://localhost:3000
docker-compose down            # Stop application
```

That's it! Your Strumble app is now running in Docker 🐳
