import { resolveSiteUrl } from "./scripts/lib/site-url.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/search/:path*",
        headers: [
          { key: "Cache-Control", value: process.env.NODE_ENV === "development" ? "no-store" : "public,max-age=31536000,immutable" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: "upgrade-insecure-requests",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
    ];
  },
};

export default function configure() {
  const siteUrl = resolveSiteUrl(
    process.env.SITE_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined),
  );
  // The public origin is embedded at build time. Starting a built server needs no env.
  return { ...nextConfig, env: { SITE_URL: siteUrl } };
}
