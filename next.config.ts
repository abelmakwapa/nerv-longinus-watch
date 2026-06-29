// filepath: next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        "*.glsl": {
          loaders: ["raw-loader"],
          as: "*.js",
        },
      },
    },
  },

  transpilePackages: [],

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://api.nasa.gov",
              // WebGL / Three.js may create texture + shader workers from blobs.
              "worker-src 'self' blob:",
              "connect-src 'self' https://api.nasa.gov https://ssd-api.jpl.nasa.gov",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
