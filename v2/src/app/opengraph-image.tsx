import { ImageResponse } from "next/og";

/* The share card. It leads with the second victim, because that is the part
   nobody has heard of and the reason the product exists. */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Golden Hour — Cyber Fraud Action Room";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        justifyContent: "space-between", background: "#faf9f7", padding: "70px 76px",
        fontFamily: "sans-serif",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9.1" stroke="#0f5e57" strokeWidth="1.6" opacity="0.32" />
            <path d="M12 2.9a9.1 9.1 0 0 1 9.1 9.1" stroke="#0f5e57" strokeWidth="2.1"
                  strokeLinecap="round" />
            <path d="M12 12V6.9" stroke="#0f5e57" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="12" cy="12" r="1.35" fill="#0f5e57" />
          </svg>
          <div style={{ fontSize: 29, color: "#1c1917", fontWeight: 600, letterSpacing: -0.4 }}>
            Golden Hour
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{
            fontSize: 62, color: "#1c1917", lineHeight: 1.08,
            letterSpacing: -2.2, maxWidth: 960,
          }}>
            Every cyber fraud has two victims.
          </div>
          <div style={{
            fontSize: 62, color: "#0f5e57", lineHeight: 1.08,
            letterSpacing: -2.2, marginTop: 6,
          }}>
            The second one has no door.
          </div>
          <div style={{
            fontSize: 24, color: "#44403c", lineHeight: 1.5,
            marginTop: 28, maxWidth: 880,
          }}>
            One was robbed. The other received the money, had no idea it was stolen, and woke
            up to their whole balance frozen over a few hundred rupees.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {["Device-local", "No account", "Not legal advice"].map((t) => (
            <div key={t} style={{
              fontSize: 17, color: "#6b645f", border: "1px solid #e2ddd7",
              borderRadius: 999, padding: "10px 20px", display: "flex",
            }}>{t}</div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
