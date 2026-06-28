export type ApiState = "checking" | "online" | "offline";

export type CatalogApp = {
  appName: string;
  workerIds: string[];
};

export type LogCatalogEventsResponse = {
  appName: string;
  selectedWorkerId: string | null;
  workerIds: string[];
  eventTypeSummaries: EventTypeSummary[];
  failureSummaries: FailureSummary[];
  events: LogCatalogEvent[];
};

export type EventTypeSummary = {
  eventType: string;
  count: number;
  errorCount: number;
};

export type FailureSummary = {
  reasonCode: string;
  count: number;
};

export type LogCatalogEvent = {
  eventName: string;
  description?: string | null;
  apiContext?: ApiContext | null;
  specStatus: "REGISTERED" | "NO_SAMPLE" | "NO_SPEC";
  discoveredHints: DiscoveredHint[];
  fields: LogCatalogField[];
  samples: LogCatalogSample[];
  mismatches: LogCatalogMismatch[];
  fieldRequests: unknown[];
};

export type ApiContext = {
  method?: string | null;
  path?: string | null;
  description?: string | null;
};

export type DiscoveredHint = {
  sourceClass: string;
  sourceMethod: string;
  appVersion?: string | null;
  specHint?: LogSpecHint | null;
};

export type LogSpecHint = {
  apiMethod?: string;
  apiPath?: string;
  apiDescription?: string;
  description?: string;
  fields?: LogCatalogField[];
};

export type LogCatalogField = {
  name: string;
  type: string;
  required: boolean;
  description?: string | null;
  example?: unknown;
};

export type LogCatalogSample = {
  workerId: string;
  ts: string;
  payload: Record<string, unknown>;
};

export type LogCatalogMismatch = {
  code: "EXTRA_FIELD" | "MISSING_FIELD";
  fieldName: string;
};

export type RawCustomEvent = {
  ts?: string;
  timestamp?: string;
  appName?: string;
  app?: string;
  workerId?: string;
  worker?: string;
  eventName?: string;
  payload?: unknown;
  [key: string]: unknown;
};
