/**
 * API Types for Story Creation and Retrieval
 */

import { Story } from './database'

// Story Tags (must match database enum)
export type StoryTag =
  | 'Funny'
  | 'Sad'
  | 'Inspirational'
  | 'Everyday'
  | 'Shocking'
  | 'Moving'
  | 'Weird'
  | 'Nostalgic'

// =====================================================
// POST /api/stories - Create Story
// =====================================================

export interface CreateStoryRequest {
  /** UUID of the place where the story happened */
  placeId: string
  /** The story text (max 5000 characters) */
  answerText: string
  /** Optional question ID this story is answering */
  questionId?: number
  /** Optional tags to categorize the story */
  tags?: StoryTag[]
  /** Optional array of photo URLs */
  photos?: string[]
  /** Optional audio recording URL */
  audioUrl?: string
  /** Optional submitter email for notifications */
  submitterEmail?: string
}

export interface CreateStoryResponse {
  success: true
  message: string
  story: {
    id: string
    answer_text: string
    question_id: number | null
    tags: StoryTag[]
    photos: string[]
    audio_url: string | null
    status: 'pending' | 'approved' | 'rejected'
    votes_score: number
    created_at: string
  }
}

export interface CreateStoryErrorResponse {
  error: string
  message?: string
  details?: string[]
  placeId?: string
  questionId?: number
}

// =====================================================
// GET /api/stories - Fetch Stories
// =====================================================

export interface GetStoriesQueryParams {
  /** UUID of the place to fetch stories for (required) */
  placeId: string
  /** Filter by status (default: 'approved') */
  status?: 'pending' | 'approved' | 'rejected'
  /** Number of stories to return (1-100, default: 10) */
  limit?: number
  /** Offset for pagination (default: 0) */
  offset?: number
}

export interface GetStoriesResponse {
  stories: StoryWithPlace[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface StoryWithPlace extends Story {
  upvotes_count: number
  downvotes_count: number
  audio_url: string | null
}

export interface GetStoriesErrorResponse {
  error: string
  message?: string
}

// =====================================================
// Client Usage Examples
// =====================================================

/**
 * Example: Create a new story
 *
 * ```typescript
 * const response = await fetch('/api/stories', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     placeId: '123e4567-e89b-12d3-a456-426614174000',
 *     answerText: 'This is my amazing story...',
 *     tags: ['Inspirational', 'Moving'],
 *     submitterEmail: 'user@example.com'
 *   } as CreateStoryRequest)
 * })
 *
 * const data: CreateStoryResponse | CreateStoryErrorResponse = await response.json()
 *
 * if (response.ok) {
 *   console.log('Story created:', data.story.id)
 * } else {
 *   console.error('Error:', data.error)
 * }
 * ```
 */

/**
 * Example: Fetch stories for a place
 *
 * ```typescript
 * const params = new URLSearchParams({
 *   placeId: '123e4567-e89b-12d3-a456-426614174000',
 *   status: 'approved',
 *   limit: '20',
 *   offset: '0'
 * })
 *
 * const response = await fetch(`/api/stories?${params}`)
 * const data: GetStoriesResponse = await response.json()
 *
 * console.log(`Fetched ${data.stories.length} of ${data.pagination.total} stories`)
 * ```
 */
