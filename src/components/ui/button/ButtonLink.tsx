import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./Button.module.css";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  external?: boolean;
};

export function ButtonLink({ href, children, external = false }: ButtonLinkProps) {
  if (external) {
    return (
      <a className={styles.button} href={href} rel="noreferrer" target="_blank">
        {children}
      </a>
    );
  }

  return (
    <Link className={styles.button} href={href}>
      {children}
    </Link>
  );
}
