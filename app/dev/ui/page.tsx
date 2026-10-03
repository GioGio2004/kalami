import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { StudentGallery } from "@/components/dev/StudentGallery";
import { api } from "@/convex-api/api";

export default async function DevGalleryPage({ searchParams }: PageProps<"/dev/ui">) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  const { view } = await searchParams;
  // Public query, fetched on the server so every screen renders on first paint.
  const notice = await fetchQuery(api.honesty.current, {});
  return <StudentGallery view={typeof view === "string" ? view : undefined} notice={notice} />;
}
