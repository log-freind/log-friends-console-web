"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { useCatalogAppsQuery } from "@/features/console-home/api/useCatalogAppsQuery";
import { useLogCatalogEventsQuery } from "@/features/log-catalog/api/useLogCatalogEventsQuery";
import type { DiscoveredHint, LogCatalogEvent, LogCatalogField } from "@/types/console";
import styles from "./LogCatalogPage.module.css";

const EVENTS_PAGE_SIZE = 10;
type SpecStatusFilter = "ALL" | LogCatalogEvent["specStatus"];

export function LogCatalogPage() {
  const appsQuery = useCatalogAppsQuery();
  const apps = appsQuery.data ?? [];
  const [selectedAppName, setSelectedAppName] = useState("");
  const effectiveAppName = selectedAppName || apps[0]?.appName || "";
  const selectedApp = apps.find((app) => app.appName === effectiveAppName);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [selectedEventName, setSelectedEventName] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [specStatusFilter, setSpecStatusFilter] = useState<SpecStatusFilter>("ALL");
  const [eventPage, setEventPage] = useState(0);

  const eventsQuery = useLogCatalogEventsQuery({
    appName: selectedApp?.appName,
    workerId: selectedWorkerId || undefined,
    sampleSize: 0,
  });

  const events = useMemo(() => eventsQuery.data?.events ?? [], [eventsQuery.data?.events]);
  const filteredEvents = useMemo(() => {
    const normalizedSearch = eventSearch.trim().toLowerCase();

    return events.filter((event) => {
      const matchesStatus =
        specStatusFilter === "ALL" || event.specStatus === specStatusFilter;
      const matchesSearch =
        !normalizedSearch ||
        event.eventName.toLowerCase().includes(normalizedSearch) ||
        getEventTitle(event).toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [eventSearch, events, specStatusFilter]);
  const eventPageCount = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PAGE_SIZE));
  const currentEventPage = Math.min(eventPage, eventPageCount - 1);
  const pagedEvents = filteredEvents.slice(
    currentEventPage * EVENTS_PAGE_SIZE,
    currentEventPage * EVENTS_PAGE_SIZE + EVENTS_PAGE_SIZE,
  );
  const selectedEvent =
    pagedEvents.find((event) => event.eventName === selectedEventName) ?? pagedEvents[0];

  return (
    <main className={styles.page}>
      <AppNav />
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Log Catalog</p>
          <h1>LOG_EVENT 계약과 필드 상태를 한 화면에서 확인합니다.</h1>
        </div>
      </header>

      <section className={styles.toolbar} aria-label="Catalog filters">
        <label>
          App
          <select
            value={effectiveAppName}
            onChange={(event) => {
              setSelectedAppName(event.target.value);
              setSelectedWorkerId("");
              setSelectedEventName("");
              setEventSearch("");
              setSpecStatusFilter("ALL");
              setEventPage(0);
            }}
          >
            {apps.map((app) => (
              <option key={app.appName} value={app.appName}>
                {app.appName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Worker
          <select
            value={selectedWorkerId}
            onChange={(event) => setSelectedWorkerId(event.target.value)}
          >
            <option value="">All workers</option>
            {selectedApp?.workerIds.map((workerId) => (
              <option key={workerId} value={workerId}>
                {workerId}
              </option>
            ))}
          </select>
        </label>
      </section>

      {appsQuery.isError ? (
        <EmptyState title="Console API 연결 실패" body="8080 Console backend 상태를 확인해야 합니다." />
      ) : eventsQuery.isPending ? (
        <EmptyState title="Log Catalog 로딩 중" body="Console API에서 eventName 목록을 가져오고 있습니다." />
      ) : eventsQuery.isError ? (
        <EmptyState title="Log Catalog 조회 실패" body="선택한 appName의 catalog API 응답을 확인해야 합니다." />
      ) : (
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Event Types</h2>
                <span>{eventsQuery.data?.eventTypeSummaries.length ?? 0}</span>
              </div>
              <div className={styles.summaryList}>
                {eventsQuery.data?.eventTypeSummaries.map((summary) => (
                  <div className={styles.summaryItem} key={summary.eventType}>
                    <div>
                      <strong>{summary.eventType}</strong>
                      <span>{summary.errorCount} errors</span>
                    </div>
                    <b>{summary.count}</b>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Events</h2>
                <span>
                  {filteredEvents.length} / {events.length}
                </span>
              </div>
              <div className={styles.eventControls}>
                <label>
                  Search
                  <input
                    value={eventSearch}
                    onChange={(event) => {
                      setEventSearch(event.target.value);
                      setSelectedEventName("");
                      setEventPage(0);
                    }}
                    placeholder="eventName or API"
                  />
                </label>
                <label>
                  Status
                  <select
                    value={specStatusFilter}
                    onChange={(event) => {
                      setSpecStatusFilter(event.target.value as SpecStatusFilter);
                      setSelectedEventName("");
                      setEventPage(0);
                    }}
                  >
                    <option value="ALL">All status</option>
                    <option value="NO_SPEC">No spec</option>
                    <option value="NO_SAMPLE">No sample</option>
                    <option value="REGISTERED">Registered</option>
                  </select>
                </label>
              </div>
              <div className={styles.eventList}>
                {pagedEvents.map((event) => (
                  <button
                    className={`${styles.eventButton} ${
                      selectedEvent?.eventName === event.eventName ? styles.selectedEventButton : ""
                    }`}
                    aria-pressed={selectedEvent?.eventName === event.eventName}
                    key={event.eventName}
                    onClick={() => setSelectedEventName(event.eventName)}
                    type="button"
                  >
                    <span className={styles.eventButtonTopline}>
                      <strong>{event.eventName}</strong>
                      <StatusChip status={event.specStatus} />
                    </span>
                    <span className={styles.eventButtonApi}>{getEventTitle(event)}</span>
                    <span className={styles.eventButtonMeta}>
                      {event.fields.length} fields · {event.discoveredHints.length} hints
                    </span>
                  </button>
                ))}
              </div>
              <div className={styles.pagination}>
                <button
                  disabled={currentEventPage === 0}
                  onClick={() => {
                    setEventPage((page) => Math.max(0, page - 1));
                    setSelectedEventName("");
                  }}
                  type="button"
                >
                  Prev
                </button>
                <span>
                  {currentEventPage + 1} / {eventPageCount}
                </span>
                <button
                  disabled={currentEventPage >= eventPageCount - 1}
                  onClick={() => {
                    setEventPage((page) => Math.min(eventPageCount - 1, page + 1));
                    setSelectedEventName("");
                  }}
                  type="button"
                >
                  Next
                </button>
              </div>
            </section>
          </aside>

          <section className={styles.content}>
            {selectedEvent ? (
              <EventCard event={selectedEvent} />
            ) : (
              <EmptyState title="아직 eventName 없음" body="Examples 앱에서 LOG_EVENT를 발생시키면 여기에 표시됩니다." />
            )}
          </section>
        </div>
      )}

    </main>
  );
}

function EventCard({ event }: { event: LogCatalogEvent }) {
  const primaryHint = event.discoveredHints[0];
  const apiContext = getEventTitle(event);
  const fields = event.fields.length ? event.fields : primaryHint?.specHint?.fields ?? [];

  return (
    <article className={styles.eventCard} id={event.eventName}>
      <div className={styles.eventHeader}>
        <div>
          <p className={styles.apiLine}>{apiContext}</p>
          <h2>{event.eventName}</h2>
          <p>{event.description ?? getHintDescription(primaryHint) ?? "No description"}</p>
        </div>
        <StatusChip status={event.specStatus} />
      </div>

      <div className={styles.metaGrid} aria-label="Selected event metadata">
        <MetaItem label="Status" value={getStatusLabel(event.specStatus)} />
        <MetaItem label="Fields" value={String(fields.length)} />
        <MetaItem label="Hints" value={String(event.discoveredHints.length)} />
        <MetaItem label="Mismatches" value={String(event.mismatches.length)} />
        <MetaItem label="Field Requests" value={String(event.fieldRequests.length)} />
      </div>

      <Section title="LogSpec Hints">
        {event.discoveredHints.length ? (
          event.discoveredHints.map((hint) => <HintCard hint={hint} key={`${hint.sourceClass}.${hint.sourceMethod}`} />)
        ) : (
          <Pill>No annotation hint</Pill>
        )}
      </Section>

      <Section title="Spec Fields">
        <FieldList fields={fields} />
      </Section>

      <Section title="Mismatches">
        {event.mismatches.length ? (
          <div className={styles.mismatchList}>
            {event.mismatches.map((mismatch) => (
              <span className={styles.mismatchItem} key={`${mismatch.code}-${mismatch.fieldName}`}>
                {mismatch.code} · {mismatch.fieldName}
              </span>
            ))}
          </div>
        ) : (
          <Pill>No mismatch</Pill>
        )}
      </Section>

    </article>
  );
}

function HintCard({ hint }: { hint: DiscoveredHint }) {
  return (
    <div className={styles.hintCard}>
      <div className={styles.hintHeader}>
        <strong>
          {hint.sourceClass}.{hint.sourceMethod}
        </strong>
        <span>appVersion {hint.appVersion ?? "-"}</span>
      </div>
      <p className={styles.hintApi}>{getHintTitle(hint) || "No API hint"}</p>
      <p>{getHintDescription(hint) ?? "No hint description"}</p>
      <FieldList fields={hint.specHint?.fields ?? []} />
    </div>
  );
}

function FieldList({ fields }: { fields: LogCatalogField[] }) {
  if (!fields.length) {
    return <Pill>No spec fields</Pill>;
  }

  return (
    <div className={styles.fieldList}>
      {fields.map((field) => (
        <div className={styles.fieldItem} key={field.name}>
          <div className={styles.fieldHeader}>
            <strong>{field.name}</strong>
            <span className={field.required ? styles.required : styles.optional}>
              {field.required ? "required" : "optional"}
            </span>
          </div>
          <span>{field.type}</span>
          <p>{field.description ?? "No description"}</p>
          {field.example !== undefined ? <code>{formatValue(field.example)}</code> : null}
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <section className={styles.empty}>
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return <span className={styles.pill}>{children}</span>;
}

function StatusChip({ status }: { status: LogCatalogEvent["specStatus"] }) {
  return <span className={`${styles.status} ${styles[status.toLowerCase()]}`}>{getStatusLabel(status)}</span>;
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metaItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getStatusLabel(status: LogCatalogEvent["specStatus"]) {
  switch (status) {
    case "REGISTERED":
      return "Registered";
    case "NO_SAMPLE":
      return "No sample";
    case "NO_SPEC":
      return "No spec";
  }
}

function getEventTitle(event: LogCatalogEvent) {
  const hint = event.discoveredHints[0];
  const method = event.apiContext?.method ?? hint?.specHint?.apiMethod;
  const path = event.apiContext?.path ?? hint?.specHint?.apiPath;
  return [method, path].filter(Boolean).join(" ") || "No API context";
}

function getHintTitle(hint?: DiscoveredHint) {
  return [hint?.specHint?.apiMethod, hint?.specHint?.apiPath].filter(Boolean).join(" ");
}

function getHintDescription(hint?: DiscoveredHint) {
  return hint?.specHint?.apiDescription ?? hint?.specHint?.description;
}

function formatValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}
