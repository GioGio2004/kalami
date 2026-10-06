import type { AuthInfo, CallToolResult } from "@modelcontextprotocol/server";
import { ConvexHttpClient } from "convex/browser";
import { ConvexError, type GenericId as Id } from "convex/values";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import { api } from "@/convex-api/api";
import { publicOrigin, serviceCredential, verifyOAuthToken } from "./oauth";

/**
 * Kalami's connector for students: a student's own AI assistant (Claude,
 * ChatGPT, Claude Code, …) reads their courses, lessons, materials, deadlines
 * and finished work, so they can study with it. Read-only by construction:
 * every tool is a Convex query (convex/study.ts in the staff repo), and the
 * backend shows an assistant exactly what the student app shows the student,
 * and finished work only.
 *
 * Auth on /api/mcp is "Sign in with Kalami": OAuth through Clerk (see
 * oauth.ts). Convex accepts only onboarded student accounts here.
 */

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL");
}
const convex = new ConvexHttpClient(convexUrl);

// --- Helpers -----------------------------------------------------------------

function text(data: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }],
  };
}

function failure(error: unknown): CallToolResult {
  let message = "Something went wrong.";
  if (error instanceof ConvexError) {
    const data: unknown = error.data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const { code, message: detail } = data as { code?: string; message?: string };
      message = `${code ?? "ERROR"}: ${detail ?? message}`;
    } else if (typeof data === "string") {
      message = data;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }
  return { isError: true, content: [{ type: "text", text: message }] };
}

/** Runs a Convex call for a tool and turns its errors into tool errors. */
async function run(fn: () => Promise<unknown>): Promise<CallToolResult> {
  try {
    return text(await fn());
  } catch (error) {
    return failure(error);
  }
}

type ToolContext = { http?: { authInfo?: AuthInfo } };

function auth(ctx: ToolContext) {
  const token = ctx.http?.authInfo?.token;
  if (!token) {
    throw new Error("Missing access token");
  }
  const client = ctx.http?.authInfo?.extra?.client;
  return { token, client: typeof client === "string" ? client.slice(0, 200) : undefined };
}

const INSTRUCTIONS = `You are connected to Kalami, a learning and exam platform, as the study companion of the student who signed in. Everything you see is theirs and read-only: their courses, the weekly lessons, presentations and materials, what is due, and the work they have finished (tasks, quizzes, exams) with their own answers and, where the lecturer allows, what was right.

Start with whoami, then list_courses. get_course gives a course's weeks: each week's lessons, presentations, materials (links and a Google Drive folder) and its tasks and quizzes with where the student stands. get_lesson gives a lesson's full content and get_presentation a presentation's slides. find_in_courses finds where a topic was covered, in lessons and presentations. my_progress and whats_next show every piece of work and the deadlines.

Studying together:
- Explain ideas from the lessons and presentations in the student's own words, with examples; point to the lesson or presentation and the week it comes from. A presentation's speaker notes say what the lecturer meant to tell the class on each slide. Answer in the language the student writes in (lessons are in the course's language: ka = Georgian, en = English).
- After finished work (get_my_work), go through it question by question: what they answered, why a wrong answer was wrong, what the right idea is, and which lesson covers it. Be kind and concrete; celebrate what went well.
- Make practice questions and small exercises from the lessons, and quiz the student on them.
- Help them plan around whats_next: what to read before which deadline.

Rules:
- Work that isn't finished can't be seen: get_my_work tells you why (not started, in progress, retakes left, not opened). Never help with an open quiz, exam or task: don't ask the student to paste its questions, don't guess answers for it. Tell them to finish it in Kalami first.
- Correct answers and explanations appear only when the lecturer's results setting shows them; if they don't, say so and work from the lessons instead.
- You can't change anything in Kalami (no answers, no submissions, no notes). Don't invent course facts such as dates or grading rules; if something isn't in the materials, say so.`;

const courseId = z.string().describe("Course id from list_courses");

// --- The server --------------------------------------------------------------

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "whoami",
      {
        title: "Who am I",
        description: "The signed-in student: name, university, language, and how many courses they are in.",
        inputSchema: z.object({}),
      },
      async (_args, ctx) =>
        run(async () => {
          const me = await convex.query(api.study.whoami, auth(ctx));
          return me ?? "Not signed in to Kalami as a student. Reconnect Kalami and sign in again.";
        }),
    );

    server.registerTool(
      "list_courses",
      {
        title: "List my courses",
        description: "Every course the student is in, with the lecturer and how much work is open right now.",
        inputSchema: z.object({}),
      },
      async (_args, ctx) => run(() => convex.query(api.study.listCourses, auth(ctx))),
    );

    server.registerTool(
      "get_course",
      {
        title: "Get course",
        description:
          "A course week by week: each week's lessons and presentations (ids and titles), materials (links, Google Drive folder), and its tasks and quizzes with their state (upcoming, open, closed) and the student's result. Exams are the midterm/final items.",
        inputSchema: z.object({ courseId }),
      },
      async (args, ctx) => run(() => convex.query(api.study.getCourse, { ...auth(ctx), courseId: args.courseId as Id<"courses"> })),
    );

    server.registerTool(
      "get_lesson",
      {
        title: "Get lesson",
        description:
          "A lesson's full content: text (Markdown), definitions and tips, code examples, images and videos, step-by-step guides and quick checks, plus the previous and next lesson.",
        inputSchema: z.object({ lessonId: z.string().describe("Lesson id from get_course or find_in_courses") }),
      },
      async (args, ctx) => run(() => convex.query(api.study.getLesson, { ...auth(ctx), lessonId: args.lessonId as Id<"lessons"> })),
    );

    server.registerTool(
      "get_presentation",
      {
        title: "Get presentation",
        description:
          "A presentation's slides in order: each slide's type (title, section, statement, points, number, compare, quote, code, image, diagram, closing) and its words, plus the lecturer's speaker notes. **Double asterisks** mark the words the lecturer stressed.",
        inputSchema: z.object({ presentationId: z.string().describe("Presentation id from get_course or find_in_courses") }),
      },
      async (args, ctx) =>
        run(() =>
          convex.query(api.study.getPresentation, { ...auth(ctx), presentationId: args.presentationId as Id<"presentations"> }),
        ),
    );

    server.registerTool(
      "find_in_courses",
      {
        title: "Find in courses",
        description:
          "Where a word or phrase appears in the student's published lessons and presentations, across all their courses, with a snippet each. Each hit says whether it is a lesson (lessonId) or a presentation (presentationId).",
        inputSchema: z.object({ query: z.string().min(2).max(100).describe("A word or short phrase, e.g. “box model”") }),
      },
      async (args, ctx) => run(() => convex.query(api.study.findInCourses, { ...auth(ctx), query: args.query })),
    );

    server.registerTool(
      "my_progress",
      {
        title: "My progress",
        description:
          "Every course with every task, quiz and exam: its state, whether the student started, is in the middle, or submitted it, the score where the lecturer shows it, and whether it is finished (can be analysed with get_my_work).",
        inputSchema: z.object({}),
      },
      async (_args, ctx) => run(() => convex.query(api.study.progress, auth(ctx))),
    );

    server.registerTool(
      "whats_next",
      {
        title: "What's next",
        description: "Open work the student hasn't submitted yet, across all courses, nearest deadline first.",
        inputSchema: z.object({}),
      },
      async (_args, ctx) => run(() => convex.query(api.study.upNext, auth(ctx))),
    );

    server.registerTool(
      "get_my_work",
      {
        title: "Get my finished work",
        description:
          "A finished task, quiz or exam: the questions as the student saw them, their own answers, points, the score and the lecturer's feedback and comments, as far as the lecturer's results setting shows them (correct answers and explanations only with full results). For code tasks: the student's files and the checks. Answers {available: false, reason} for work that isn't finished.",
        inputSchema: z.object({ assessmentId: z.string().describe("Assessment id from get_course or my_progress") }),
      },
      async (args, ctx) =>
        run(() => convex.query(api.study.getWork, { ...auth(ctx), assessmentId: args.assessmentId as Id<"assessments"> })),
    );
  },
  {
    serverInfo: { name: "kalami-study", version: "1.0.0" },
    instructions: INSTRUCTIONS,
  },
);

/**
 * Checks the bearer token of an MCP request: a Clerk OAuth access token from
 * "Sign in with Kalami". It becomes a short signed credential that tells Convex
 * which Clerk user this is, and Convex decides whether the person is a student:
 * anyone else gets undefined here, so a 401.
 */
export async function verifyToken(req: Request, token: string | undefined): Promise<AuthInfo | undefined> {
  if (!token) {
    return undefined;
  }
  const oauth = await verifyOAuthToken(req).catch((error: unknown) => {
    console.error("MCP OAuth token check failed", error);
    return null;
  });
  if (oauth === null) {
    return undefined;
  }
  const credential = await serviceCredential(oauth.userId);
  const me = await convex.query(api.study.whoami, { token: credential, client: oauth.clientId });
  if (me === null) {
    return undefined;
  }
  return {
    token: credential,
    clientId: me.userId,
    scopes: oauth.scopes,
    extra: { email: me.email, origin: publicOrigin(req), client: oauth.clientId },
  };
}

/** Serves an MCP request for a caller that was already verified (for tests). */
export function handleVerified(req: Request, authInfo: AuthInfo): Promise<Response> {
  // mcp-handler reads the caller from `req.auth`, the same field withMcpAuth sets.
  (req as Request & { auth?: AuthInfo }).auth = authInfo;
  return handler(req);
}

/** /api/mcp: bearer tokens are checked against Convex; anything else is a 401. */
export const headerAuthHandler = withMcpAuth(handler, verifyToken, { required: true });
