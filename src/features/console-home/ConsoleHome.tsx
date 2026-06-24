import { ActionCard } from "@/features/console-home/components/ActionCard";
import { StatusBadge } from "@/features/console-home/components/StatusBadge";
import { SummaryMetric } from "@/features/console-home/components/SummaryMetric";
import type { ApiState } from "@/types/console";
import styles from "./ConsoleHome.module.css";

type ConsoleHomeProps = {
  apiBaseUrl: string;
  apiState: ApiState;
  appCount: number | null;
};

const workflowCards = [
  {
    label: "Current Console UI",
    title: "Log Catalog",
    description:
      "Review eventName, API context, LogSpec hints, recent samples, and field requests.",
    href: "/log-catalog",
  },
  {
    label: "Current Console UI",
    title: "Raw Events",
    description:
      "Query LOG_EVENT records and download the selected date range as CSV.",
    href: "/raw-events",
  },
  {
    label: "Backend API",
    title: "Catalog Apps API",
    description:
      "Check whether the web app can reach the Console backend before migrating screens.",
    href: "/api/log-catalog/apps",
  },
];

export function ConsoleHome({
  apiBaseUrl,
  apiState,
  appCount,
}: ConsoleHomeProps) {
  return (
    <section className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Log Friends Console Web</p>
          <h1>Operate log contracts from one console.</h1>
        </div>
        <StatusBadge state={apiState} />
      </header>

      <section className={styles.summaryGrid} aria-label="Console summary">
        <SummaryMetric label="Console API" value={apiBaseUrl} />
        <SummaryMetric label="Catalog apps" value={appCount ?? "-"} />
        <SummaryMetric label="First migration target" value="Log Catalog" />
      </section>

      <section className={styles.cardGrid} aria-label="Console workflows">
        {workflowCards.map((card) => (
          <ActionCard
            key={card.title}
            label={card.label}
            title={card.title}
            description={card.description}
            href={`${apiBaseUrl}${card.href}`}
          />
        ))}
      </section>
    </section>
  );
}
