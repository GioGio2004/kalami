import type { FunctionArgs, FunctionReturnType } from "convex/server";
import type { api } from "@/convex-api/api";

// The contact card's words and its ready-made messages. Deterministic
// templates, no AI: what Kalami already knows (course, week, assessment) is
// filled in, the student answers one or two short questions, and the result
// stays fully editable before Send. Topic ids are stable (the backend stores
// them); labels and wording here can change freely.

export type Lang = "ka" | "en";
export type Topic = FunctionArgs<typeof api.messages.start>["topic"];
export type Recipient = FunctionArgs<typeof api.messages.start>["recipient"];
export type ContactOptions = FunctionReturnType<typeof api.messages.contactOptionsFor>;
export type ContactContext = ContactOptions["context"];

type Text = Record<Lang, string>;

/** The card itself. The headline is deliberately playful; everything after it stays calm. */
export const CARD: Record<"headline" | "supporting" | "action" | "actionLabel", Text> = {
  headline: { en: "Something wrong? Let's bother someone :))", ka: "რამე ვერ გამოდის? მოდი, ვინმე შევაწუხოთ :))" },
  supporting: {
    en: "Pick who to contact, tell us the topic, and we'll prepare the message.",
    ka: "აირჩიე, ვის მისწერო, მიუთითე თემა და წერილს ჩვენ მოგიმზადებთ.",
  },
  action: { en: "Write a message", ka: "მიწერა" },
  /** Accessible name for the button, which says what it does. */
  actionLabel: { en: "Write a message to your lecturer or the Kalami team", ka: "მისწერე ლექტორს ან კალამის გუნდს" },
};

export const RECIPIENT_LABEL: Record<Recipient, Text> = {
  lecturer: { en: "Lecturer", ka: "ლექტორი" },
  admin: { en: "Admin", ka: "ადმინი" },
};

export const RECIPIENT_HINT: Record<Recipient, Text> = {
  lecturer: { en: "Your course: materials, tasks, grades, schedule.", ka: "კურსის საკითხები: მასალები, დავალებები, ქულები, განრიგი." },
  admin: { en: "The Kalami team: when the app itself isn't working.", ka: "კალამის გუნდი: როცა თავად აპლიკაცია არ მუშაობს." },
};

/** Where the message goes, said before Send. */
export function deliveryNote(lang: Lang, recipientName: string): string {
  return lang === "ka"
    ? `შეტყობინება შეინახება კალამში და ${recipientName} ელფოსტით გაიგებს. პასუხს აქვე ნახავ.`
    : `Your message is saved in Kalami and ${recipientName} gets an email. Their reply shows up here.`;
}

export type Question = {
  id: string;
  label: Text;
  placeholder: Text;
  required: boolean;
  long?: boolean;
};

export type TopicDef = {
  id: Topic;
  label: Text;
  /** A suggestion the student can change, never a hidden rule. */
  suggested: Recipient;
  questions: Question[];
};

const q = (id: string, label: Text, placeholder: Text, required: boolean, long = false): Question => ({
  id,
  label,
  placeholder,
  required,
  long,
});

export const TOPICS: TopicDef[] = [
  {
    id: "materials_access",
    label: { en: "I can't open the materials", ka: "მასალები არ იხსნება" },
    suggested: "lecturer",
    questions: [
      q(
        "what",
        { en: "What happens when you open it?", ka: "რა ხდება, როცა ხსნი?" },
        { en: "e.g. “Access denied”, or the page is empty", ka: "მაგ. „წვდომა შეზღუდულია“ ან გვერდი ცარიელია" },
        false,
      ),
    ],
  },
  {
    id: "missing_material",
    label: { en: "A file or link is missing", ka: "ფაილი ან ბმული აკლია" },
    suggested: "lecturer",
    questions: [q("what", { en: "What's missing?", ka: "რა აკლია?" }, { en: "e.g. the slides from Thursday", ka: "მაგ. ხუთშაბათის სლაიდები" }, true)],
  },
  {
    id: "assignment",
    label: { en: "Question about an assignment", ka: "კითხვა დავალებაზე" },
    suggested: "lecturer",
    questions: [q("question", { en: "Your question", ka: "შენი კითხვა" }, { en: "Ask it in a sentence or two", ka: "დაწერე ერთ-ორ წინადადებაში" }, true, true)],
  },
  {
    id: "grade",
    label: { en: "Question about my grade or feedback", ka: "კითხვა ჩემს ქულაზე ან შეფასებაზე" },
    suggested: "lecturer",
    questions: [
      q(
        "question",
        { en: "What would you like explained?", ka: "რისი ახსნა გინდა?" },
        { en: "e.g. why question 4 got no points", ka: "მაგ. რატომ არ ჩამეთვალა მე-4 კითხვა" },
        true,
        true,
      ),
    ],
  },
  {
    id: "submission",
    label: { en: "I couldn't submit my work", ka: "ნამუშევარი ვერ ჩავაბარე" },
    suggested: "lecturer",
    questions: [
      q("what", { en: "What happened?", ka: "რა მოხდა?" }, { en: "e.g. the Submit button did nothing", ka: "მაგ. ღილაკმა „ჩაბარება“ არ იმუშავა" }, true, true),
      q("when", { en: "Roughly when?", ka: "დაახლოებით როდის?" }, { en: "e.g. today around 18:40", ka: "მაგ. დღეს, 18:40-ის ახლოს" }, false),
    ],
  },
  {
    id: "absence",
    label: { en: "Absence or schedule question", ka: "გაცდენა ან განრიგი" },
    suggested: "lecturer",
    questions: [q("question", { en: "What's it about?", ka: "რას ეხება?" }, { en: "Only what you're comfortable sharing", ka: "მხოლოდ ის, რისი თქმაც გსურს" }, true, true)],
  },
  {
    id: "app_problem",
    label: { en: "Something in Kalami isn't working", ka: "კალამში რაღაც არ მუშაობს" },
    suggested: "admin",
    questions: [
      q("what", { en: "What happened?", ka: "რა მოხდა?" }, { en: "e.g. the quiz froze after question 3", ka: "მაგ. ქვიზი მე-3 კითხვის შემდეგ გაიჭედა" }, true, true),
    ],
  },
  {
    id: "other",
    label: { en: "My own topic", ka: "ჩემი თემა" },
    suggested: "lecturer",
    questions: [q("message", { en: "What do you want to say?", ka: "რისი თქმა გინდა?" }, { en: "Write it as you'd say it", ka: "დაწერე ისე, როგორც იტყოდი" }, true, true)],
  },
];

export function topicDef(id: Topic): TopicDef {
  return TOPICS.find((t) => t.id === id) ?? TOPICS[TOPICS.length - 1];
}

/** The language the draft is written in: the course's when there is one, else the student's. */
export function draftLang(options: ContactOptions): Lang {
  return options.context.course?.locale ?? options.student.locale;
}

export type DraftInput = {
  lang: Lang;
  topic: Topic;
  customTopic: string;
  recipient: Recipient;
  /** The lecturer's name; ignored for the Kalami team. */
  recipientName: string;
  studentName: string;
  context: ContactContext;
  /** Answers to the topic's questions, by question id. */
  answers: Record<string, string>;
};

export type Draft = { subject: string; body: string };

/** The prepared subject and message. Unanswered optional questions are left out, never shown as blanks. */
export function buildDraft(input: DraftInput): Draft {
  const { lang, context } = input;
  const ka = lang === "ka";
  const course = context.course?.title;
  const week = context.week?.title;
  const work = context.assessment?.title;
  const a = (id: string) => input.answers[id]?.trim() ?? "";
  const custom = input.customTopic.trim();

  const greeting =
    input.recipient === "admin"
      ? ka
        ? "გამარჯობა, კალამის გუნდო!"
        : "Hello Kalami team,"
      : ka
        ? `გამარჯობა, ${input.recipientName}!`
        : `Hello ${input.recipientName},`;
  const inCourse = (text: string) => (course ? (ka ? `${text} (${course})` : `${text} in ${course}`) : text);
  const dot = (text: string) => text + (/[.!?…]$/.test(text) ? "" : ".");

  let lead = "";
  let subject = "";
  const lines: string[] = [];
  let ask = "";
  switch (input.topic) {
    case "materials_access":
      lead = ka
        ? `ვერ ვხსნი მასალებს${week ? `: „${week}“` : ""}${course ? ` (${course})` : ""}.`
        : `I can't open the ${week ? `“${week}” ` : ""}materials${course ? ` for ${course}` : ""}.`;
      if (context.week?.url) lines.push(ka ? `ბმული: ${context.week.url}` : `Link: ${context.week.url}`);
      if (a("what")) lines.push(ka ? `რას ვხედავ: ${dot(a("what"))}` : `What I see: ${dot(a("what"))}`);
      ask = ka ? "შეგიძლიათ, ბმული გადაამოწმოთ?" : "Could you check the link?";
      subject = [course, week, ka ? "მასალები არ იხსნება" : "can't open the materials"].filter(Boolean).join(" · ");
      break;
    case "missing_material":
      lead = ka ? inCourse("მგონი, მასალებიდან რაღაც აკლია") + "." : `Something seems to be missing from ${week ? `“${week}”` : "the materials"}${course ? ` in ${course}` : ""}.`;
      if (a("what")) lines.push(ka ? `რა აკლია: ${dot(a("what"))}` : `What's missing: ${dot(a("what"))}`);
      ask = ka ? "შეგიძლიათ, დაამატოთ?" : "Could you add it?";
      subject = [course, week, ka ? "მასალა აკლია" : "missing material"].filter(Boolean).join(" · ");
      break;
    case "assignment":
      lead = ka
        ? `კითხვა მაქვს ${work ? `დავალებაზე „${work}“` : "დავალებაზე"}${course ? ` (${course})` : ""}.`
        : `I have a question about ${work ? `“${work}”` : "an assignment"}${course ? ` in ${course}` : ""}.`;
      if (a("question")) lines.push(dot(a("question")));
      subject = [course, work, ka ? "კითხვა დავალებაზე" : "question"].filter(Boolean).join(" · ");
      break;
    case "grade":
      lead = ka
        ? `კითხვა მაქვს ჩემს ქულაზე ან შეფასებაზე${work ? `: „${work}“` : ""}${course ? ` (${course})` : ""}.`
        : `I have a question about my grade or feedback${work ? ` for “${work}”` : ""}${course ? ` in ${course}` : ""}.`;
      if (a("question")) lines.push(dot(a("question")));
      ask = ka ? "შეგიძლიათ, ამიხსნათ?" : "Could you explain it?";
      subject = [course, work, ka ? "კითხვა ქულაზე" : "grade question"].filter(Boolean).join(" · ");
      break;
    case "submission":
      lead = ka
        ? `ვერ ჩავაბარე ${work ? `„${work}“` : "ჩემი ნამუშევარი"}${course ? ` (${course})` : ""}.`
        : `I couldn't submit ${work ? `“${work}”` : "my work"}${course ? ` in ${course}` : ""}.`;
      if (a("what")) lines.push(ka ? `რა მოხდა: ${dot(a("what"))}` : `What happened: ${dot(a("what"))}`);
      if (a("when")) lines.push(ka ? `როდის: ${a("when")}` : `When: ${a("when")}`);
      ask = ka ? "რა გავაკეთო ახლა?" : "What should I do now?";
      subject = [course, work, ka ? "ვერ ჩავაბარე" : "couldn't submit"].filter(Boolean).join(" · ");
      break;
    case "absence":
      lead = ka ? inCourse("კითხვა მაქვს გაცდენაზე ან განრიგზე") + "." : `I have a question about an absence or the schedule${course ? ` for ${course}` : ""}.`;
      if (a("question")) lines.push(dot(a("question")));
      subject = [course, ka ? "გაცდენა ან განრიგი" : "absence or schedule"].filter(Boolean).join(" · ");
      break;
    case "app_problem":
      lead = ka
        ? `კალამში რაღაც არ მუშაობს${[course, work].filter(Boolean).length > 0 ? ` (${[course, work].filter(Boolean).join(" · ")})` : ""}.`
        : `Something in Kalami isn't working for me${[course, work].filter(Boolean).length > 0 ? ` (${[course, work].filter(Boolean).join(" · ")})` : ""}.`;
      if (a("what")) lines.push(ka ? `რა მოხდა: ${dot(a("what"))}` : `What happened: ${dot(a("what"))}`);
      ask = ka ? "შეგიძლიათ, შეხედოთ?" : "Could you take a look?";
      subject = ka ? `პრობლემა კალამში${course ? `: ${course}` : ""}` : `Problem in Kalami${course ? `: ${course}` : ""}`;
      break;
    case "other":
      lead = custom ? (ka ? `გწერთ თემაზე: ${custom}${course ? ` (${course})` : ""}.` : `I'm writing about: ${custom}${course ? ` (${course})` : ""}.`) : "";
      if (a("message")) lines.push(a("message"));
      subject = custom || (ka ? "შეტყობინება" : "Message");
      break;
  }

  const body = [
    greeting,
    "",
    [lead, ...lines].filter(Boolean).join("\n"),
    ...(ask ? ["", ask] : []),
    "",
    ka ? "მადლობა," : "Thanks,",
    input.studentName,
  ].join("\n");
  return { subject: subject.slice(0, 150), body };
}

/** The questions the student still has to answer before Send. */
export function missingAnswers(topic: Topic, answers: Record<string, string>, customTopic: string): Question[] {
  const def = topicDef(topic);
  const missing = def.questions.filter((question) => question.required && !(answers[question.id] ?? "").trim());
  if (topic === "other" && !customTopic.trim()) {
    missing.unshift(q("customTopic", { en: "Topic", ka: "თემა" }, { en: "", ka: "" }, true));
  }
  return missing;
}

/** A fresh id for one Send, so a double tap or a retry after a timeout is saved once. */
export function newClientOpId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
