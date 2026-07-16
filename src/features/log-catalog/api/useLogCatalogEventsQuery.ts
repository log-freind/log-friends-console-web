import { useQuery } from "@tanstack/react-query";
import { fetchLogCatalogEvents } from "@/lib/api/console-api";

type UseLogCatalogEventsQueryParams = {
  appName?: string;
  workerId?: string;
  sampleSize?: number;
};

export function useLogCatalogEventsQuery({
  appName,
  workerId,
  sampleSize,
}: UseLogCatalogEventsQueryParams) {
  return useQuery({
    queryKey: ["log-catalog", "events", appName, workerId, sampleSize],
    queryFn: () => fetchLogCatalogEvents({ appName: appName ?? "", workerId, sampleSize }),
    enabled: !!appName,
  });
}
