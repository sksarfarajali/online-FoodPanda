import type { MetadataRoute } from "next";

// Minimal manifest stub — enough for "Add to Home Screen" metadata.
// Full offline/service-worker PWA support is a fast-follow (see README).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Swaad-e-Mehfil",
    short_name: "Swaad-e-Mehfil",
    description: "Multi-cuisine Indian restaurant — menu, reservations, and online ordering.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7f0",
    theme_color: "#7a2e2e",
    icons: [],
  };
}
