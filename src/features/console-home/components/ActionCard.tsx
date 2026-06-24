import { ButtonLink } from "@/components/ui/button/ButtonLink";
import styles from "./ActionCard.module.css";

type ActionCardProps = {
  label: string;
  title: string;
  description: string;
  href: string;
};

export function ActionCard({
  label,
  title,
  description,
  href,
}: ActionCardProps) {
  return (
    <article className={styles.card}>
      <div>
        <span className={styles.label}>{label}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <ButtonLink href={href}>Open</ButtonLink>
    </article>
  );
}
