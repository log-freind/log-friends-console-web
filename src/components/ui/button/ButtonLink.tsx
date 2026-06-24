import type { ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
};

export function ButtonLink({ href, children }: ButtonLinkProps) {
  return (
    <a className={styles.button} href={href}>
      {children}
    </a>
  );
}
