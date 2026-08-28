"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "1.5rem",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#fbf7f0",
          color: "#231f20",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ marginTop: "0.5rem", color: "#6b6360", fontSize: "0.875rem" }}>
          Please refresh the page. If the problem continues, try again shortly.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            height: "2.75rem",
            padding: "0 1.5rem",
            borderRadius: "0.625rem",
            background: "#7a2e2e",
            color: "#fff8f0",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
