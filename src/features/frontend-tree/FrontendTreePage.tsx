"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { Button } from "@/components/ui/button/Button";
import { useCatalogAppsQuery } from "@/features/console-home/api/useCatalogAppsQuery";
import { useRawCustomEventsQuery } from "@/features/raw-events/api/useRawCustomEventsQuery";
import type { FrontendTreeNode } from "./tree-model";
import { buildFrontendTrees } from "./tree-model";
import styles from "./FrontendTreePage.module.css";

export function FrontendTreePage() {
  const appsQuery = useCatalogAppsQuery();
  const apps = appsQuery.data ?? [];
  const [selectedAppName, setSelectedAppName] = useState("");
  const effectiveAppName = selectedAppName || apps[0]?.appName || "";
  const selectedApp = apps.find((app) => app.appName === effectiveAppName);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [from, setFrom] = useState(() => toLocalInput(daysAgo(7)));
  const [to, setTo] = useState(() => toLocalInput(new Date()));
  const [submitted, setSubmitted] = useState(() => ({
    from: toIso(toLocalInput(daysAgo(7))),
    to: toIso(toLocalInput(new Date())),
  }));

  const rawEventsQuery = useRawCustomEventsQuery({
    appName: effectiveAppName || undefined,
    workerId: selectedWorkerId || undefined,
    from: submitted.from,
    to: submitted.to,
    limit: 500,
  });
  const trees = useMemo(() => buildFrontendTrees(rawEventsQuery.data ?? []), [rawEventsQuery.data]);

  return (
    <main className={styles.page}>
      <AppNav />
      <header className={styles.header}>
        <p className={styles.eyebrow}>Frontend Tree</p>
        <h1>브라우저 이벤트를 페이지와 컴포넌트 구조로 봅니다.</h1>
        <p>페이지 경로는 Browser SDK가 자동으로 붙이고, 컴포넌트 경로는 이벤트의 <code>uiContext</code>에서 받습니다.</p>
      </header>

      <form className={styles.toolbar} onSubmit={(event) => {
        event.preventDefault();
        setSubmitted({ from: toIso(from), to: toIso(to) });
      }}>
        <label>
          <span>App</span>
          <select value={effectiveAppName} onChange={(event) => {
            setSelectedAppName(event.target.value);
            setSelectedWorkerId("");
          }} disabled={!apps.length}>
            {apps.map((app) => <option key={app.appName} value={app.appName}>{app.appName}</option>)}
          </select>
        </label>
        <label>
          <span>Worker</span>
          <select value={selectedWorkerId} onChange={(event) => setSelectedWorkerId(event.target.value)}>
            <option value="">All workers</option>
            {selectedApp?.workerIds.map((workerId) => <option key={workerId} value={workerId}>{workerId}</option>)}
          </select>
        </label>
        <label><span>From</span><input type="datetime-local" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
        <label><span>To</span><input type="datetime-local" value={to} onChange={(event) => setTo(event.target.value)} /></label>
        <Button type="submit" disabled={rawEventsQuery.isFetching}>{rawEventsQuery.isFetching ? "Loading" : "Load"}</Button>
      </form>

      {rawEventsQuery.isPending ? <p className={styles.state}>브라우저 이벤트를 불러오는 중입니다.</p> : null}
      {rawEventsQuery.isError ? <p className={`${styles.state} ${styles.error}`}>Console API에서 이벤트를 읽지 못했습니다.</p> : null}
      {!rawEventsQuery.isPending && !rawEventsQuery.isError && !trees.length ? (
        <p className={styles.state}>UI 컨텍스트가 포함된 BROWSER 이벤트가 없습니다.</p>
      ) : null}
      <section className={styles.trees} aria-label="Frontend component trees">
        {trees.map((tree) => (
          <article className={styles.tree} key={tree.pagePath}>
            <header><code>{tree.pagePath}</code><span>{tree.eventCount.toLocaleString()} events</span></header>
            {tree.roots.length ? <ul>{tree.roots.map((node) => <TreeNode key={node.name} node={node} />)}</ul> : <p>컴포넌트가 없는 페이지 이벤트</p>}
          </article>
        ))}
      </section>
    </main>
  );
}

function TreeNode({ node }: { node: FrontendTreeNode }) {
  return <li><span>{node.name}</span><small>{node.eventCount.toLocaleString()} events</small>{node.children.length ? <ul>{node.children.map((child) => <TreeNode key={child.name} node={child} />)}</ul> : null}</li>;
}

function daysAgo(days: number): Date { const date = new Date(); date.setDate(date.getDate() - days); return date; }
function toLocalInput(date: Date): string { const offset = date.getTimezoneOffset() * 60_000; return new Date(date.getTime() - offset).toISOString().slice(0, 16); }
function toIso(value: string): string { return new Date(value).toISOString(); }
