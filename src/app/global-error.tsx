"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Runs when the root layout itself throws — we have to ship our own <html> tag.
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F0F4F5" }}>
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#FFFFFF",
              borderRadius: 16,
              padding: "2rem",
              textAlign: "center",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
            }}
          >
            <h1 style={{ fontSize: "1.25rem", margin: "0 0 0.5rem", color: "#1D1B20" }}>
              The app crashed
            </h1>
            <p style={{ margin: "0 0 1rem", color: "#6B7280", fontSize: "0.875rem" }}>
              Something went very wrong. Reloading usually fixes it.
            </p>
            {error.digest && (
              <p style={{ fontSize: "0.625rem", color: "#6B7280", fontFamily: "monospace" }}>
                ref: {error.digest}
              </p>
            )}
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "1rem",
                padding: "0.75rem 1.5rem",
                borderRadius: 999,
                background: "#23AF8D",
                color: "#FFFFFF",
                border: 0,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
