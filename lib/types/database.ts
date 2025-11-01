export type Story = {
  id: string
  answer_text: string
  question_id: number | null
  tags: string[]
  photos: string[]
  status: 'pending' | 'approved' | 'rejected'
  votes_score: number
  created_at: string
  published_at: string | null
}

export type Place = {
  id: string
  name: string
  slug: string
  country: string | null
}
