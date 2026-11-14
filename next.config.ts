import type { NextConfig } from "next";

/**
 * Pages other than the app itself that may show Kalami inside a frame: the
 * portfolio at khvichia.shemoqmedi.space opens the live site in a window.
 */
const frameAncestors = ["'self'", "https://khvichia.shemoqmedi.space"];

/**
 * Sent with every page. Nobody may frame the student app except itself (the
 * code preview is a same-origin srcdoc frame, which this still allows) and the
 * pages in `frameAncestors`; no camera/microphone/location, no sniffing, a
 * tight referrer. There is no X-Frame-Options header: it can only say "this
 * site" or "nobody", so it would block the portfolio, and every current
 * browser follows frame-ancestors instead.
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: `frame-ancestors ${frameAncestors.join(" ")}` },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "X-Content-Type-Options", value: "nosniff" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // Dev only: lets students open the dev server through a tunnel or the local network
  // (Next blocks dev assets for hostnames other than localhost by default).
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok-free.dev",
    "*.ngrok.app",
    "*.trycloudflare.com",
    "*.devtunnels.ms",
    "**.devtunnels.ms",
    "192.168.*.*",
    "172.*.*.*",
    "10.*.*.*",
  ],
};

export default nextConfig;
