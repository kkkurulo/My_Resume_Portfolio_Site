import { ImageResponse } from "next/og";
import { getProfile } from "@/db/queries";

export const alt = "Portfolio preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

/** The card shown when the site's link is pasted into LinkedIn, Telegram, Slack and so on. */
export default async function OpenGraphImage() {
  const { name, headline, location } = await getProfile();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 90,
          background: "#12161a",
          color: "#eceae4",
        }}
      >
        <div style={{ width: 90, height: 6, background: "#7cc0ec", marginBottom: 48 }} />
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.1 }}>{name}</div>
        <div style={{ fontSize: 42, marginTop: 28, color: "#7cc0ec" }}>{headline}</div>
        {location && <div style={{ fontSize: 30, marginTop: 28, color: "#a0a4a8" }}>{location}</div>}
      </div>
    ),
    size,
  );
}
