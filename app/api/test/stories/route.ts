import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Fetch stories for a place
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get('placeId')

  if (!placeId) {
    return NextResponse.json({ error: 'placeId required' }, { status: 400 })
  }

  try {
    const supabase = await createClient()

    const { data: stories, error } = await supabase
      .from('stories')
      .select(`
        id,
        answer_text,
        question_id,
        tags,
        photos,
        status,
        votes_score,
        created_at,
        published_at,
        story_places!inner(place_id)
      `)
      .eq('story_places.place_id', placeId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json({ stories })
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    )
  }
}

// POST - Create a new story
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { placeId, questionId, answerText, tags, submitterEmail } = body

    // Validation
    if (!placeId || !answerText) {
      return NextResponse.json(
        { error: 'placeId and answerText are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Insert story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert({
        question_id: questionId || null,
        answer_text: answerText,
        tags: tags || [],
        photos: [],
        submitter_email: submitterEmail || null,
        status: 'pending',
      })
      .select()
      .single()

    if (storyError) throw storyError

    // Link story to place
    const { error: linkError } = await supabase
      .from('story_places')
      .insert({
        story_id: story.id,
        place_id: placeId,
      })

    if (linkError) throw linkError

    return NextResponse.json({ 
      success: true, 
      story 
    })
  } catch (error) {
    console.error('Error creating story:', error)
    return NextResponse.json(
      { error: 'Failed to create story', details: error },
      { status: 500 }
    )
  }
}
