"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Non-critical — the app works fully without it, this is just the offline fallback.
      });
    }
  }, []);

  return null;
}
