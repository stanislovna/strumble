# Story Creation API Documentation

## Overview

The Story API allows users to create and retrieve stories associated with geographic places. All stories start in a "pending" state and require moderation before being publicly visible.

## Base URL

```
/api/stories
```

## Authentication

Currently, the API does not require authentication. Stories can be submitted anonymously or with an optional submitter email.

---

## Endpoints

### 1. Create a Story

Create a new story for a specific place.

**Endpoint:** `POST /api/stories`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `placeId` | string (UUID) | Yes | The UUID of the place where the story happened |
| `answerText` | string | Yes | The story text (max 5000 characters, min 1 character) |
| `questionId` | number | No | Optional question ID this story is answering |
| `tags` | string[] | No | Array of story tags (see valid tags below) |
| `photos` | string[] | No | Array of photo URLs |
| `audioUrl` | string | No | URL to an audio recording of the story |
| `submitterEmail` | string | No | Email address for notifications |

**Valid Story Tags:**
- `Funny`
- `Sad`
- `Inspirational`
- `Everyday`
- `Shocking`
- `Moving`
- `Weird`
- `Nostalgic`

**Example Request:**

```typescript
const response = await fetch('/api/stories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    placeId: '123e4567-e89b-12d3-a456-426614174000',
    answerText: 'I visited this place in 2019 and had an amazing experience...',
    tags: ['Inspirational', 'Moving'],
    photos: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg'
    ],
    submitterEmail: 'user@example.com'
  })
});

const data = await response.json();
console.log(data);
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Story created successfully and is pending moderation",
  "story": {
    "id": "987e6543-e21b-12d3-a456-426614174000",
    "answer_text": "I visited this place in 2019 and had an amazing experience...",
    "question_id": null,
    "tags": ["Inspirational", "Moving"],
    "photos": [
      "https://example.com/photo1.jpg",
      "https://example.com/photo2.jpg"
    ],
    "audio_url": null,
    "status": "pending",
    "votes_score": 0,
    "created_at": "2025-11-05T10:30:00.000Z"
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Failed:**
```json
{
  "error": "Validation failed",
  "details": [
    "answerText is required and must be a string",
    "placeId is required and must be a valid UUID"
  ]
}
```

**404 Not Found - Place Not Found:**
```json
{
  "error": "Place not found",
  "placeId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**404 Not Found - Question Not Found:**
```json
{
  "error": "Question not found",
  "questionId": 123
}
```

**400 Bad Request - Question Not Active:**
```json
{
  "error": "Question is not active",
  "questionId": 123
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to create story",
  "message": "Database connection error"
}
```

---

### 2. Get Stories for a Place

Retrieve stories associated with a specific place.

**Endpoint:** `GET /api/stories`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `placeId` | string (UUID) | Yes | - | The UUID of the place to fetch stories for |
| `status` | string | No | `approved` | Filter by status: `pending`, `approved`, or `rejected` |
| `limit` | number | No | `10` | Number of stories to return (1-100) |
| `offset` | number | No | `0` | Offset for pagination |

**Example Request:**

```typescript
const params = new URLSearchParams({
  placeId: '123e4567-e89b-12d3-a456-426614174000',
  status: 'approved',
  limit: '20',
  offset: '0'
});

const response = await fetch(`/api/stories?${params}`);
const data = await response.json();
console.log(data);
```

**Success Response (200 OK):**

```json
{
  "stories": [
    {
      "id": "987e6543-e21b-12d3-a456-426614174000",
      "answer_text": "I visited this place in 2019...",
      "question_id": null,
      "tags": ["Inspirational", "Moving"],
      "photos": ["https://example.com/photo1.jpg"],
      "audio_url": null,
      "status": "approved",
      "votes_score": 15,
      "upvotes_count": 18,
      "downvotes_count": 3,
      "created_at": "2025-11-05T10:30:00.000Z",
      "published_at": "2025-11-05T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**Error Responses:**

**400 Bad Request - Missing placeId:**
```json
{
  "error": "placeId query parameter is required"
}
```

**400 Bad Request - Invalid limit:**
```json
{
  "error": "limit must be between 1 and 100"
}
```

**400 Bad Request - Invalid offset:**
```json
{
  "error": "offset must be non-negative"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch stories",
  "message": "Database connection error"
}
```

---

## Validation Rules

### Story Text (`answerText`)
- **Required:** Yes
- **Type:** String
- **Min Length:** 1 character (after trimming)
- **Max Length:** 5000 characters
- **Validation:** Cannot be empty or whitespace only

### Place ID (`placeId`)
- **Required:** Yes
- **Type:** UUID (string)
- **Validation:** Must be a valid UUID format and exist in the database

### Question ID (`questionId`)
- **Required:** No
- **Type:** Number
- **Validation:**
  - Must be a positive number if provided
  - Must exist in the database
  - Must be an active question

### Tags (`tags`)
- **Required:** No
- **Type:** Array of strings
- **Valid Values:** See "Valid Story Tags" section above
- **Validation:** All tags must be from the valid tags list

### Photos (`photos`)
- **Required:** No
- **Type:** Array of strings
- **Validation:** Each photo must be a valid URL

### Audio URL (`audioUrl`)
- **Required:** No
- **Type:** String
- **Validation:** Must be a valid URL if provided

### Submitter Email (`submitterEmail`)
- **Required:** No
- **Type:** String
- **Validation:** Must be a valid email format if provided

---

## Usage with React Query

The API integrates seamlessly with React Query for efficient data fetching and caching.

### Fetching Stories

```typescript
import { useStories } from '@/lib/queries/stories'

function StoryList({ placeId }: { placeId: string }) {
  const { data: stories, isLoading, error } = useStories(placeId)

  if (isLoading) return <div>Loading stories...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {stories?.map(story => (
        <div key={story.id}>{story.answer_text}</div>
      ))}
    </div>
  )
}
```

### Creating a Story

```typescript
import { usePostStory } from '@/lib/queries/stories'

function StoryForm({ placeId }: { placeId: string }) {
  const postStory = usePostStory(placeId)

  const handleSubmit = async (text: string) => {
    try {
      await postStory.mutateAsync({
        placeId,
        text,
        title: 'My Story'
      })
      alert('Story submitted for moderation!')
    } catch (error) {
      alert('Failed to submit story')
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const text = e.currentTarget.storyText.value
      handleSubmit(text)
    }}>
      <textarea name="storyText" required />
      <button type="submit" disabled={postStory.isPending}>
        {postStory.isPending ? 'Submitting...' : 'Submit Story'}
      </button>
    </form>
  )
}
```

---

## Status Workflow

Stories follow this status workflow:

1. **pending** - Story is submitted and awaiting moderation
2. **approved** - Story has been reviewed and approved by a moderator
3. **rejected** - Story has been rejected by a moderator

Only **approved** stories are returned by default in GET requests.

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider implementing rate limiting in production to prevent abuse.

---

## Error Handling Best Practices

Always handle errors appropriately:

```typescript
try {
  const response = await fetch('/api/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(storyData)
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('API Error:', error)

    // Handle specific error cases
    if (response.status === 400 && error.details) {
      // Validation errors
      error.details.forEach((detail: string) => {
        console.error('Validation:', detail)
      })
    } else if (response.status === 404) {
      // Not found errors
      console.error('Resource not found:', error.error)
    }

    throw new Error(error.message || error.error)
  }

  const data = await response.json()
  return data
} catch (error) {
  console.error('Failed to submit story:', error)
  throw error
}
```

---

## TypeScript Types

Import the TypeScript types for full type safety:

```typescript
import type {
  CreateStoryRequest,
  CreateStoryResponse,
  CreateStoryErrorResponse,
  GetStoriesResponse,
  StoryTag
} from '@/lib/types/api'

// Use in your functions
async function createStory(data: CreateStoryRequest): Promise<CreateStoryResponse> {
  const response = await fetch('/api/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error('Failed to create story')
  }

  return response.json()
}
```

---

## Database Schema

Stories are stored with the following structure:

```sql
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    submitter_email VARCHAR(255),
    question_id INTEGER REFERENCES questions(id) ON DELETE SET NULL,
    answer_text TEXT NOT NULL,
    tags story_tag[] DEFAULT '{}',
    photos TEXT[] DEFAULT '{}',
    audio_url TEXT,
    upvotes_count INTEGER DEFAULT 0,
    downvotes_count INTEGER DEFAULT 0,
    votes_score INTEGER DEFAULT 0,
    status content_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMPTZ
);
```

Stories are linked to places via a many-to-many relationship:

```sql
CREATE TABLE story_places (
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    PRIMARY KEY (story_id, place_id)
);
```

---

## Testing

### Manual Testing with cURL

**Create a story:**

```bash
curl -X POST http://localhost:3000/api/stories \
  -H "Content-Type: application/json" \
  -d '{
    "placeId": "123e4567-e89b-12d3-a456-426614174000",
    "answerText": "This is my test story",
    "tags": ["Funny", "Nostalgic"]
  }'
```

**Fetch stories:**

```bash
curl "http://localhost:3000/api/stories?placeId=123e4567-e89b-12d3-a456-426614174000&limit=10"
```

---

## Security Considerations

1. **Input Validation:** All inputs are validated on the server side
2. **SQL Injection:** Protected by using Supabase's parameterized queries
3. **XSS Protection:** Story text should be sanitized when displayed in the UI
4. **URL Validation:** Photo and audio URLs are validated before storage
5. **Email Validation:** Submitter emails are validated with regex

---

## Future Enhancements

- Add authentication and user-specific stories
- Implement rate limiting
- Add file upload support for photos and audio
- Add webhook notifications for story approval/rejection
- Implement full-text search
- Add story editing capabilities
- Support for story translations
