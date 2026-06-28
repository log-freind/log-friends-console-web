import { useQuery } from "@tanstack/react-query";
import { fetchLogCatalogEvents } from "@/lib/api/console-api";

type UseLogCatalogEventsQueryParams = {
  appName?: string;
  workerId?: string;
};

export function useLogCatalogEventsQuery({
  appName,
  workerId,
}: UseLogCatalogEventsQueryParams) {
  return useQuery({
    queryKey: ["log-catalog", "events", appName, workerId],
    queryFn: () => fetchLogCatalogEvents({ appName: appName ?? "", workerId }),
    enabled: !!appName,
  });
}
