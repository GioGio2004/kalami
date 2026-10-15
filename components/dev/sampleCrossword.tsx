"use client";

import type { GenericId } from "convex/values";
import { CrosswordPuzzle, type Puzzle } from "@/components/crossword-player/CrosswordPuzzle";
import { crosswordGrid, layoutCrossword } from "@/lib/crossword";

// A crossword for the dev gallery, laid out by the same code the backend
// uses. Saving, checking and revealing run here against the solution, which
// the real page never has (the server answers those).

const ENTRIES = [
  ["html", "HTML", "The language that gives a page its structure"],
  ["css", "CSS", "Styles a page: colours, fonts, layout"],
  ["browser", "Browser", "The program that draws web pages"],
  ["server", "Server", "The computer that answers a request"],
  ["domain", "Domain name", "kalami.space is one"],
  ["link", "Hyperlink", "Click it to go to another page"],
  ["https", "HTTPS", "The padlock protocol"],
  ["tag", "Tag", "<p> is one"],
  ["dns", "DNS", "Turns names into addresses"],
  ["cache", "Cache", "Keeps copies close so pages load faster"],
].map(([id, answer, clue]) => ({ id, answer, clue }));

const layout = layoutCrossword(ENTRIES);
const { cells, words, solution } = crosswordGrid(ENTRIES, layout);

const id = <T extends string>(value: string) => value as GenericId<T>;

export function samplePuzzle(progress: Puzzle["progress"] = null): Puzzle {
  return {
    _id: id<"crosswords">("x_web"),
    title: "Words of the web",
    course: { _id: id<"courses">("c_html"), title: "HTML & CSS Fundamentals" },
    week: { _id: id<"weeks">("w_1"), title: "Week 1 · HTML structure" },
    width: layout.width,
    height: layout.height,
    cells,
    words,
    progress,
  };
}

/** Half filled in, one letter wrong, two revealed. */
export function samplePuzzleProgress(): Puzzle["progress"] {
  const letters = solution.map((letter, i) => (i % 2 === 0 ? letter : ""));
  const wrongAt = letters.findIndex((letter) => letter !== "");
  letters[wrongAt] = letters[wrongAt] === "x" ? "y" : "x";
  return { letters, revealed: [1, 3], solved: false };
}

export function SampleCrossword({ start = "fresh" }: { start?: "fresh" | "started" | "solved" }) {
  const progress =
    start === "fresh" ? null : start === "solved" ? { letters: solution, revealed: [], solved: true } : samplePuzzleProgress();
  return (
    <CrosswordPuzzle
      puzzle={samplePuzzle(progress)}
      onSave={async (letters, check) => {
        await new Promise((resolve) => setTimeout(resolve, 250));
        const full = letters.every((letter) => letter !== "");
        const solved = full && letters.every((letter, i) => letter === solution[i]);
        return {
          solved,
          full,
          wrong: check ? letters.flatMap((letter, i) => (letter !== "" && letter !== solution[i] ? [i] : [])) : undefined,
        };
      }}
      onReveal={async (shown) => {
        await new Promise((resolve) => setTimeout(resolve, 250));
        return shown.map((cell) => ({ cell, letter: solution[cell] }));
      }}
    />
  );
}
