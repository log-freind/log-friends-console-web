"use client";

import { ConsoleHome } from "@/features/console-home/ConsoleHome";
import { useCatalogAppsQuery } from "@/features/console-home/api/useCatalogAppsQuery";
import { getConsoleApiBaseUrl } from "@/lib/config/env";
import type { ApiState } from "@/types/console";
import styles from "./page.module.css";

export default function Home() {
  const apiBaseUrl = getConsoleApiBaseUrl();
  const catalogAppsQuery = useCatalogAppsQuery();

  const apiState: ApiState = catalogAppsQuery.isPending
    ? "checking"
    : catalogAppsQuery.isError
      ? "offline"
      : "online";

  return (
    <main className={styles.page}>
      <ConsoleHome
        apiBaseUrl={apiBaseUrl}
        apiState={apiState}
        appCount={catalogAppsQuery.data?.length ?? null}
      />
    </main>
  );
}
