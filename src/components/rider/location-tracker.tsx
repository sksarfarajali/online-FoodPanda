"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Navigation } from "lucide-react";

const SEND_THROTTLE_MS = 15_000;

/**
 * Shares this rider's live position while an order is OUT_FOR_DELIVERY. Browser geolocation
 * is suspended when the tab is backgrounded or the screen locks — there is no native app here,
 * so the on-screen reminder below is the only thing keeping tracking alive, by design.
 */
export function LocationTracker() {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSentAtRef = useRef(0);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  function startSharing() {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not available on this device.");
      return;
    }
    setError(null);
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - lastSentAtRef.current < SEND_THROTTLE_MS) return;
        lastSentAtRef.current = now;

        fetch("/api/rider/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        }).catch(() => {
          // Best-effort — the next watchPosition tick will retry.
        });
      },
      () => setError("Couldn't get your location. Check location permissions."),
      { enableHighAccuracy: true, maximumAge: 10_000 }
    );
    watchIdRef.current = id;
    setSharing(true);
  }

  function stopSharing() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className={`h-4 w-4 ${sharing ? "text-success" : "text-muted"}`} aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">
            {sharing ? "Sharing live location" : "Location not shared"}
          </p>
        </div>
        <button
          type="button"
          onClick={sharing ? stopSharing : startSharing}
          className="rounded-[var(--radius)] bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          {sharing ? "Stop sharing" : "Start sharing"}
        </button>
      </div>

      {sharing && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
          Keep this page open and your screen on while delivering — location sharing pauses if you
          switch apps or lock your phone.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
