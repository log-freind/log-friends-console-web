import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function Button({ children, className, type = "button", ...props }: ButtonProps) {
  const classNames = className ? `${styles.button} ${className}` : styles.button;

  return (
    <button className={classNames} type={type} {...props}>
      {children}
    </button>
  );
}
