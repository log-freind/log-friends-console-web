import { useQuery } from "@tanstack/react-query";
import { fetchRawCustomEvents } from "@/lib/api/console-api";

type UseRawCustomEventsQueryParams = {
  appName?: string;
  workerId?: string;
  eventName?: string;
  from: string;
  to: string;
  limit: number;
};

export function useRawCustomEventsQuery(params: UseRawCustomEventsQueryParams) {
  return useQuery({
    queryKey: ["raw-events", "custom", params],
    queryFn: () => fetchRawCustomEvents(params),
    enabled: !!params.from && !!params.to,
  });
}
