import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/server/:path*",
        destination:
          process.env.API_URL ?? "http://127.0.0.1:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
