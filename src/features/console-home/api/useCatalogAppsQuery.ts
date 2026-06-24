import { useQuery } from "@tanstack/react-query";
import { fetchCatalogApps } from "@/lib/api/console-api";

export function useCatalogAppsQuery() {
  return useQuery({
    queryKey: ["log-catalog", "apps"],
    queryFn: fetchCatalogApps,
  });
}
