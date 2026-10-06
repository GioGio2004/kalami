import { SCENE_TEMPLATES } from "@/components/lessons/scene/templates";
import type { Lesson } from "@/components/lessons-reader/LessonView";

// Sample lessons for the dev gallery: what `api.lessons.read` returns, with
// every block type the reader renders.

const id = <T extends string>(value: string) => value as string & { __tableName: T };

const course = { _id: id<"courses">("sample_course"), title: "HTML & CSS Fundamentals" };
const week3 = { _id: id<"weeks">("w_3"), title: "Week 3 · The box model" };
const boxModelRef = { _id: id<"lessons">("l_box_model"), title: "The CSS box model" };
const marginsRef = { _id: id<"lessons">("l_margins"), title: "Margins that collapse" };

/** A lecturer's diagram: the four layers of a box, drawn from the outside in. */
const BOX_MODEL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" font-family="ui-sans-serif, system-ui, sans-serif">
  <rect width="640" height="400" fill="#eeede8"/>
  <rect x="40" y="28" width="560" height="344" rx="20" fill="#fafaf7" stroke="#64635e" stroke-width="2" stroke-dasharray="8 8"/>
  <text x="64" y="62" font-size="18" fill="#64635e">margin</text>
  <rect x="110" y="82" width="420" height="236" rx="14" fill="#141414"/>
  <text x="130" y="106" font-size="16" fill="#fafaf7">border</text>
  <rect x="144" y="116" width="352" height="168" rx="8" fill="#dcf35a"/>
  <text x="162" y="142" font-size="16" fill="#141414">padding</text>
  <rect x="190" y="156" width="260" height="88" rx="6" fill="#ffffff"/>
  <text x="320" y="207" font-size="22" font-weight="600" text-anchor="middle" fill="#141414">content</text>
</svg>`;

export const sampleLesson: Lesson = {
  _id: boxModelRef._id,
  title: boxModelRef.title,
  course,
  week: week3,
  previous: { _id: id<"lessons">("l_colours"), title: "Colours and fonts" },
  next: marginsRef,
  blocks: [
    {
      id: "b1",
      type: "text",
      md: "Every element on a web page is a rectangle, even the ones that look round. CSS calls it a **box**, and every box has four layers: the content, then `padding`, then a `border`, then `margin`.\n\nOnce you can see the boxes, layout stops being guesswork.",
    },
    {
      id: "b2",
      type: "callout",
      tone: "definition",
      title: "The box model",
      md: "The rules for how big a box is and how much room it takes. **Content**, **padding** and **border** make the visible box; **margin** is the empty space that pushes other boxes away.",
    },
    {
      id: "b3",
      type: "image",
      url: `data:image/svg+xml,${encodeURIComponent(BOX_MODEL_SVG)}`,
      alt: "The box model: the content in the middle, wrapped by padding, then a border, then margin on the outside.",
      caption: "From the inside out: content, padding, border, margin.",
    },
    {
      id: "b4",
      type: "text",
      md: "Here are two boxes with all four layers. Padding grows each box from the inside; margin keeps them apart.",
    },
    {
      id: "b5",
      type: "code",
      language: "html",
      preview: true,
      caption: "The gap between the two boxes is margin.",
      code: `<style>
  .box {
    padding: 20px;
    border: 4px solid #141414;
    margin: 24px;
    background: #dcf35a;
  }
</style>

<div class="box">I'm the content.</div>
<div class="box">So am I.</div>`,
    },
    {
      id: "b6",
      type: "callout",
      tone: "tip",
      md: "Your browser can show you every box. Right-click anything and choose **Inspect**: the diagram in the **Computed** tab has the real sizes.",
    },
    {
      id: "b7",
      type: "steps",
      title: "Find the box model in DevTools",
      steps: [
        { title: "Open DevTools", md: "Right-click anywhere on the page and choose **Inspect**. On a Mac you can also press `Cmd + Option + I`." },
        { title: "Pick an element", md: "Click the arrow icon in the top-left corner of DevTools, then click the element you want to look at." },
        { title: "Read the diagram", md: "Open the **Computed** tab. The coloured rings are margin, border, padding and content, from the outside in. Hover one to see it on the page." },
      ],
    },
    {
      id: "b8",
      type: "text",
      md: "By default, `width` sets the size of the content only. Padding and border are added on top, so a box with `width: 200px`, `padding: 20px` and a `4px` border is **248px** wide.\n\nMost developers switch that off with one rule at the top of their stylesheet:",
    },
    {
      id: "b9",
      type: "code",
      language: "css",
      preview: true,
      caption: "With border-box, width includes the padding and the border.",
      code: `*,
*::before,
*::after {
  box-sizing: border-box;
}

button {
  padding: 12px 20px;
  border: 2px solid #141414;
  border-radius: 999px;
  margin: 16px 0;
}`,
    },
    {
      id: "b10",
      type: "callout",
      tone: "warning",
      title: "Margins can collapse",
      md: "When two vertical margins meet, they don't add up: a `20px` margin above a `20px` margin makes a 20px gap, not 40px. The next lesson is all about this.",
    },
    {
      id: "b11",
      type: "video",
      url: "https://www.youtube.com/watch?v=rIO5326FgPE",
      caption: "The box model in eight minutes",
    },
    {
      id: "b12",
      type: "callout",
      tone: "note",
      md: "This week's quiz opens on Thursday and covers this lesson and the next one.",
    },
    {
      id: "b13",
      type: "check",
      check: {
        kind: "single",
        prompt: "Which property adds space **inside** the border?",
        options: [
          { text: "margin", correct: false },
          { text: "padding", correct: true },
          { text: "outline", correct: false },
          { text: "gap", correct: false },
        ],
        explanation: "`padding` sits between the content and the border. `margin` is outside the border.",
      },
    },
    {
      id: "b14",
      type: "check",
      check: {
        kind: "multiple",
        prompt: "With the default `box-sizing`, which of these make the visible box bigger?",
        options: [
          { text: "padding", correct: true },
          { text: "border", correct: true },
          { text: "margin", correct: false },
          { text: "width", correct: true },
        ],
        explanation: "Margin adds space around the box, but the box itself stays the same size.",
      },
    },
    {
      id: "b15",
      type: "check",
      check: {
        kind: "short",
        prompt: "Which `box-sizing` value makes `width` include the padding and the border?",
        accepted: ["border-box", "box-sizing: border-box", "box-sizing: border-box;"],
        explanation: "`box-sizing: border-box`. Plenty of stylesheets set it on every element, like the example above.",
      },
    },
    { id: "b_scene_title", type: "scene", scene: SCENE_TEMPLATES[0].scene },
    { id: "b_scene_diagram", type: "scene", scene: SCENE_TEMPLATES[1].scene },
    { id: "b_scene_code", type: "scene", scene: SCENE_TEMPLATES[2].scene },
    { id: "b_scene_compare", type: "scene", scene: SCENE_TEMPLATES[3].scene },
  ],
};

/** The latest lesson in the course: there's no next one yet. */
export const sampleLastLesson: Lesson = {
  _id: marginsRef._id,
  title: marginsRef.title,
  course,
  week: week3,
  previous: boxModelRef,
  next: null,
  blocks: [
    {
      id: "m1",
      type: "text",
      md: "When two vertical margins meet, they don't add up. The bigger one wins. This is called **margin collapsing**, and it only happens top to bottom, never side to side.",
    },
    {
      id: "m2",
      type: "code",
      language: "html",
      preview: true,
      caption: "Two 24px margins meet; the gap stays 24px.",
      code: `<style>
  p {
    margin: 24px 0;
    padding: 12px;
    background: #dcf35a;
  }
</style>

<p>My bottom margin is 24px.</p>
<p>My top margin is 24px too. The gap is still 24px.</p>`,
    },
    {
      id: "m3",
      type: "callout",
      tone: "tip",
      md: "Need the full gap? Put the elements in a flex or grid container (margins never collapse there), or use `gap` instead of margins.",
    },
    {
      id: "m4",
      type: "check",
      check: {
        kind: "single",
        prompt: "One paragraph has `margin: 30px 0`, the next has `margin: 10px 0`. How big is the gap between them?",
        options: [
          { text: "40px", correct: false },
          { text: "30px", correct: true },
          { text: "10px", correct: false },
        ],
        explanation: "The margins collapse and the bigger one wins: 30px.",
      },
    },
  ],
};
