import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStories, postStory } from "../api";

export function useStories(placeId: string) {
  return useQuery({
    queryKey: ["stories", placeId],
    queryFn: () => getStories(placeId),
  });
}

export function usePostStory(placeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postStory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stories", placeId] }),
  });
}
