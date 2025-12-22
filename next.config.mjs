import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

if (process.env.NODE_ENV === "development") {
	initOpenNextCloudflareForDev();
}

const isProd = process.env.NODE_ENV === "production";

const scriptSrc = isProd
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'", // clickjacking 対策の本命
  "form-action 'self'",
  scriptSrc,
  "upgrade-insecure-requests",
].join("; ");

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: isProd
              ? "max-age=63072000; includeSubDomains; preload"
              : "max-age=0",
          },

          // clickjacking: XFOは互換性目的で残しつつ、CSPのframe-ancestorsが本命
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // MIME sniffing対策
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // 参照元の扱い
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // 権限系の抑制（必要に応じて追加/削除）
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
              "browsing-topics=()",
              // 使ってないなら加点されやすい項目
              "payment=()",
              "usb=()",
            ].join(", "),
          },

          // CSP（まずはベース。外部依存があれば許可を足す）
          {
            key: "Content-Security-Policy",
            value: csp,
          },

          // Cross-Origin 系（比較的壊れにくい。問題が出たら一旦外す）
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-site",
          },
          // ※ X-XSS-Protection は現在は非推奨寄りなので敢えての0指定
          { key: "X-XSS-Protection", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;
