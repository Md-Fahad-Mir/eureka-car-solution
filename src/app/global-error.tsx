"use client";

import en from "../../messages/en.json";
import bn from "../../messages/bn.json";

/**
 * Last-resort boundary for errors in the root layout itself. The i18n
 * provider may be the thing that failed, so it reads both catalogues
 * directly and shows English and Bangla together.
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#e4e7df",
          color: "#161a16",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
        }}
      >
        <title>{en.error.title}</title>
        <main style={{ maxWidth: 560 }}>
          <h1 style={{ fontWeight: 300, fontSize: 40, margin: "0 0 12px" }}>{en.error.title}</h1>
          <p style={{ color: "#5a6057", margin: "0 0 8px" }}>{en.error.body}</p>
          <p lang="bn" style={{ color: "#5a6057", margin: "0 0 24px" }}>
            {bn.error.body}
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              height: 44,
              padding: "0 20px",
              borderRadius: 999,
              border: 0,
              background: "#161a16",
              color: "#f6f4ef",
              cursor: "pointer",
            }}
          >
            {en.error.retry} / <span lang="bn">{bn.error.retry}</span>
          </button>
        </main>
      </body>
    </html>
  );
}
