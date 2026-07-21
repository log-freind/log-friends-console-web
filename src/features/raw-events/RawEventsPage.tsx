"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { Button } from "@/components/ui/button/Button";
import { useCatalogAppsQuery } from "@/features/console-home/api/useCatalogAppsQuery";
import { useRawCustomEventsQuery } from "@/features/raw-events/api/useRawCustomEventsQuery";
import { buildRawCustomEventsCsvUrl } from "@/lib/api/console-api";
import type { RawCustomEvent } from "@/types/console";
import styles from "./RawEventsPage.module.css";

export function RawEventsPage() {
  const appsQuery = useCatalogAppsQuery();
  const apps = appsQuery.data ?? [];
  const [selectedAppName, setSelectedAppName] = useState("");
  const effectiveAppName = selectedAppName || apps[0]?.appName || "";
  const selectedApp = apps.find((app) => app.appName === effectiveAppName);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [eventName, setEventName] = useState("");
  const [limit, setLimit] = useState(100);
  const [from, setFrom] = useState(() => toDateTimeLocalInput(daysAgo(7)));
  const [to, setTo] = useState(() => toDateTimeLocalInput(new Date()));
  const [submitted, setSubmitted] = useState(() => ({
    from: toIsoFromLocalInput(toDateTimeLocalInput(daysAgo(7))),
    to: toIsoFromLocalInput(toDateTimeLocalInput(new Date())),
    eventName: "",
    limit: 100,
  }));

  const queryParams = useMemo(
    () => ({
      appName: effectiveAppName || undefined,
      workerId: selectedWorkerId || undefined,
      eventName: submitted.eventName || undefined,
      from: submitted.from,
      to: submitted.to,
      limit: submitted.limit,
    }),
    [effectiveAppName, selectedWorkerId, submitted],
  );

  const rawEventsQuery = useRawCustomEventsQuery(queryParams);
  const rowCount = rawEventsQuery.data?.length ?? 0;
  const canSubmit = Boolean(from && to);
  const rangeLabel = `${formatDate(queryParams.from)} - ${formatDate(queryParams.to)}`;
  const csvHref = buildRawCustomEventsCsvUrl({
    appName: queryParams.appName,
    workerId: queryParams.workerId,
    eventName: queryParams.eventName,
    from: queryParams.from,
    to: queryParams.to,
  });

  return (
    <main className={styles.page}>
      <AppNav />
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Raw Events</p>
          <h1>LOG_EVENT 원본 데이터를 조회하고 CSV로 다운로드합니다.</h1>
        </div>
      </header>

      <form
        className={styles.toolbar}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted({
            from: toIsoFromLocalInput(from),
            to: toIsoFromLocalInput(to),
            eventName,
            limit,
          });
        }}
      >
        <div className={styles.filterGrid}>
          <label className={styles.field}>
            <span>App</span>
            <select
              value={effectiveAppName}
              onChange={(event) => {
                setSelectedAppName(event.target.value);
                setSelectedWorkerId("");
              }}
              disabled={appsQuery.isPending || apps.length === 0}
            >
              {apps.length ? (
                apps.map((app) => (
                  <option key={app.appName} value={app.appName}>
                    {app.appName}
                  </option>
                ))
              ) : (
                <option value="">No apps</option>
              )}
            </select>
          </label>
          <label className={styles.field}>
            <span>Worker</span>
            <select
              value={selectedWorkerId}
              onChange={(event) => setSelectedWorkerId(event.target.value)}
              disabled={!selectedApp?.workerIds.length}
            >
              <option value="">All workers</option>
              {selectedApp?.workerIds.map((workerId) => (
                <option key={workerId} value={workerId}>
                  {workerId}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>EventName</span>
            <input
              value={eventName}
              onChange={(event) => setEventName(event.target.value)}
              placeholder="orderCancelled"
            />
          </label>
          <label className={styles.field}>
            <span>From</span>
            <input
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              type="datetime-local"
            />
          </label>
          <label className={styles.field}>
            <span>To</span>
            <input
              value={to}
              onChange={(event) => setTo(event.target.value)}
              type="datetime-local"
            />
          </label>
          <label className={styles.field}>
            <span>Limit</span>
            <select value={limit} onChange={(event) => setLimit(Number(event.target.value))}>
              <option value={25}>25 rows</option>
              <option value={100}>100 rows</option>
              <option value={250}>250 rows</option>
              <option value={500}>500 rows</option>
            </select>
          </label>
        </div>
        <div className={styles.actions}>
          <Button type="submit" disabled={!canSubmit || rawEventsQuery.isFetching}>
            {rawEventsQuery.isFetching ? "Loading" : "Load"}
          </Button>
          <a className={styles.csvButton} href={csvHref}>
            Download CSV
          </a>
        </div>
      </form>

      <section className={styles.resultHeader}>
        <div>
          <strong>{rowCount.toLocaleString()} rows loaded</strong>
          <span>
            {effectiveAppName || "No app"} · {selectedWorkerId || "All workers"} · {rangeLabel}
          </span>
        </div>
        <p>
          Limit {submitted.limit.toLocaleString()} rows
          {queryParams.eventName ? ` · ${queryParams.eventName}` : ""}
        </p>
      </section>

      {appsQuery.isError ? (
        <EmptyState
          tone="error"
          title="Console API 연결 실패"
          body="8080 Console backend 상태를 확인해야 합니다."
        />
      ) : rawEventsQuery.isPending ? (
        <EmptyState
          tone="loading"
          title="Raw Events 로딩 중"
          body="조건에 맞는 LOG_EVENT 원본 데이터를 조회하고 있습니다."
        />
      ) : rawEventsQuery.isError ? (
        <EmptyState
          tone="error"
          title="Raw Events 조회 실패"
          body="from/to 날짜와 Console API 응답을 확인해야 합니다."
        />
      ) : rawEventsQuery.data.length ? (
        <RawEventsTable rows={rawEventsQuery.data} />
      ) : (
        <EmptyState
          title="조회된 LOG_EVENT 없음"
          body="필터와 날짜 범위를 넓히거나 Examples 앱에서 쇼핑몰 액션을 실행한 뒤 다시 조회해보세요."
        />
      )}
    </main>
  );
}

function RawEventsTable({ rows }: { rows: RawCustomEvent[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.tableCaption}>
          Submitted LOG_EVENT rows ordered by timestamp.
        </caption>
        <thead>
          <tr>
            <th scope="col">Timestamp</th>
            <th scope="col">App</th>
            <th scope="col">Worker</th>
            <th scope="col">EventName</th>
            <th scope="col">Payload</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.workerId ?? row.worker}-${row.eventName}-${index}`}>
              <td className={styles.timestampCell}>
                {formatDate(String(row.ts ?? row.timestamp ?? ""))}
              </td>
              <td className={styles.textCell}>{String(row.appName ?? row.app ?? "-")}</td>
              <td className={styles.textCell}>{String(row.workerId ?? row.worker ?? "-")}</td>
              <td>
                <span className={styles.eventName}>{String(row.eventName ?? "-")}</span>
              </td>
              <td>
                <pre className={styles.payload}>{formatPayload(row.payload ?? row)}</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({
  title,
  body,
  tone = "empty",
}: {
  title: string;
  body: string;
  tone?: "empty" | "error" | "loading";
}) {
  return (
    <section className={`${styles.empty} ${styles[tone]}`} aria-live="polite">
      <span className={styles.stateMarker} />
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function toDateTimeLocalInput(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIsoFromLocalInput(value: string) {
  return new Date(value).toISOString();
}

function formatPayload(value: unknown) {
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  return JSON.stringify(value, null, 2);
}

function formatDate(value: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}
