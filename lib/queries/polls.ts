// lib/queries/polls.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPollResults, postPoll } from "../api";

export function usePollResults(placeId: string) {
  return useQuery({
    queryKey: ["polls", "results", placeId],
    queryFn: () => getPollResults(placeId),
  });
}

export function useSubmitPoll(placeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: number[]) => postPoll(placeId, values),
    onSuccess: () => {
      // обновляем данные после успешной отправки
      qc.invalidateQueries({ queryKey: ["polls", "results", placeId] });
    },
  });
}
