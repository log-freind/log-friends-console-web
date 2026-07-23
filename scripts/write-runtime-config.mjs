import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const outputPath = resolve(process.cwd(), "public/runtime-config.js");
const consoleApiBaseUrl = process.env.CONSOLE_API_BASE_URL ||
  process.env.NEXT_PUBLIC_CONSOLE_API_BASE_URL ||
  "http://localhost:8080";

const config = {
  consoleApiBaseUrl: consoleApiBaseUrl === "/"
    ? "/"
    : consoleApiBaseUrl.replace(/\/$/, ""),
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(
  outputPath,
  `window.__LOG_FRIENDS_CONFIG__ = ${JSON.stringify(config, null, 2)};\n`,
);
