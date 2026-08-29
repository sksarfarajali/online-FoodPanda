import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Swaad-e-Mehfil",
    short_name: "Swaad-e-Mehfil",
    description: "Multi-cuisine Indian restaurant — menu, reservations, and online ordering.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7f0",
    theme_color: "#7a2e2e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
