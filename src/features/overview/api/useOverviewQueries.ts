import { useQueries } from "@tanstack/react-query";
import {
  fetchOverviewBusiness,
  fetchOverviewPerformance,
  fetchOverviewReliability,
  fetchOverviewTraffic,
  type OverviewParams,
} from "@/lib/api/console-api";

export function useOverviewQueries(params: OverviewParams) {
  const [traffic, performance, business, reliability] = useQueries({
    queries: [
      {
        queryKey: ["overview", "traffic", params],
        queryFn: () => fetchOverviewTraffic(params),
      },
      {
        queryKey: ["overview", "performance", params],
        queryFn: () => fetchOverviewPerformance(params),
      },
      {
        queryKey: ["overview", "business", params],
        queryFn: () => fetchOverviewBusiness(params),
      },
      {
        queryKey: ["overview", "reliability", params],
        queryFn: () => fetchOverviewReliability(params),
      },
    ],
  });

  return { traffic, performance, business, reliability };
}
