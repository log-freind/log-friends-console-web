import { describe, expect, it } from "vitest";
import { buildRawCustomEventsCsvUrl } from "@/lib/api/console-api";
import type { RawCustomEvent } from "@/types/console";

describe("raw-events console-web tests", () => {
  it("builds raw custom events CSV URL containing sessionId and all query filters", () => {
    const csvUrl = buildRawCustomEventsCsvUrl({
      appName: "order-service",
      workerId: "order-worker-1",
      eventName: "orderCreated",
      sessionId: "session-abc-123",
      from: "2026-08-20T00:00:00.000Z",
      to: "2026-08-27T00:00:00.000Z",
    });

    const parsed = new URL(csvUrl);
    expect(parsed.pathname).toBe("/api/events/custom.csv");
    expect(parsed.searchParams.get("appName")).toBe("order-service");
    expect(parsed.searchParams.get("workerId")).toBe("order-worker-1");
    expect(parsed.searchParams.get("eventName")).toBe("orderCreated");
    expect(parsed.searchParams.get("sessionId")).toBe("session-abc-123");
    expect(parsed.searchParams.get("from")).toBe("2026-08-20T00:00:00.000Z");
    expect(parsed.searchParams.get("to")).toBe("2026-08-27T00:00:00.000Z");
  });

  it("handles null or missing sourceType by mapping to UNKNOWN instead of JVM", () => {
    const events: RawCustomEvent[] = [
      {
        appName: "unregistered-app",
        workerId: "unregistered-worker",
        eventName: "someAction",
        sourceType: undefined,
      },
      {
        appName: "mobile-app",
        workerId: "mobile-worker-1",
        eventName: "screenViewed",
        sourceType: "MOBILE",
      },
      {
        appName: "browser-app",
        workerId: "browser-worker-1",
        eventName: "clicked",
        sourceType: "BROWSER",
      },
    ];

    const mappedSources = events.map((row) => {
      const rawSource = row.sourceType ?? row.source;
      return typeof rawSource === "string" && rawSource.trim().length > 0
        ? rawSource.trim().toUpperCase()
        : "UNKNOWN";
    });

    expect(mappedSources[0]).toBe("UNKNOWN");
    expect(mappedSources[0]).not.toBe("JVM");
    expect(mappedSources[1]).toBe("MOBILE");
    expect(mappedSources[2]).toBe("BROWSER");
  });
});
