import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Fetch all places or places within bounds
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bounds = searchParams.get('bounds') // Format: "south,west,north,east"
  const limit = parseInt(searchParams.get('limit') || '1000', 10)

  try {
    const supabase = await createClient()

    let query = supabase
      .from('places')
      .select('id, name, lat, lng, slug, country, continent, description')

    // Optional: Filter by map viewport bounds for performance
    if (bounds) {
      const [south, west, north, east] = bounds.split(',').map(Number)

      if (south && west && north && east) {
        query = query
          .gte('lat', south)
          .lte('lat', north)
          .gte('lng', west)
          .lte('lng', east)
      }
    }

    const { data: places, error } = await query
      .order('name', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Database error fetching places:', error)
      throw error
    }

    return NextResponse.json({ places: places || [] })
  } catch (error) {
    console.error('Error fetching places:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch places',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Create a new place
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, lat, lng, country, continent, description } = body

    // Validation
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'name is required and must be a string' },
        { status: 400 }
      )
    }

    if (typeof lat !== 'number' || lat < -90 || lat > 90) {
      return NextResponse.json(
        { error: 'lat must be a number between -90 and 90' },
        { status: 400 }
      )
    }

    if (typeof lng !== 'number' || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'lng must be a number between -180 and 180' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create slug from name (make it URL-friendly)
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    // Check if slug exists, if so, append a number
    let slug = baseSlug
    let counter = 1
    let slugExists = true

    while (slugExists) {
      const { data: existing } = await supabase
        .from('places')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!existing) {
        slugExists = false
      } else {
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    // Insert the place
    const { data: place, error } = await supabase
      .from('places')
      .insert({
        name: name.trim(),
        lat,
        lng,
        slug,
        country: country || null,
        continent: continent || null,
        description: description || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error creating place:', error)
      throw error
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Place created successfully',
        place,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating place:', error)
    return NextResponse.json(
      {
        error: 'Failed to create place',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
