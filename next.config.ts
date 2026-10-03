import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
