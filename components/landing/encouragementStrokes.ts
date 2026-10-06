// Single-line letter strokes, so the nib can follow real ink rather than reveal a font mask.
const letters: Record<string, string[]> = {
  a: ["M17 13 C2 5 0 33 11 28 Q16 25 17 13 L15 27 Q16 31 22 25"],
  e: ["M3 20 C25 17 16 6 8 14 C-1 23 7 35 22 25"],
  g: ["M18 13 C4 6 0 30 11 28 Q16 26 18 13 L14 38 C10 52 -1 41 8 35 L22 27"],
  h: ["M4 29 L11 0 L5 27 C14 7 23 11 18 26 Q18 31 24 26"],
  i: ["M10 14 L7 26 Q7 32 18 25", "M12 5 L12.5 4"],
  k: ["M5 30 L12 0", "M22 12 L8 22 Q16 21 19 29 L24 25"],
  m: ["M3 29 L8 13 L5 27 C12 9 21 10 16 27 C24 9 31 13 27 27 L33 25"],
  n: ["M3 29 L8 13 L5 27 C16 6 25 12 19 26 Q19 31 25 25"],
  o: ["M16 13 C0 7 -1 33 12 29 C24 25 22 9 16 13 Q18 18 25 15"],
  p: ["M8 14 L1 43", "M7 25 C15 4 29 17 18 28 Q11 34 7 25 L26 25"],
  r: ["M3 29 L8 13 L5 26 Q15 8 23 15"],
  s: ["M20 14 C8 5 0 18 13 21 C26 25 10 36 2 27"],
  t: ["M14 2 L7 26 Q7 34 22 25", "M2 13 L23 11"],
  u: ["M7 13 C-3 33 12 36 19 13 L15 27 Q16 32 25 25"],
  v: ["M4 14 L7 30 Q17 25 23 12"],
  y: ["M6 13 C-2 33 12 32 18 13 L13 39 Q7 49 2 40 Q0 35 25 26"],
  "'": ["M10 2 L7 9"],
};

function handwriting(lines: string[]) {
  return lines.flatMap((line, row) => {
    const width = [...line].reduce((n, char) => n + (char === " " ? 13 : char === "m" ? 32 : 24), 0);
    const scale = Math.min(1.6, 250 / width);
    let x = 285 - width * scale / 2;
    return [...line.toLowerCase()].flatMap((char) => {
      const paths = (letters[char] ?? []).map((d) => {
        let coordinate = 0;
        return {
          d: d.replace(/-?\d+(?:\.\d+)?/g, (value) => ((Number(value) * scale) + (coordinate++ % 2 === 0 ? x : 225 + row * 70)).toFixed(2)),
          duration: d.length < 20 ? 0.13 : 0.32,
        };
      });
      x += (char === " " ? 13 : char === "m" ? 32 : 24) * scale;
      return paths;
    });
  });
}

export const encouragementWords = [
  { name: "Keep going", strokes: handwriting(["keep", "going"]) },
  { name: "You've got this", strokes: handwriting(["you've", "got this"]) },
  { name: "One step at a time", strokes: handwriting(["one step", "at a time"]) },
];
