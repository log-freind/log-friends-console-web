import { getConsoleApiBaseUrl } from "@/lib/config/env";

export async function fetchCatalogApps(): Promise<string[]> {
  const response = await fetch(`${getConsoleApiBaseUrl()}/api/log-catalog/apps`);

  if (!response.ok) {
    throw new Error(`Failed to fetch catalog apps. HTTP ${response.status}`);
  }

  const apps = (await response.json()) as unknown;
  return Array.isArray(apps) ? apps.filter(isString) : [];
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
