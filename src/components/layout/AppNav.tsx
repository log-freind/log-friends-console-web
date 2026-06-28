"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AppNav.module.css";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/log-catalog", label: "Log Catalog" },
  { href: "/raw-events", label: "Raw Events" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Console navigation">
      <Link className={styles.brand} href="/">
        LF Console
      </Link>
      <div className={styles.links}>
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`${styles.link} ${active ? styles.active : ""}`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
