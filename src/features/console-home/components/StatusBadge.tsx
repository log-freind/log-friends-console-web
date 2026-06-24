import type { ApiState } from "@/types/console";
import styles from "./StatusBadge.module.css";

type StatusBadgeProps = {
  state: ApiState;
};

const labels: Record<ApiState, string> = {
  checking: "Checking Console API",
  online: "Console API online",
  offline: "Console API offline",
};

export function StatusBadge({ state }: StatusBadgeProps) {
  return (
    <div className={`${styles.status} ${styles[state]}`}>
      <span />
      {labels[state]}
    </div>
  );
}
