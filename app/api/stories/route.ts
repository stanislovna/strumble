import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Valid story tags based on database enum
const VALID_TAGS = [
  'Funny',
  'Sad',
  'Inspirational',
  'Everyday',
  'Shocking',
  'Moving',
  'Weird',
  'Nostalgic',
] as const

// Request validation helper
function validateStoryRequest(body: any) {
  const errors: string[] = []

  if (!body.placeId || typeof body.placeId !== 'string') {
    errors.push('placeId is required and must be a valid UUID')
  }

  if (!body.answerText || typeof body.answerText !== 'string') {
    errors.push('answerText is required and must be a string')
  } else if (body.answerText.trim().length === 0) {
    errors.push('answerText cannot be empty')
  } else if (body.answerText.length > 5000) {
    errors.push('answerText must be less than 5000 characters')
  }

  if (body.questionId !== undefined && body.questionId !== null) {
    if (typeof body.questionId !== 'number' || body.questionId <= 0) {
      errors.push('questionId must be a positive number if provided')
    }
  }

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      errors.push('tags must be an array')
    } else {
      const invalidTags = body.tags.filter(
        (tag: any) => !VALID_TAGS.includes(tag)
      )
      if (invalidTags.length > 0) {
        errors.push(
          `Invalid tags: ${invalidTags.join(', ')}. Valid tags are: ${VALID_TAGS.join(', ')}`
        )
      }
    }
  }

  if (body.photos !== undefined) {
    if (!Array.isArray(body.photos)) {
      errors.push('photos must be an array of URLs')
    } else {
      const invalidPhotos = body.photos.filter(
        (photo: any) => typeof photo !== 'string' || !isValidUrl(photo)
      )
      if (invalidPhotos.length > 0) {
        errors.push('All photos must be valid URLs')
      }
    }
  }

  if (body.audioUrl !== undefined && body.audioUrl !== null) {
    if (typeof body.audioUrl !== 'string' || !isValidUrl(body.audioUrl)) {
      errors.push('audioUrl must be a valid URL if provided')
    }
  }

  if (
    body.submitterEmail !== undefined &&
    body.submitterEmail !== null &&
    body.submitterEmail !== ''
  ) {
    if (!isValidEmail(body.submitterEmail)) {
      errors.push('submitterEmail must be a valid email address')
    }
  }

  return errors
}

// URL validation helper
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// GET - Fetch stories for a place
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('placeId')
  const status = searchParams.get('status') || 'approved'
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  if (!placeId) {
    return NextResponse.json(
      { error: 'placeId query parameter is required' },
      { status: 400 }
    )
  }

  // Validate limit and offset
  if (limit < 1 || limit > 100) {
    return NextResponse.json(
      { error: 'limit must be between 1 and 100' },
      { status: 400 }
    )
  }

  if (offset < 0) {
    return NextResponse.json(
      { error: 'offset must be non-negative' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()

    let query = supabase
      .from('stories')
      .select(
        `
        id,
        answer_text,
        question_id,
        tags,
        photos,
        audio_url,
        status,
        votes_score,
        upvotes_count,
        downvotes_count,
        created_at,
        published_at,
        story_places!inner(place_id)
      `,
        { count: 'exact' }
      )
      .eq('story_places.place_id', placeId)

    // Filter by status (only approved stories by default)
    if (status === 'approved' || status === 'pending' || status === 'rejected') {
      query = query.eq('status', status)
    }

    const { data: stories, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Database error fetching stories:', error)
      throw error
    }

    return NextResponse.json({
      stories: stories || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
    })
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch stories',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

// POST - Create a new story
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    const validationErrors = validateStoryRequest(body)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    const {
      placeId,
      questionId,
      answerText,
      tags,
      photos,
      audioUrl,
      submitterEmail,
    } = body

    const supabase = await createClient()

    // Check if place exists
    const { data: place, error: placeError } = await supabase
      .from('places')
      .select('id')
      .eq('id', placeId)
      .single()

    if (placeError || !place) {
      return NextResponse.json(
        { error: 'Place not found', placeId },
        { status: 404 }
      )
    }

    // If questionId is provided, verify it exists and is active
    if (questionId) {
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .select('id, is_active')
        .eq('id', questionId)
        .single()

      if (questionError || !question) {
        return NextResponse.json(
          { error: 'Question not found', questionId },
          { status: 404 }
        )
      }

      if (!question.is_active) {
        return NextResponse.json(
          { error: 'Question is not active', questionId },
          { status: 400 }
        )
      }
    }

    // Insert story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert({
        question_id: questionId || null,
        answer_text: answerText.trim(),
        tags: tags || [],
        photos: photos || [],
        audio_url: audioUrl || null,
        submitter_email: submitterEmail || null,
        status: 'pending',
        upvotes_count: 0,
        downvotes_count: 0,
        votes_score: 0,
      })
      .select(
        `
        id,
        answer_text,
        question_id,
        tags,
        photos,
        audio_url,
        status,
        votes_score,
        created_at
      `
      )
      .single()

    if (storyError) {
      console.error('Database error creating story:', storyError)
      throw storyError
    }

    // Link story to place
    const { error: linkError } = await supabase.from('story_places').insert({
      story_id: story.id,
      place_id: placeId,
    })

    if (linkError) {
      console.error('Database error linking story to place:', linkError)
      // Try to clean up the story if linking fails
      await supabase.from('stories').delete().eq('id', story.id)
      throw linkError
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Story created successfully and is pending moderation',
        story,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating story:', error)
    return NextResponse.json(
      {
        error: 'Failed to create story',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
