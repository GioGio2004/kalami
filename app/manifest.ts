import type { MetadataRoute } from "next";

/**
 * The installable app: what the home screen shows and where it opens. Icons
 * are rendered from app/icon.svg into public/icons (plain for the usual slots,
 * maskable ones that fill Android's shapes, a one-colour badge for the status
 * bar). Colours are the paper and ink of globals.css.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/dashboard",
    name: "Kalami",
    short_name: "Kalami",
    description: "Your courses, lessons, quizzes and exams, in your own hand.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#fafaf7",
    theme_color: "#fafaf7",
    lang: "en",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Dashboard", url: "/dashboard", icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }] },
      { name: "Messages", url: "/messages", icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }] },
    ],
  };
}
