import { ImageResponse } from "next/og";

/* The tab icon: the same closing dial as the logo, with heavier strokes,
   because the hairlines that read at 26px disappear at 32. */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex",
        alignItems: "center", justifyContent: "center", background: "#0f5e57",
      }}>
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9.1" stroke="#ffffff" strokeWidth="1.9" opacity="0.4" />
          <path d="M12 2.9a9.1 9.1 0 0 1 9.1 9.1" stroke="#ffffff" strokeWidth="2.6"
                strokeLinecap="round" />
          <path d="M12 12V6.9" stroke="#ffffff" strokeWidth="2.1" strokeLinecap="round" />
          <circle cx="12" cy="12" r="1.5" fill="#ffffff" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
