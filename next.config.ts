import type { NextConfig } from "next";

const consoleApiProxyTarget =
  process.env.CONSOLE_API_PROXY_TARGET || "http://localhost:8080";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.249"],
  async rewrites() {
    return [
      {
        source: "/console-api/:path*",
        destination: `${consoleApiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
