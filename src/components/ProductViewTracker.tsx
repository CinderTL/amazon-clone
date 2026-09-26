"use client";

import { useEffect } from "react";

export function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    const started = Date.now();
    let sent = false;

    function send() {
      if (sent) return;
      const durationMs = Date.now() - started;
      if (durationMs < 8000) return;
      sent = true;
      const body = JSON.stringify({ productId, durationMs: Math.min(durationMs, 30 * 60 * 1000) });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/activity/view", new Blob([body], { type: "application/json" }));
        return;
      }
      fetch("/api/activity/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => undefined);
    }

    const timer = window.setTimeout(send, 8000);
    function onHide() {
      if (document.visibilityState === "hidden") send();
    }
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", send);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", send);
      send();
    };
  }, [productId]);

  return null;
}
