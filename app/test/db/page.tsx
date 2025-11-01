'use client'

import { useState } from 'react'

export default function TestDBPage() {
  const [placeId, setPlaceId] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [stories, setStories] = useState<any[]>([])

  // Test CREATE
  const handleCreateStory = async () => {
    if (!placeId || !answerText) {
      alert('Please fill in Place ID and Story Text')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId,
          questionId: 1,
          answerText,
          tags: ['Funny'],
          submitterEmail: 'test@example.com',
        }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        alert('✅ Story created successfully!')
        // Auto-fetch stories to see the new one
        handleFetchStories()
      } else {
        alert('❌ Error: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error(error)
      setResult({ error: String(error) })
      alert('❌ Network error')
    } finally {
      setLoading(false)
    }
  }

  // Test READ
  const handleFetchStories = async () => {
    if (!placeId) {
      alert('Please enter a Place ID')
      return
    }

    setLoading(true)
    setStories([])

    try {
      const response = await fetch(`/api/test/stories?placeId=${placeId}`)
      const data = await response.json()

      if (data.stories) {
        setStories(data.stories)
        alert(`✅ Fetched ${data.stories.length} stories`)
      } else {
        alert('❌ Error: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error(error)
      alert('❌ Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Database Connectivity Test</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Make sure you have a place in your database (run seed.sql)</li>
          <li>Get the place ID from Supabase dashboard or use the seed data</li>
          <li>Create a test story below</li>
          <li>Fetch stories to see your new story</li>
        </ol>
      </div>

      {/* CREATE TEST */}
      <div className="border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">1. Create Story (POST)</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Place ID (UUID)
            </label>
            <input
              type="text"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Story Text
            </label>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Once upon a time in this place..."
              rows={4}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <button
            onClick={handleCreateStory}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Story'}
          </button>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="font-mono text-sm">
              <strong>Response:</strong>
            </p>
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* READ TEST */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">2. Fetch Stories (GET)</h2>
        
        <button
          onClick={handleFetchStories}
          disabled={loading || !placeId}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? 'Fetching...' : 'Fetch Stories'}
        </button>

        {stories.length > 0 && (
          <div className="mt-4 space-y-4">
            <p className="font-semibold">Found {stories.length} stories:</p>
            {stories.map((story) => (
              <div key={story.id} className="border rounded p-4 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">
                  ID: {story.id}
                </p>
                <p className="mb-2">{story.answer_text}</p>
                <div className="flex gap-2 text-xs text-gray-600">
                  <span>Status: {story.status}</span>
                  <span>•</span>
                  <span>Score: {story.votes_score}</span>
                  <span>•</span>
                  <span>Tags: {story.tags.join(', ') || 'none'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick DB Info */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">Quick Tips:</h3>
        <ul className="text-sm space-y-1">
          <li>• Check Supabase Dashboard → Table Editor → places to get a place ID</li>
          <li>• Stories are created with status 'pending' (not visible until approved)</li>
          <li>• To see your story, update its status to 'approved' in Supabase</li>
          <li>• Or modify the API to create with 'approved' status for testing</li>
        </ul>
      </div>
    </div>
  )
}
