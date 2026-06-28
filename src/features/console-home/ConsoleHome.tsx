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
    label: "Review",
    title: "Log Catalog",
    description:
      "Inspect API context, eventName, annotation hints, fields, and recent samples.",
    href: "/log-catalog",
  },
  {
    label: "Export",
    title: "Raw Events",
    description:
      "Filter LOG_EVENT rows by app, worker, eventName, and time range for CSV export.",
    href: "/raw-events",
  },
  {
    label: "Health",
    title: "Catalog Apps API",
    description:
      "Open the backend response directly when the web app and Console contract need checking.",
    href: "/api/log-catalog/apps",
    external: true,
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
          <h1>Review event contracts and export raw LOG_EVENT data.</h1>
          <p className={styles.lead}>
            Console backend remains the source of truth. This web app focuses on
            fast review, filtering, and handoff to data work.
          </p>
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
            href={card.external ? `${apiBaseUrl}${card.href}` : card.href}
            external={card.external}
          />
        ))}
      </section>
    </section>
  );
}
