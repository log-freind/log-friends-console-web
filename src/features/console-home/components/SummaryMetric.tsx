import styles from "./SummaryMetric.module.css";

type SummaryMetricProps = {
  label: string;
  value: string | number;
};

export function SummaryMetric({ label, value }: SummaryMetricProps) {
  return (
    <article className={styles.summary}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
