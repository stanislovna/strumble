import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTraces, postTrace } from "../api";

export function useTraces(placeId: string) {
  return useQuery({
    queryKey: ["traces", placeId],
    queryFn: () => getTraces(placeId),
  });
}

export function usePostTrace(placeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postTrace,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["traces", placeId] }),
  });
}
