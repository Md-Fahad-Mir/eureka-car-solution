"use client";

import copy from "../../messages/global-error.json";

const { en, bn } = copy;

/**
 * Last-resort boundary for errors in the root layout itself. The i18n
 * provider may be the thing that failed, so it shows English and Bangla
 * together from a tiny copy of the `error` messages (importing the full
 * catalogues here would ship both to every page). A unit test keeps the copy
 * in step with messages/{en,bn}.json.
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
        <title>{en.title}</title>
        <main style={{ maxWidth: 560 }}>
          <h1 style={{ fontWeight: 300, fontSize: 40, margin: "0 0 12px" }}>{en.title}</h1>
          <p style={{ color: "#5a6057", margin: "0 0 8px" }}>{en.body}</p>
          <p lang="bn" style={{ color: "#5a6057", margin: "0 0 24px" }}>
            {bn.body}
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
            {en.retry} / <span lang="bn">{bn.retry}</span>
          </button>
        </main>
      </body>
    </html>
  );
}
