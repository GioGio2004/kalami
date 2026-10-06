import { fetchQuery } from "convex/nextjs";
import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import { THEMES, type ThemeTokens } from "@/components/presentations/themes";
import { api } from "@/convex-api/api";
import { plainText } from "@/lib/presentation";

// The picture chats and social sites show for a shared presentation's link:
// its cover in its own theme (background, glows, the accent mark), the title,
// how long it is and who shared it. A dead link gets a plain Kalami card that
// says nothing about what it was.

export const alt = "The presentation's cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const KALAMI_INK = "#141414";
const KALAMI_LIME = "#dcf35a";
/** Georgian letters (Mkhedruli, Mtavruli, Nuskhuri): those need Noto Sans Georgian. */
const GEORGIAN = /[\u10a0-\u10ff\u1c90-\u1cbf\u2d00-\u2d2f]/;

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const deck = await fetchQuery(api.presentations.shared, { token }).catch(() => null);
  if (deck === null) {
    return card(<Unavailable />, "Kalami A presentation on Kalami", "Inter");
  }
  const t = THEMES[deck.theme];
  const first = deck.slides[0];
  const kicker = first?.type === "title" && first.kicker ? plainText(first.kicker) : "Presentation";
  const title = deck.title.length > 110 ? `${deck.title.slice(0, 107).trimEnd()}…` : deck.title;
  const count = deck.slides.length;
  const meta = `${count} slide${count === 1 ? "" : "s"} · shared by ${deck.sharedBy}`;
  // Chalk's titles are handwritten, as on its slides. The rest is Inter: it reads like the
  // app's Geist, which this renderer draws with uneven gaps after long words.
  const display = deck.theme === "chalk" ? "Caveat" : "Inter";
  return card(
    <Cover t={t} kicker={kicker} title={title} meta={meta} display={display} />,
    `Kalami ${kicker} ${title} ${meta} Watch`,
    display,
  );
}

function Cover({ t, kicker, title, meta, display }: { t: ThemeTokens; kicker: string; title: string; meta: string; display: string }) {
  const fontSize = title.length <= 28 ? 92 : title.length <= 56 ? 72 : 56;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: t.bg,
        // The theme's three glows, as on its slides' backdrop.
        backgroundImage: [
          glow(t.glow[0], "88% 4%", 640),
          glow(t.glow[1], "4% 104%", 600),
          glow(t.glow[2], "70% 112%", 420),
        ].join(", "),
        color: t.fg,
        fontFamily: "Inter, Georgian",
      }}
    >

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Mark />
        <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -1 }}>Kalami</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: 4, textTransform: "uppercase", color: t.muted }}>{kicker}</div>
        <div
          style={{
            marginTop: 20,
            maxWidth: 1010,
            fontFamily: `${display}, Georgian`,
            fontSize: display === "Caveat" ? fontSize * 1.18 : fontSize,
            fontWeight: display === "Caveat" ? 700 : 600,
            lineHeight: 1.04,
            letterSpacing: display === "Caveat" ? 0 : -fontSize * 0.04,
          }}
        >
          {title}
        </div>
        <div style={{ marginTop: 34, width: 156, height: 12, borderRadius: 999, ...paint(t.markBg) }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32 }}>
        <div style={{ fontSize: 26, color: t.muted }}>{meta}</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 30px",
            borderRadius: 999,
            fontSize: 26,
            fontWeight: 600,
            color: t.accentFg,
            ...paint(t.accentBg),
          }}
        >
          <svg width="18" height="20" viewBox="0 0 18 20">
            <path d="M2 2.2v15.6c0 .8.9 1.3 1.6.9l13-7.8c.6-.4.6-1.4 0-1.8l-13-7.8C2.9.9 2 1.4 2 2.2Z" fill={t.accentFg} />
          </svg>
          Watch
        </div>
      </div>
    </div>
  );
}

function Unavailable() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 28,
        padding: 96,
        backgroundColor: "#fafaf7",
        color: KALAMI_INK,
        fontFamily: "Inter",
      }}
    >
      <Mark size={88} />
      <div style={{ fontSize: 76, fontWeight: 600, letterSpacing: -3 }}>Kalami</div>
      <div style={{ fontSize: 32, color: "#64635e" }}>A presentation on Kalami</div>
    </div>
  );
}

/** Kalami's mark: a lime nib on an ink tile (components/Logo, with its colours written out). */
function Mark({ size = 52 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <rect width="32" height="32" rx="9.5" fill={KALAMI_INK} />
      <path d="M10.4 6.8h11.2v4.6L16 26.2l-5.6-14.8z" fill={KALAMI_LIME} stroke={KALAMI_LIME} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M16 16.4v8.6" stroke={KALAMI_INK} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="14.6" r="1.9" fill={KALAMI_INK} />
    </svg>
  );
}

/** A soft round glow of `color` centred `at`, fading out over `radius` pixels (to the same colour, clear, so light themes don't grey). */
function glow(color: string, at: string, radius: number) {
  const clear = color.replace(/[\d.]+\)$/, "0)");
  return `radial-gradient(circle ${radius}px at ${at}, ${color} 0%, ${clear} 100%)`;
}

/** A theme colour can be a gradient (Aurora's): those go in background-image. */
function paint(value: string) {
  return value.includes("gradient(") ? { backgroundImage: value } : { backgroundColor: value };
}

async function card(element: ReactElement, words: string, display: string) {
  // Every letter drawn, capitals included: the kicker is set in capitals.
  const text = `${words}${words.toUpperCase()}`;
  const georgian = GEORGIAN.test(text);
  const loaded = await Promise.all([
    googleFont("Inter", 400, text, "Inter"),
    googleFont("Inter", 600, text, "Inter"),
    display === "Caveat" ? googleFont("Caveat", 700, text, "Caveat") : null,
    georgian ? googleFont("Noto Sans Georgian", 400, text, "Georgian") : null,
    georgian ? googleFont("Noto Sans Georgian", 600, text, "Georgian") : null,
  ]);
  const fonts = loaded.filter((font) => font !== null);
  // Without the network the bundled Geist still draws the Latin text.
  return new ImageResponse(element, { ...size, fonts: fonts.length > 0 ? fonts : undefined });
}

/**
 * One weight of a Google font, cut down to the letters in `text` (TrueType,
 * which is what Google serves to a server). Null if it can't be had.
 */
async function googleFont(family: string, weight: 400 | 600 | 700, text: string, name: string) {
  try {
    const query = `family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(`https://fonts.googleapis.com/css2?${query}`, { cache: "force-cache" })).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) return null;
    return { name, data: await response.arrayBuffer(), weight, style: "normal" as const };
  } catch {
    return null;
  }
}
