import type { Metadata, Viewport } from "next";
import { fetchQuery } from "convex/nextjs";
import { cache } from "react";
import { THEMES } from "@/components/presentations/themes";
import { SharedPresentation } from "@/components/presentations-reader/SharedPresentation";
import { api } from "@/convex-api/api";
import { plainText } from "@/lib/presentation";

// A presentation's share link (the editor's Share in the staff app): public,
// no account needed. The page itself plays the deck live (components/
// presentations-reader/SharedPresentation); the server only reads it once for
// what chats and browsers show before it opens: the title, a description,
// the browser bar in the deck's colour, and the cover (opengraph-image.tsx).

/** The deck behind a link, read once per request. Null for a dead link, or if Convex can't be reached. */
const sharedDeck = cache(async (token: string) => {
  try {
    return await fetchQuery(api.presentations.shared, { token });
  } catch {
    return null;
  }
});

// Links are unlisted: they never show up in search results.
const robots = { index: false, follow: false };

export async function generateMetadata({ params }: PageProps<"/p/[token]">): Promise<Metadata> {
  const deck = await sharedDeck((await params).token);
  if (deck === null) {
    return { title: "Presentation not available · Kalami", robots };
  }
  const first = deck.slides[0];
  const count = deck.slides.length;
  const lead = first?.type === "title" && first.subtitle ? `${plainText(first.subtitle)} · ` : "";
  const description = `${lead}A presentation in ${count} slide${count === 1 ? "" : "s"}, shared by ${deck.sharedBy} on Kalami.`;
  return {
    title: `${deck.title} · Kalami`,
    description,
    robots,
    openGraph: { type: "website", siteName: "Kalami", title: deck.title, description },
    twitter: { card: "summary_large_image", title: deck.title, description },
  };
}

export async function generateViewport({ params }: PageProps<"/p/[token]">): Promise<Viewport> {
  const deck = await sharedDeck((await params).token);
  return { themeColor: deck === null ? "#fafaf7" : THEMES[deck.theme].bg };
}

export default async function SharedPresentationPage({ params }: PageProps<"/p/[token]">) {
  const { token } = await params;
  const deck = await sharedDeck(token);
  return <SharedPresentation token={token} theme={deck?.theme ?? null} />;
}
