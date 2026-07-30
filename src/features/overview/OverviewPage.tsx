"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { Button } from "@/components/ui/button/Button";
import { useCatalogAppsQuery } from "@/features/console-home/api/useCatalogAppsQuery";
import { useOverviewQueries } from "@/features/overview/api/useOverviewQueries";
import type {
  OverviewBusinessItem,
  OverviewPerformanceItem,
  OverviewReliability,
  OverviewTrafficItem,
} from "@/types/console";
import styles from "./OverviewPage.module.css";

const DEFAULT_LIMIT = 5;

export function OverviewPage() {
  const appsQuery = useCatalogAppsQuery();
  const apps = appsQuery.data ?? [];
  const [appName, setAppName] = useState("");
  const selectedApp = apps.find((app) => app.appName === appName);
  const [workerId, setWorkerId] = useState("");
  const [from, setFrom] = useState(() => toLocalInput(hoursAgo(24)));
  const [to, setTo] = useState(() => toLocalInput(new Date()));
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [submitted, setSubmitted] = useState(() => ({
    from: hoursAgo(24).toISOString(),
    to: new Date().toISOString(),
    appName: undefined as string | undefined,
    workerId: undefined as string | undefined,
    limit: DEFAULT_LIMIT,
  }));
  const params = useMemo(() => submitted, [submitted]);
  const queries = useOverviewQueries(params);
  const isRefreshing = Object.values(queries).some((query) => query.isFetching);

  return (
    <main className={styles.page}>
      <AppNav />
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Overview</p>
          <h1>Runtime activity at a glance</h1>
          <p>트래픽, 지연, 비즈니스 이벤트, 장애 신호를 같은 기간으로 비교합니다.</p>
        </div>
        <span className={styles.range}>
          {formatDateTime(params.from)} - {formatDateTime(params.to)}
        </span>
      </header>

      <form
        className={styles.filters}
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted({
            from: new Date(from).toISOString(),
            to: new Date(to).toISOString(),
            appName: appName || undefined,
            workerId: workerId || undefined,
            limit,
          });
        }}
      >
        <label>
          <span>App</span>
          <select
            value={appName}
            onChange={(event) => {
              setAppName(event.target.value);
              setWorkerId("");
            }}
            disabled={appsQuery.isPending}
          >
            <option value="">All apps</option>
            {apps.map((app) => (
              <option key={app.appName} value={app.appName}>
                {app.appName}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Worker</span>
          <select
            value={workerId}
            onChange={(event) => setWorkerId(event.target.value)}
            disabled={!selectedApp?.workerIds.length}
          >
            <option value="">All workers</option>
            {selectedApp?.workerIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>From</span>
          <input
            type="datetime-local"
            value={from}
            max={to}
            onChange={(event) => setFrom(event.target.value)}
            required
          />
        </label>
        <label>
          <span>To</span>
          <input
            type="datetime-local"
            value={to}
            min={from}
            onChange={(event) => setTo(event.target.value)}
            required
          />
        </label>
        <label>
          <span>Top rows</span>
          <select value={limit} onChange={(event) => setLimit(Number(event.target.value))}>
            <option value={5}>5 rows</option>
            <option value={10}>10 rows</option>
            <option value={20}>20 rows</option>
          </select>
        </label>
        <Button type="submit" disabled={!from || !to || from > to || isRefreshing}>
          {isRefreshing ? "Loading" : "Load"}
        </Button>
      </form>

      {appsQuery.isError && (
        <p className={styles.catalogWarning} role="status">
          App 목록을 불러오지 못했습니다. 전체 범위 Overview는 계속 조회됩니다.
        </p>
      )}

      <div className={styles.dashboard}>
        <OverviewSection title="Traffic" subtitle="Most requested endpoints">
          <QueryState
            query={queries.traffic}
            empty="선택한 기간에 HTTP 요청이 없습니다."
            render={(data) => <TrafficTable items={data.items} />}
          />
        </OverviewSection>

        <OverviewSection title="Performance" subtitle="Latency by endpoint">
          <QueryState
            query={queries.performance}
            empty="선택한 기간에 성능 데이터가 없습니다."
            render={(data) => <PerformanceTable items={data.items} />}
          />
        </OverviewSection>

        <OverviewSection title="Business" subtitle="Top LOG_EVENT names">
          <QueryState
            query={queries.business}
            empty="선택한 기간에 비즈니스 이벤트가 없습니다."
            render={(data) => <BusinessList items={data.items} />}
          />
        </OverviewSection>

        <OverviewSection title="Reliability" subtitle="Application and ingest failures">
          <QueryState
            query={queries.reliability}
            empty=""
            render={(data) => <ReliabilityPanel data={data} />}
          />
        </OverviewSection>
      </div>
    </main>
  );
}

type QueryStateProps<T> = {
  query: {
    data: T | undefined;
    isPending: boolean;
    isError: boolean;
  };
  empty: string;
  render: (data: T) => ReactNode;
};

function QueryState<T>({ query, empty, render }: QueryStateProps<T>) {
  if (query.isPending) {
    return <StateMessage tone="loading">데이터를 불러오는 중입니다.</StateMessage>;
  }

  if (query.isError || !query.data) {
    return <StateMessage tone="error">조회에 실패했습니다. Console API를 확인하세요.</StateMessage>;
  }

  if (isEmptyItemsResponse(query.data)) {
    return <StateMessage>{empty}</StateMessage>;
  }

  return render(query.data);
}

function isEmptyItemsResponse(value: unknown): value is { items: [] } {
  return (
    !!value &&
    typeof value === "object" &&
    "items" in value &&
    Array.isArray(value.items) &&
    value.items.length === 0
  );
}

function OverviewSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.panel}>
      <header className={styles.panelHeader}>
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </header>
      {children}
    </section>
  );
}

function TrafficTable({ items }: { items: OverviewTrafficItem[] }) {
  return (
    <DataTable headings={["Endpoint", "Requests"]}>
      {items.map((item) => (
        <tr key={`${item.method}-${item.uri}`}>
          <td><Endpoint method={item.method} uri={item.uri} /></td>
          <td className={styles.number}>{formatNumber(item.requestCount)}</td>
        </tr>
      ))}
    </DataTable>
  );
}

function PerformanceTable({ items }: { items: OverviewPerformanceItem[] }) {
  return (
    <DataTable headings={["Endpoint", "Avg", "P95", "Max"]}>
      {items.map((item) => (
        <tr key={`${item.method}-${item.uri}`}>
          <td><Endpoint method={item.method} uri={item.uri} /></td>
          <td className={styles.number}>{formatDuration(item.averageDurationMs)}</td>
          <td className={styles.number}>{formatDuration(item.p95DurationMs)}</td>
          <td className={styles.number}>{formatDuration(item.maxDurationMs)}</td>
        </tr>
      ))}
    </DataTable>
  );
}

function BusinessList({ items }: { items: OverviewBusinessItem[] }) {
  return (
    <ol className={styles.ranking}>
      {items.map((item, index) => (
        <li key={item.eventName}>
          <span className={styles.rank}>{index + 1}</span>
          <strong>{item.eventName}</strong>
          <b>{formatNumber(item.eventCount)}</b>
        </li>
      ))}
    </ol>
  );
}

function ReliabilityPanel({ data }: { data: OverviewReliability }) {
  return (
    <>
      <div className={styles.metrics}>
        <Metric label="HTTP requests" value={formatNumber(data.http.totalRequests)} />
        <Metric label="HTTP errors" value={formatNumber(data.http.errorRequests)} />
        <Metric label="Error rate" value={formatPercent(data.http.errorRate)} danger={data.http.errorRate > 0} />
        <Metric label="Failed ingest" value={formatNumber(data.ingest.failedEvents)} danger={data.ingest.failedEvents > 0} />
      </div>
      <div className={styles.failureGrid}>
        <FailureList
          title="Top HTTP errors"
          empty="HTTP errors 없음"
          rows={data.topHttpErrors.map((item) => ({
            key: `${item.method}-${item.uri}-${item.statusCode}`,
            label: `${item.method} ${item.uri}`,
            detail: String(item.statusCode),
            count: item.errorCount,
          }))}
        />
        <FailureList
          title="Top ingest failures"
          empty="Ingest failures 없음"
          rows={data.topIngestFailures.map((item) => ({
            key: item.reasonCode,
            label: item.reasonCode,
            count: item.failureCount,
          }))}
        />
      </div>
    </>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={styles.metric}>
      <span>{label}</span>
      <strong className={danger ? styles.danger : ""}>{value}</strong>
    </div>
  );
}

function FailureList({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: { key: string; label: string; detail?: string; count: number }[];
}) {
  return (
    <div className={styles.failureList}>
      <h3>{title}</h3>
      {rows.length ? (
        <ul>
          {rows.map((row) => (
            <li key={row.key}>
              <span title={row.label}>{row.label}</span>
              {row.detail && <code>{row.detail}</code>}
              <b>{formatNumber(row.count)}</b>
            </li>
          ))}
        </ul>
      ) : (
        <p>{empty}</p>
      )}
    </div>
  );
}

function DataTable({ headings, children }: { headings: string[]; children: ReactNode }) {
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Endpoint({ method, uri }: { method: string; uri: string }) {
  return (
    <span className={styles.endpoint}>
      <code>{method}</code>
      <span title={uri}>{uri}</span>
    </span>
  );
}

function StateMessage({ children, tone = "empty" }: { children: ReactNode; tone?: "empty" | "loading" | "error" }) {
  return (
    <div className={`${styles.state} ${styles[tone]}`} role={tone === "error" ? "alert" : "status"}>
      <span />
      <p>{children}</p>
    </div>
  );
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function toLocalInput(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return value.toLocaleString();
}

function formatDuration(value: number) {
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} ms`;
}

function formatPercent(value: number) {
  const percent = value <= 1 ? value * 100 : value;
  return `${percent.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}
