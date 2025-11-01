import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type Place = {
  id: string
  name: string
  lat: number
  lng: number
  slug: string
  country: string | null
  continent: string | null
  description?: string | null
}

export type CreatePlaceInput = {
  name: string
  lat: number
  lng: number
  country?: string
  continent?: string
  description?: string
}

// Fetch all places
export function usePlaces(bounds?: string) {
  return useQuery({
    queryKey: ['places', bounds],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (bounds) {
        params.set('bounds', bounds)
      }

      const response = await fetch(`/api/places?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch places')
      }

      const data = await response.json()
      return data.places as Place[]
    },
  })
}

// Create a new place
export function useCreatePlace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePlaceInput) => {
      const response = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create place')
      }

      const data = await response.json()
      return data.place as Place
    },
    onSuccess: () => {
      // Invalidate all places queries to refetch
      queryClient.invalidateQueries({ queryKey: ['places'] })
    },
  })
}
