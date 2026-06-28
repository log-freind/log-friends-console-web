import { getConsoleApiBaseUrl } from "@/lib/config/env";
import type {
  CatalogApp,
  LogCatalogEventsResponse,
  RawCustomEvent,
} from "@/types/console";

export async function fetchCatalogApps(): Promise<CatalogApp[]> {
  const response = await fetch(`${getConsoleApiBaseUrl()}/api/log-catalog/apps`);

  if (!response.ok) {
    throw new Error(`Failed to fetch catalog apps. HTTP ${response.status}`);
  }

  const body = (await response.json()) as unknown;

  if (!isCatalogAppsResponse(body)) {
    throw new Error("Failed to parse catalog apps response.");
  }

  return body.apps;
}

type LogCatalogEventsParams = {
  appName: string;
  workerId?: string;
  sampleSize?: number;
};

export async function fetchLogCatalogEvents({
  appName,
  workerId,
  sampleSize = 5,
}: LogCatalogEventsParams): Promise<LogCatalogEventsResponse> {
  const params = new URLSearchParams();

  if (workerId) {
    params.set("workerId", workerId);
  }

  params.set("sampleSize", String(sampleSize));

  const response = await fetch(
    `${getConsoleApiBaseUrl()}/api/log-catalog/apps/${encodeURIComponent(appName)}/events?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch log catalog events. HTTP ${response.status}`);
  }

  return (await response.json()) as LogCatalogEventsResponse;
}

type RawCustomEventsParams = {
  appName?: string;
  workerId?: string;
  eventName?: string;
  from: string;
  to: string;
  limit: number;
};

export async function fetchRawCustomEvents(
  params: RawCustomEventsParams,
): Promise<RawCustomEvent[]> {
  const response = await fetch(buildRawCustomEventsUrl("/api/events/custom", params));

  if (!response.ok) {
    throw new Error(`Failed to fetch raw custom events. HTTP ${response.status}`);
  }

  return (await response.json()) as RawCustomEvent[];
}

export function buildRawCustomEventsCsvUrl(params: Omit<RawCustomEventsParams, "limit">) {
  return buildRawCustomEventsUrl("/api/events/custom.csv", params);
}

function buildRawCustomEventsUrl(
  path: string,
  params: Omit<RawCustomEventsParams, "limit"> & { limit?: number },
) {
  const searchParams = new URLSearchParams();

  if (params.appName) {
    searchParams.set("appName", params.appName);
  }

  if (params.workerId) {
    searchParams.set("workerId", params.workerId);
  }

  if (params.eventName) {
    searchParams.set("eventName", params.eventName);
  }

  searchParams.set("from", params.from);
  searchParams.set("to", params.to);

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  return `${getConsoleApiBaseUrl()}${path}?${searchParams.toString()}`;
}

function isCatalogAppsResponse(value: unknown): value is { apps: CatalogApp[] } {
  if (!value || typeof value !== "object" || !("apps" in value)) {
    return false;
  }

  const apps = (value as { apps: unknown }).apps;
  return Array.isArray(apps) && apps.every(isCatalogApp);
}

function isCatalogApp(value: unknown): value is CatalogApp {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as CatalogApp).appName === "string" &&
    Array.isArray((value as CatalogApp).workerIds) &&
    (value as CatalogApp).workerIds.every((workerId) => typeof workerId === "string")
  );
}
