"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/actions/push.actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

type Status = "checking" | "unsupported" | "subscribed" | "unsubscribed";

/** Lets the current customer/rider opt in to browser push notifications for order/rider
 *  status changes — delivered even when this tab/app isn't open. */
export function PushNotificationToggle({ label = "Order updates" }: { label?: string }) {
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function checkSupport() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (!cancelled) setStatus(sub ? "subscribed" : "unsubscribed");
      } catch {
        if (!cancelled) setStatus("unsupported");
      }
    }

    checkSupport();
    return () => {
      cancelled = true;
    };
  }, []);

  function enable() {
    setError(null);
    startTransition(async () => {
      try {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicKey) throw new Error("Notifications aren't configured yet.");

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setError("Notifications were blocked. Enable them in your browser's site settings.");
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        const json = subscription.toJSON();

        const result = await subscribeToPush({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
        });
        if (!result.success) throw new Error(result.error);

        setStatus("subscribed");
      } catch {
        setError("Couldn't enable notifications. Please try again.");
      }
    });
  }

  function disable() {
    setError(null);
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await unsubscribeFromPush(subscription.endpoint);
          await subscription.unsubscribe();
        }
        setStatus("unsubscribed");
      } catch {
        setError("Couldn't disable notifications. Please try again.");
      }
    });
  }

  if (status === "checking" || status === "unsupported") return null;

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        isLoading={isPending}
        onClick={status === "subscribed" ? disable : enable}
      >
        {status === "subscribed" ? (
          <>
            <BellOff className="h-4 w-4" /> Turn off {label.toLowerCase()}
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" /> Enable {label.toLowerCase()}
          </>
        )}
      </Button>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
