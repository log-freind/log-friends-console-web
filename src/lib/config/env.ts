declare global {
  interface Window {
    __LOG_FRIENDS_CONFIG__?: {
      consoleApiBaseUrl?: string;
    };
  }
}

export function getConsoleApiBaseUrl() {
  if (typeof window !== "undefined") {
    const runtimeValue = window.__LOG_FRIENDS_CONFIG__?.consoleApiBaseUrl;
    if (runtimeValue) {
      return trimTrailingSlash(runtimeValue);
    }
  }

  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_CONSOLE_API_BASE_URL || "http://localhost:8080",
  );
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}
