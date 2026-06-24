export function getConsoleApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_CONSOLE_API_BASE_URL?.replace(/\/$/, "") ||
    "http://localhost:8080"
  );
}
