import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PawsPair — Verified Pet Matchmaking",
    short_name: "PawsPair",
    description:
      "India's verified pet matchmaking app. Find safe playdates, friends and family-planning matches for your dog or cat.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F7F7FB",
    theme_color: "#6366F1",
    lang: "en-IN",
    categories: ["lifestyle", "social", "pets"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Discover", short_name: "Discover", url: "/dashboard" },
      { name: "Matches", short_name: "Matches", url: "/matches" },
    ],
  };
}
