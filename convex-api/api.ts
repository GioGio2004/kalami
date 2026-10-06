import { type FunctionReference, anyApi } from "convex/server";
import { type GenericId as Id } from "convex/values";

export const api: PublicApiType = anyApi as unknown as PublicApiType;
export const internal: InternalApiType = anyApi as unknown as InternalApiType;

export type PublicApiType = {
  assessments: {
    create: FunctionReference<
      "mutation",
      "public",
      {
        courseId: Id<"courses">;
        instructions?: string;
        kind: "task" | "quiz" | "midterm" | "final";
        settings?: {
          attemptsAllowed?: number;
          closesAt?: number;
          integrityLevel?: "off" | "standard" | "strict";
          opensAt?: number;
          resultsVisibility?: "hidden" | "score" | "full_after_close";
          shuffleOptions?: boolean;
          shuffleQuestions?: boolean;
          timeLimitMin?: number;
        };
        title: string;
        weekId?: Id<"weeks">;
      },
      Id<"assessments">
    >;
    get: FunctionReference<
      "query",
      "public",
      { assessmentId: Id<"assessments"> },
      {
        assessment: {
          _creationTime: number;
          _id: Id<"assessments">;
          courseId: Id<"courses">;
          createdVia: "web" | "mcp";
          instructions?: string;
          kind: "task" | "quiz" | "midterm" | "final";
          publishedAt?: number;
          questionCount: number;
          settings: {
            attemptsAllowed: number;
            closesAt?: number;
            integrityLevel: "off" | "standard" | "strict";
            opensAt?: number;
            resultsVisibility: "hidden" | "score" | "full_after_close";
            shuffleOptions: boolean;
            shuffleQuestions: boolean;
            timeLimitMin?: number;
          };
          status: "draft" | "published" | "archived";
          title: string;
          totalPoints: number;
          updatedAt: number;
          weekId?: Id<"weeks">;
        };
        canEdit: boolean;
        course: { _id: Id<"courses">; title: string };
        questions: Array<{
          _id: Id<"questions">;
          code?: {
            assets: Array<{ alt?: string; name: string; url: string }>;
            files: Array<{ content: string; name: string }>;
            steps: Array<{
              checks: Array<
                | {
                    id: string;
                    label: string;
                    selector: string;
                    type: "exists";
                  }
                | {
                    id: string;
                    label: string;
                    selector: string;
                    type: "not_exists";
                  }
                | {
                    id: string;
                    label: string;
                    max?: number;
                    min?: number;
                    selector: string;
                    type: "count";
                  }
                | {
                    caseSensitive?: boolean;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    id: string;
                    label: string;
                    selector: string;
                    type: "text";
                  }
                | {
                    attribute: string;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    id: string;
                    label: string;
                    selector: string;
                    type: "attr";
                  }
                | {
                    equals?: string;
                    every?: boolean;
                    id: string;
                    label: string;
                    oneOf?: Array<string>;
                    property: string;
                    selector: string;
                    type: "css";
                    viewport?: number;
                  }
                | { href: string; id: string; label: string; type: "linked" }
              >;
              hint?: string;
              instructions: string;
              title: string;
            }>;
            variables?: Array<{ name: string; values: Array<string> }>;
          };
          createdVia: "web" | "mcp";
          explanation?: string;
          key:
            | { correctOptionId: string; type: "single" }
            | { correctOptionIds: Array<string>; type: "multiple" }
            | {
                acceptedAnswers: Array<string>;
                caseSensitive: boolean;
                type: "short";
              }
            | { rubric?: string; type: "essay" }
            | {
                hiddenChecks: Array<
                  | {
                      id: string;
                      label: string;
                      selector: string;
                      type: "exists";
                    }
                  | {
                      id: string;
                      label: string;
                      selector: string;
                      type: "not_exists";
                    }
                  | {
                      id: string;
                      label: string;
                      max?: number;
                      min?: number;
                      selector: string;
                      type: "count";
                    }
                  | {
                      caseSensitive?: boolean;
                      contains?: string;
                      equals?: string;
                      every?: boolean;
                      id: string;
                      label: string;
                      selector: string;
                      type: "text";
                    }
                  | {
                      attribute: string;
                      contains?: string;
                      equals?: string;
                      every?: boolean;
                      id: string;
                      label: string;
                      selector: string;
                      type: "attr";
                    }
                  | {
                      equals?: string;
                      every?: boolean;
                      id: string;
                      label: string;
                      oneOf?: Array<string>;
                      property: string;
                      selector: string;
                      type: "css";
                      viewport?: number;
                    }
                  | { href: string; id: string; label: string; type: "linked" }
                >;
                solution: Array<{ content: string; name: string }>;
                type: "code";
              };
          options?: Array<{ id: string; text: string }>;
          order: number;
          points: number;
          prompt: string;
          type: "single" | "multiple" | "short" | "essay" | "code";
        }>;
        started: number;
      }
    >;
    update: FunctionReference<
      "mutation",
      "public",
      {
        assessmentId: Id<"assessments">;
        instructions?: string;
        kind?: "task" | "quiz" | "midterm" | "final";
        settings?: {
          attemptsAllowed?: number;
          closesAt?: number;
          integrityLevel?: "off" | "standard" | "strict";
          opensAt?: number;
          resultsVisibility?: "hidden" | "score" | "full_after_close";
          shuffleOptions?: boolean;
          shuffleQuestions?: boolean;
          timeLimitMin?: number;
        };
        title?: string;
      },
      null
    >;
    setStatus: FunctionReference<
      "mutation",
      "public",
      {
        assessmentId: Id<"assessments">;
        status: "draft" | "published" | "archived";
      },
      null
    >;
    remove: FunctionReference<
      "mutation",
      "public",
      { assessmentId: Id<"assessments"> },
      null
    >;
  };
  audit: {
    recentForMe: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{
        _id: Id<"auditLog">;
        action: string;
        actorName: string;
        at: number;
        courseId?: Id<"courses">;
        mine: boolean;
        summary: string;
        targetId: string;
        targetTable: string;
        via: "web" | "mcp";
      }>
    >;
    recentForCourse: FunctionReference<
      "query",
      "public",
      { courseId: Id<"courses"> },
      Array<{
        _id: Id<"auditLog">;
        action: string;
        actorName: string;
        at: number;
        courseId?: Id<"courses">;
        mine: boolean;
        summary: string;
        targetId: string;
        targetTable: string;
        via: "web" | "mcp";
      }>
    >;
  };
  courses: {
    listMine: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{
        _creationTime: number;
        _id: Id<"courses">;
        canEdit: boolean;
        counts: {
          drafts: number;
          finals: number;
          midterms: number;
          published: number;
          quizzes: number;
          tasks: number;
        };
        createdVia: "web" | "mcp";
        description?: string;
        joinCode: string;
        joinEnabled: boolean;
        locale: "ka" | "en";
        role: "owner" | "assistant" | "admin" | "super_admin";
        semester?: string;
        status: "draft" | "published" | "archived";
        students: number;
        title: string;
        universityId?: Id<"universities">;
        universityName?: { en: string; ka: string };
        updatedAt: number;
      }>
    >;
    get: FunctionReference<
      "query",
      "public",
      { courseId: Id<"courses"> },
      {
        _creationTime: number;
        _id: Id<"courses">;
        assessments: Array<{
          _creationTime: number;
          _id: Id<"assessments">;
          courseId: Id<"courses">;
          createdVia: "web" | "mcp";
          instructions?: string;
          kind: "task" | "quiz" | "midterm" | "final";
          publishedAt?: number;
          questionCount: number;
          settings: {
            attemptsAllowed: number;
            closesAt?: number;
            integrityLevel: "off" | "standard" | "strict";
            opensAt?: number;
            resultsVisibility: "hidden" | "score" | "full_after_close";
            shuffleOptions: boolean;
            shuffleQuestions: boolean;
            timeLimitMin?: number;
          };
          status: "draft" | "published" | "archived";
          title: string;
          totalPoints: number;
          updatedAt: number;
          weekId?: Id<"weeks">;
        }>;
        canEdit: boolean;
        counts: {
          drafts: number;
          finals: number;
          midterms: number;
          published: number;
          quizzes: number;
          tasks: number;
        };
        createdVia: "web" | "mcp";
        description?: string;
        joinCode: string;
        joinEnabled: boolean;
        locale: "ka" | "en";
        role: "owner" | "assistant" | "admin" | "super_admin";
        semester?: string;
        status: "draft" | "published" | "archived";
        students: number;
        title: string;
        universityId?: Id<"universities">;
        universityName?: { en: string; ka: string };
        updatedAt: number;
      }
    >;
    universitiesForNewCourse: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{ _id: Id<"universities">; name: { en: string; ka: string } }>
    >;
    create: FunctionReference<
      "mutation",
      "public",
      {
        description?: string;
        locale?: "ka" | "en";
        semester?: string;
        title: string;
        universityId?: Id<"universities"> | null;
      },
      Id<"courses">
    >;
    update: FunctionReference<
      "mutation",
      "public",
      {
        courseId: Id<"courses">;
        description?: string;
        locale?: "ka" | "en";
        semester?: string;
        status?: "draft" | "published" | "archived";
        title?: string;
      },
      null
    >;
    newJoinCode: FunctionReference<
      "mutation",
      "public",
      { courseId: Id<"courses"> },
      string
    >;
    setJoining: FunctionReference<
      "mutation",
      "public",
      { courseId: Id<"courses">; enabled: boolean },
      null
    >;
    remove: FunctionReference<
      "mutation",
      "public",
      { courseId: Id<"courses"> },
      null
    >;
  };
  honesty: {
    current: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      {
        en: {
          intro: string;
          sections: Array<{ heading: string; items: Array<string> }>;
          title: string;
        };
        ka: {
          intro: string;
          sections: Array<{ heading: string; items: Array<string> }>;
          title: string;
        };
        version: number;
      }
    >;
  };
  invites: {
    create: FunctionReference<
      "mutation",
      "public",
      {
        email: string;
        role: "lecturer" | "uni_admin";
        universityId?: Id<"universities">;
      },
      {
        email: "sent" | "recent" | "off";
        inviteId: Id<"invites">;
        token: string;
      }
    >;
    resendEmail: FunctionReference<
      "mutation",
      "public",
      { inviteId: Id<"invites"> },
      "sent" | "recent" | "off"
    >;
    listForUniversity: FunctionReference<
      "query",
      "public",
      { universityId?: Id<"universities"> },
      Array<{
        _creationTime: number;
        _id: Id<"invites">;
        acceptedAt?: number;
        email: string;
        emailedAt?: number;
        expiresAt: number;
        revokedAt?: number;
        role: "lecturer" | "uni_admin";
        token?: string;
      }>
    >;
    listAll: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{
        _creationTime: number;
        _id: Id<"invites">;
        acceptedAt?: number;
        email: string;
        emailedAt?: number;
        expiresAt: number;
        revokedAt?: number;
        role: "lecturer" | "uni_admin";
        token?: string;
        universityId?: Id<"universities">;
        universityName?: { en: string; ka: string };
      }>
    >;
    getByToken: FunctionReference<
      "query",
      "public",
      { token: string },
      null | {
        email: string;
        expiresAt: number;
        role: "lecturer" | "uni_admin";
        status: "pending" | "accepted" | "revoked";
        universityName?: { en: string; ka: string };
      }
    >;
    accept: FunctionReference<
      "mutation",
      "public",
      { token: string },
      { role: "lecturer" | "uni_admin"; universityId?: Id<"universities"> }
    >;
    revoke: FunctionReference<
      "mutation",
      "public",
      { inviteId: Id<"invites"> },
      null
    >;
  };
  learn: {
    join: FunctionReference<
      "mutation",
      "public",
      { code: string },
      { courseId: Id<"courses">; ok: true } | { message: string; ok: false }
    >;
    myCourses: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{
        _id: Id<"courses">;
        archived: boolean;
        description?: string;
        lecturer: string;
        openCount: number;
        semester?: string;
        title: string;
      }>
    >;
    upNext: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{
        _id: Id<"assessments">;
        closesAt?: number;
        courseId: Id<"courses">;
        courseTitle: string;
        kind: "task" | "quiz" | "midterm" | "final";
        playable: boolean;
        started: boolean;
        title: string;
      }>
    >;
    course: FunctionReference<
      "query",
      "public",
      { courseId: Id<"courses"> },
      {
        _id: Id<"courses">;
        archived: boolean;
        assessments: Array<{
          _id: Id<"assessments">;
          closesAt?: number;
          kind: "task" | "quiz" | "midterm" | "final";
          opensAt?: number;
          playable: boolean;
          questionCount: number;
          result: null | {
            score?: number;
            status: "in_progress" | "submitted";
            submittedAt?: number;
          };
          state: "upcoming" | "open" | "closed";
          title: string;
          totalPoints: number;
          weekId?: Id<"weeks">;
        }>;
        description?: string;
        lecturer: string;
        materials: Array<{
          _id: string;
          description?: string;
          host: string;
          source: "drive" | "link";
          title: string;
          url: string;
        }>;
        semester?: string;
        title: string;
        weeks: Array<{
          _id: Id<"weeks">;
          description?: string;
          driveUrl?: string;
          lessons: Array<{ _id: Id<"lessons">; title: string }>;
          links: Array<{
            host: string;
            id: string;
            title: string;
            url: string;
          }>;
          title: string;
        }>;
      }
    >;
    task: FunctionReference<
      "query",
      "public",
      { assessmentId: Id<"assessments"> },
      {
        assessment: {
          _id: Id<"assessments">;
          closesAt?: number;
          instructions?: string;
          integrityLevel: "off" | "standard" | "strict";
          resultsVisibility: "hidden" | "score" | "full_after_close";
          state: "open" | "closed";
          title: string;
          totalPoints: number;
        };
        attempt: null | {
          autoSubmitted: boolean;
          feedback?: string;
          maxScore: number;
          score?: number;
          startedAt: number;
          status: "in_progress" | "submitted";
          submittedAt?: number;
        };
        comments: Array<{
          _id: Id<"codeComments">;
          author: string;
          file: string;
          line: number;
          questionId: Id<"questions">;
          text: string;
        }>;
        course: { _id: Id<"courses">; title: string };
        hiddenChecks: Array<{
          id: string;
          label: string;
          questionId: Id<"questions">;
        }>;
        questions: Array<{
          _id: Id<"questions">;
          code: {
            assets: Array<{ alt?: string; name: string; url: string }>;
            files: Array<{ content: string; name: string }>;
            steps: Array<{
              checks: Array<
                | {
                    id: string;
                    label: string;
                    selector: string;
                    type: "exists";
                  }
                | {
                    id: string;
                    label: string;
                    selector: string;
                    type: "not_exists";
                  }
                | {
                    id: string;
                    label: string;
                    max?: number;
                    min?: number;
                    selector: string;
                    type: "count";
                  }
                | {
                    caseSensitive?: boolean;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    id: string;
                    label: string;
                    selector: string;
                    type: "text";
                  }
                | {
                    attribute: string;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    id: string;
                    label: string;
                    selector: string;
                    type: "attr";
                  }
                | {
                    equals?: string;
                    every?: boolean;
                    id: string;
                    label: string;
                    oneOf?: Array<string>;
                    property: string;
                    selector: string;
                    type: "css";
                    viewport?: number;
                  }
                | { href: string; id: string; label: string; type: "linked" }
              >;
              hint?: string;
              instructions: string;
              title: string;
            }>;
          };
          points: number;
          prompt: string;
        }>;
        responses: Array<{
          autoScore?: number;
          checkResults?: Array<{ id: string; passed: boolean }>;
          files: Array<{ content: string; name: string }>;
          progress?: { passed: Array<string>; step: number };
          questionId: Id<"questions">;
          savedAt: number;
        }>;
        unsupported: number;
      }
    >;
    saveCodeWork: FunctionReference<
      "mutation",
      "public",
      {
        assessmentId: Id<"assessments">;
        files: Array<{ content: string; name: string }>;
        integrity?: {
          awayMs?: number;
          copyBlocked?: number;
          dropBlocked?: number;
          fullscreenExits?: number;
          largeInserts?: number;
          multiTab?: number;
          pasteBlocked?: number;
          resizes?: number;
          shortcutsBlocked?: number;
          tabSwitches?: number;
        };
        questionId: Id<"questions">;
      },
      { progress: { passed: Array<string>; step: number }; savedAt: number }
    >;
    quiz: FunctionReference<
      "query",
      "public",
      { assessmentId: Id<"assessments"> },
      {
        assessment: {
          _id: Id<"assessments">;
          attemptsAllowed: number;
          closesAt?: number;
          codeQuestionCount: number;
          instructions?: string;
          integrityLevel: "off" | "standard" | "strict";
          kind: "task" | "quiz" | "midterm" | "final";
          questionCount: number;
          resultsVisibility: "hidden" | "score" | "full_after_close";
          state: "open" | "closed";
          timeLimitMin?: number;
          title: string;
          totalPoints: number;
        };
        attempt: null | {
          _id: Id<"attempts">;
          autoSubmitted: boolean;
          deadlineAt?: number;
          feedback?: string;
          maxScore: number;
          number: number;
          pendingGrading: boolean;
          score?: number;
          startedAt: number;
          status: "in_progress" | "submitted";
          submittedAt?: number;
        };
        attemptsUsed: number;
        comments: Array<{
          _id: Id<"codeComments">;
          author: string;
          file: string;
          line: number;
          questionId: Id<"questions">;
          text: string;
        }>;
        course: { _id: Id<"courses">; title: string };
        questions: Array<{
          _id: Id<"questions">;
          code?: {
            assets: Array<{ alt?: string; name: string; url: string }>;
            files: Array<{ content: string; name: string }>;
            steps: Array<{
              checks: Array<
                | {
                    id: string;
                    label: string;
                    selector: string;
                    type: "exists";
                  }
                | {
                    id: string;
                    label: string;
                    selector: string;
                    type: "not_exists";
                  }
                | {
                    id: string;
                    label: string;
                    max?: number;
                    min?: number;
                    selector: string;
                    type: "count";
                  }
                | {
                    caseSensitive?: boolean;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    id: string;
                    label: string;
                    selector: string;
                    type: "text";
                  }
                | {
                    attribute: string;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    id: string;
                    label: string;
                    selector: string;
                    type: "attr";
                  }
                | {
                    equals?: string;
                    every?: boolean;
                    id: string;
                    label: string;
                    oneOf?: Array<string>;
                    property: string;
                    selector: string;
                    type: "css";
                    viewport?: number;
                  }
                | { href: string; id: string; label: string; type: "linked" }
              >;
              hint?: string;
              instructions: string;
              title: string;
            }>;
          };
          options?: Array<{ id: string; text: string }>;
          points: number;
          prompt: string;
          type: "single" | "multiple" | "short" | "essay" | "code";
        }>;
        review: Array<{
          acceptedAnswers?: Array<string>;
          correctOptionIds?: Array<string>;
          explanation?: string;
          points?: number;
          questionId: Id<"questions">;
        }>;
        serverNow: number;
      }
    >;
    quizAnswers: FunctionReference<
      "query",
      "public",
      { assessmentId: Id<"assessments"> },
      {
        answers: Array<{
          questionId: Id<"questions">;
          savedAt: number;
          value:
            | { files: Array<{ content: string; name: string }>; type: "code" }
            | { optionId: string; type: "single" }
            | { optionIds: Array<string>; type: "multiple" }
            | { text: string; type: "short" }
            | { text: string; type: "essay" };
        }>;
      }
    >;
    startAttempt: FunctionReference<
      "mutation",
      "public",
      { assessmentId: Id<"assessments"> },
      Id<"attempts">
    >;
    saveQuizAnswer: FunctionReference<
      "mutation",
      "public",
      {
        answer:
          | { optionId: string; type: "single" }
          | { optionIds: Array<string>; type: "multiple" }
          | { text: string; type: "short" }
          | { text: string; type: "essay" };
        assessmentId: Id<"assessments">;
        integrity?: {
          awayMs?: number;
          copyBlocked?: number;
          dropBlocked?: number;
          fullscreenExits?: number;
          largeInserts?: number;
          multiTab?: number;
          pasteBlocked?: number;
          resizes?: number;
          shortcutsBlocked?: number;
          tabSwitches?: number;
        };
        questionId: Id<"questions">;
      },
      { savedAt: number }
    >;
    reportIntegrityCounts: FunctionReference<
      "mutation",
      "public",
      {
        assessmentId: Id<"assessments">;
        counts: {
          awayMs?: number;
          copyBlocked?: number;
          dropBlocked?: number;
          fullscreenExits?: number;
          largeInserts?: number;
          multiTab?: number;
          pasteBlocked?: number;
          resizes?: number;
          shortcutsBlocked?: number;
          tabSwitches?: number;
        };
      },
      null
    >;
    submit: FunctionReference<
      "mutation",
      "public",
      { assessmentId: Id<"assessments"> },
      null
    >;
  };
  mcp: {
    whoami: FunctionReference<
      "query",
      "public",
      { client?: string; token: string },
      null | {
        email: string;
        isSuperAdmin: boolean;
        name: string;
        roles: Array<{
          role: "student" | "lecturer" | "uni_admin" | "super_admin";
          universityId?: Id<"universities">;
          universityName?: { en: string; ka: string };
        }>;
        universities: Array<{
          _id: Id<"universities">;
          name: { en: string; ka: string };
        }>;
        userId: Id<"users">;
      }
    >;
    listCourses: FunctionReference<
      "query",
      "public",
      { client?: string; token: string },
      Array<{
        _creationTime: number;
        _id: Id<"courses">;
        canEdit: boolean;
        counts: {
          drafts: number;
          finals: number;
          midterms: number;
          published: number;
          quizzes: number;
          tasks: number;
        };
        createdVia: "web" | "mcp";
        description?: string;
        locale: "ka" | "en";
        role: "owner" | "assistant" | "admin" | "super_admin";
        semester?: string;
        status: "draft" | "published" | "archived";
        students: number;
        title: string;
        universityId?: Id<"universities">;
        universityName?: { en: string; ka: string };
        updatedAt: number;
      }>
    >;
    getCourse: FunctionReference<
      "query",
      "public",
      { client?: string; courseId: Id<"courses">; token: string },
      {
        _creationTime: number;
        _id: Id<"courses">;
        assessments: Array<{
          _creationTime: number;
          _id: Id<"assessments">;
          courseId: Id<"courses">;
          createdVia: "web" | "mcp";
          instructions?: string;
          kind: "task" | "quiz" | "midterm" | "final";
          publishedAt?: number;
          questionCount: number;
          settings: {
            attemptsAllowed: number;
            closesAt?: number;
            integrityLevel: "off" | "standard" | "strict";
            opensAt?: number;
            resultsVisibility: "hidden" | "score" | "full_after_close";
            shuffleOptions: boolean;
            shuffleQuestions: boolean;
            timeLimitMin?: number;
          };
          status: "draft" | "published" | "archived";
          title: string;
          totalPoints: number;
          updatedAt: number;
          weekId?: Id<"weeks">;
        }>;
        canEdit: boolean;
        counts: {
          drafts: number;
          finals: number;
          midterms: number;
          published: number;
          quizzes: number;
          tasks: number;
        };
        createdVia: "web" | "mcp";
        description?: string;
        locale: "ka" | "en";
        role: "owner" | "assistant" | "admin" | "super_admin";
        semester?: string;
        status: "draft" | "published" | "archived";
        students: number;
        title: string;
        universityId?: Id<"universities">;
        universityName?: { en: string; ka: string };
        updatedAt: number;
      }
    >;
    createCourseAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        client?: string;
        description?: string;
        locale?: "ka" | "en";
        requestId?: string;
        semester?: string;
        title: string;
        token: string;
        universityId?: Id<"universities">;
      },
      Id<"courses">
    >;
    updateCourseAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        client?: string;
        courseId: Id<"courses">;
        description?: string;
        locale?: "ka" | "en";
        semester?: string;
        title?: string;
        token: string;
      },
      null
    >;
    getAssessment: FunctionReference<
      "query",
      "public",
      { assessmentId: Id<"assessments">; client?: string; token: string },
      {
        assessment: {
          _creationTime: number;
          _id: Id<"assessments">;
          courseId: Id<"courses">;
          createdVia: "web" | "mcp";
          instructions?: string;
          kind: "task" | "quiz" | "midterm" | "final";
          publishedAt?: number;
          questionCount: number;
          settings: {
            attemptsAllowed: number;
            closesAt?: number;
            integrityLevel: "off" | "standard" | "strict";
            opensAt?: number;
            resultsVisibility: "hidden" | "score" | "full_after_close";
            shuffleOptions: boolean;
            shuffleQuestions: boolean;
            timeLimitMin?: number;
          };
          status: "draft" | "published" | "archived";
          title: string;
          totalPoints: number;
          updatedAt: number;
          weekId?: Id<"weeks">;
        };
        canEdit: boolean;
        course: { _id: Id<"courses">; title: string };
        questions: Array<{
          _id: Id<"questions">;
          code?: {
            assets: Array<{ alt?: string; name: string; url: string }>;
            files: Array<{ content: string; name: string }>;
            steps: Array<{
              checks: Array<
                | {
                    id: string;
                    label: string;
                    selector: string;
                    type: "exists";
                  }
                | {
                    id: string;
                    label: string;
                    selector: string;
                    type: "not_exists";
                  }
                | {
                    id: string;
                    label: string;
                    max?: number;
                    min?: number;
                    selector: string;
                    type: "count";
                  }
                | {
                    caseSensitive?: boolean;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    id: string;
                    label: string;
                    selector: string;
                    type: "text";
                  }
                | {
                    attribute: string;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    id: string;
                    label: string;
                    selector: string;
                    type: "attr";
                  }
                | {
                    equals?: string;
                    every?: boolean;
                    id: string;
                    label: string;
                    oneOf?: Array<string>;
                    property: string;
                    selector: string;
                    type: "css";
                    viewport?: number;
                  }
                | { href: string; id: string; label: string; type: "linked" }
              >;
              hint?: string;
              instructions: string;
              title: string;
            }>;
            variables?: Array<{ name: string; values: Array<string> }>;
          };
          createdVia: "web" | "mcp";
          explanation?: string;
          key:
            | { correctOptionId: string; type: "single" }
            | { correctOptionIds: Array<string>; type: "multiple" }
            | {
                acceptedAnswers: Array<string>;
                caseSensitive: boolean;
                type: "short";
              }
            | { rubric?: string; type: "essay" }
            | {
                hiddenChecks: Array<
                  | {
                      id: string;
                      label: string;
                      selector: string;
                      type: "exists";
                    }
                  | {
                      id: string;
                      label: string;
                      selector: string;
                      type: "not_exists";
                    }
                  | {
                      id: string;
                      label: string;
                      max?: number;
                      min?: number;
                      selector: string;
                      type: "count";
                    }
                  | {
                      caseSensitive?: boolean;
                      contains?: string;
                      equals?: string;
                      every?: boolean;
                      id: string;
                      label: string;
                      selector: string;
                      type: "text";
                    }
                  | {
                      attribute: string;
                      contains?: string;
                      equals?: string;
                      every?: boolean;
                      id: string;
                      label: string;
                      selector: string;
                      type: "attr";
                    }
                  | {
                      equals?: string;
                      every?: boolean;
                      id: string;
                      label: string;
                      oneOf?: Array<string>;
                      property: string;
                      selector: string;
                      type: "css";
                      viewport?: number;
                    }
                  | { href: string; id: string; label: string; type: "linked" }
                >;
                solution: Array<{ content: string; name: string }>;
                type: "code";
              };
          options?: Array<{ id: string; text: string }>;
          order: number;
          points: number;
          prompt: string;
          type: "single" | "multiple" | "short" | "essay" | "code";
        }>;
        started: number;
      }
    >;
    createAssessmentAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        client?: string;
        courseId: Id<"courses">;
        instructions?: string;
        kind: "task" | "quiz" | "midterm" | "final";
        requestId?: string;
        settings?: {
          attemptsAllowed?: number;
          closesAt?: number;
          integrityLevel?: "off" | "standard" | "strict";
          opensAt?: number;
          resultsVisibility?: "hidden" | "score" | "full_after_close";
          shuffleOptions?: boolean;
          shuffleQuestions?: boolean;
          timeLimitMin?: number;
        };
        title: string;
        token: string;
        weekId?: Id<"weeks">;
      },
      Id<"assessments">
    >;
    updateAssessmentAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        assessmentId: Id<"assessments">;
        client?: string;
        instructions?: string;
        kind?: "task" | "quiz" | "midterm" | "final";
        settings?: {
          attemptsAllowed?: number;
          closesAt?: number;
          integrityLevel?: "off" | "standard" | "strict";
          opensAt?: number;
          resultsVisibility?: "hidden" | "score" | "full_after_close";
          shuffleOptions?: boolean;
          shuffleQuestions?: boolean;
          timeLimitMin?: number;
        };
        title?: string;
        token: string;
      },
      null
    >;
    deleteAssessmentAsAgent: FunctionReference<
      "mutation",
      "public",
      { assessmentId: Id<"assessments">; client?: string; token: string },
      null
    >;
    addQuestionsAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        assessmentId: Id<"assessments">;
        client?: string;
        questions: Array<
          | {
              explanation?: string;
              options: Array<{ correct: boolean; text: string }>;
              points?: number;
              prompt: string;
              type: "single";
            }
          | {
              explanation?: string;
              options: Array<{ correct: boolean; text: string }>;
              points?: number;
              prompt: string;
              type: "multiple";
            }
          | {
              acceptedAnswers: Array<string>;
              caseSensitive?: boolean;
              explanation?: string;
              points?: number;
              prompt: string;
              type: "short";
            }
          | {
              explanation?: string;
              points?: number;
              prompt: string;
              rubric?: string;
              type: "essay";
            }
          | {
              assets?: Array<{ alt?: string; name: string; url: string }>;
              explanation?: string;
              hiddenChecks?: Array<
                | { label: string; selector: string; type: "exists" }
                | { label: string; selector: string; type: "not_exists" }
                | {
                    label: string;
                    max?: number;
                    min?: number;
                    selector: string;
                    type: "count";
                  }
                | {
                    caseSensitive?: boolean;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    label: string;
                    selector: string;
                    type: "text";
                  }
                | {
                    attribute: string;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    label: string;
                    selector: string;
                    type: "attr";
                  }
                | {
                    equals?: string;
                    every?: boolean;
                    label: string;
                    oneOf?: Array<string>;
                    property: string;
                    selector: string;
                    type: "css";
                    viewport?: number;
                  }
                | { href: string; label: string; type: "linked" }
              >;
              points?: number;
              prompt: string;
              solution: Array<{ content: string; name: string }>;
              starterFiles: Array<{ content: string; name: string }>;
              steps: Array<{
                checks: Array<
                  | { label: string; selector: string; type: "exists" }
                  | { label: string; selector: string; type: "not_exists" }
                  | {
                      label: string;
                      max?: number;
                      min?: number;
                      selector: string;
                      type: "count";
                    }
                  | {
                      caseSensitive?: boolean;
                      contains?: string;
                      equals?: string;
                      every?: boolean;
                      label: string;
                      selector: string;
                      type: "text";
                    }
                  | {
                      attribute: string;
                      contains?: string;
                      equals?: string;
                      every?: boolean;
                      label: string;
                      selector: string;
                      type: "attr";
                    }
                  | {
                      equals?: string;
                      every?: boolean;
                      label: string;
                      oneOf?: Array<string>;
                      property: string;
                      selector: string;
                      type: "css";
                      viewport?: number;
                    }
                  | { href: string; label: string; type: "linked" }
                >;
                hint?: string;
                instructions: string;
                title: string;
              }>;
              type: "code";
              variables?: Array<{ name: string; values: Array<string> }>;
            }
        >;
        requestId?: string;
        token: string;
      },
      Array<Id<"questions">>
    >;
    updateQuestionAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        client?: string;
        question:
          | {
              explanation?: string;
              options: Array<{ correct: boolean; text: string }>;
              points?: number;
              prompt: string;
              type: "single";
            }
          | {
              explanation?: string;
              options: Array<{ correct: boolean; text: string }>;
              points?: number;
              prompt: string;
              type: "multiple";
            }
          | {
              acceptedAnswers: Array<string>;
              caseSensitive?: boolean;
              explanation?: string;
              points?: number;
              prompt: string;
              type: "short";
            }
          | {
              explanation?: string;
              points?: number;
              prompt: string;
              rubric?: string;
              type: "essay";
            }
          | {
              assets?: Array<{ alt?: string; name: string; url: string }>;
              explanation?: string;
              hiddenChecks?: Array<
                | { label: string; selector: string; type: "exists" }
                | { label: string; selector: string; type: "not_exists" }
                | {
                    label: string;
                    max?: number;
                    min?: number;
                    selector: string;
                    type: "count";
                  }
                | {
                    caseSensitive?: boolean;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    label: string;
                    selector: string;
                    type: "text";
                  }
                | {
                    attribute: string;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    label: string;
                    selector: string;
                    type: "attr";
                  }
                | {
                    equals?: string;
                    every?: boolean;
                    label: string;
                    oneOf?: Array<string>;
                    property: string;
                    selector: string;
                    type: "css";
                    viewport?: number;
                  }
                | { href: string; label: string; type: "linked" }
              >;
              points?: number;
              prompt: string;
              solution: Array<{ content: string; name: string }>;
              starterFiles: Array<{ content: string; name: string }>;
              steps: Array<{
                checks: Array<
                  | { label: string; selector: string; type: "exists" }
                  | { label: string; selector: string; type: "not_exists" }
                  | {
                      label: string;
                      max?: number;
                      min?: number;
                      selector: string;
                      type: "count";
                    }
                  | {
                      caseSensitive?: boolean;
                      contains?: string;
                      equals?: string;
                      every?: boolean;
                      label: string;
                      selector: string;
                      type: "text";
                    }
                  | {
                      attribute: string;
                      contains?: string;
                      equals?: string;
                      every?: boolean;
                      label: string;
                      selector: string;
                      type: "attr";
                    }
                  | {
                      equals?: string;
                      every?: boolean;
                      label: string;
                      oneOf?: Array<string>;
                      property: string;
                      selector: string;
                      type: "css";
                      viewport?: number;
                    }
                  | { href: string; label: string; type: "linked" }
                >;
                hint?: string;
                instructions: string;
                title: string;
              }>;
              type: "code";
              variables?: Array<{ name: string; values: Array<string> }>;
            };
        questionId: Id<"questions">;
        token: string;
      },
      null
    >;
    deleteQuestionAsAgent: FunctionReference<
      "mutation",
      "public",
      { client?: string; questionId: Id<"questions">; token: string },
      null
    >;
    reorderQuestionsAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        assessmentId: Id<"assessments">;
        client?: string;
        questionIds: Array<Id<"questions">>;
        token: string;
      },
      null
    >;
    checkCodeTask: FunctionReference<
      "query",
      "public",
      {
        client?: string;
        question: {
          assets?: Array<{ alt?: string; name: string; url: string }>;
          explanation?: string;
          hiddenChecks?: Array<
            | { label: string; selector: string; type: "exists" }
            | { label: string; selector: string; type: "not_exists" }
            | {
                label: string;
                max?: number;
                min?: number;
                selector: string;
                type: "count";
              }
            | {
                caseSensitive?: boolean;
                contains?: string;
                equals?: string;
                every?: boolean;
                label: string;
                selector: string;
                type: "text";
              }
            | {
                attribute: string;
                contains?: string;
                equals?: string;
                every?: boolean;
                label: string;
                selector: string;
                type: "attr";
              }
            | {
                equals?: string;
                every?: boolean;
                label: string;
                oneOf?: Array<string>;
                property: string;
                selector: string;
                type: "css";
                viewport?: number;
              }
            | { href: string; label: string; type: "linked" }
          >;
          points?: number;
          prompt: string;
          solution: Array<{ content: string; name: string }>;
          starterFiles: Array<{ content: string; name: string }>;
          steps: Array<{
            checks: Array<
              | { label: string; selector: string; type: "exists" }
              | { label: string; selector: string; type: "not_exists" }
              | {
                  label: string;
                  max?: number;
                  min?: number;
                  selector: string;
                  type: "count";
                }
              | {
                  caseSensitive?: boolean;
                  contains?: string;
                  equals?: string;
                  every?: boolean;
                  label: string;
                  selector: string;
                  type: "text";
                }
              | {
                  attribute: string;
                  contains?: string;
                  equals?: string;
                  every?: boolean;
                  label: string;
                  selector: string;
                  type: "attr";
                }
              | {
                  equals?: string;
                  every?: boolean;
                  label: string;
                  oneOf?: Array<string>;
                  property: string;
                  selector: string;
                  type: "css";
                  viewport?: number;
                }
              | { href: string; label: string; type: "linked" }
            >;
            hint?: string;
            instructions: string;
            title: string;
          }>;
          type: "code";
          variables?: Array<{ name: string; values: Array<string> }>;
        };
        token: string;
      },
      {
        errors: Array<string>;
        hidden: Array<{
          detail: string;
          id: string;
          label: string;
          onSolution: boolean;
          onStarter: boolean;
        }>;
        ok: boolean;
        steps: Array<{
          checks: Array<{
            detail: string;
            id: string;
            label: string;
            onSolution: boolean;
            onStarter: boolean;
          }>;
          title: string;
        }>;
        variants: number;
        warnings: Array<string>;
      }
    >;
    getCourseOutline: FunctionReference<
      "query",
      "public",
      { client?: string; courseId: Id<"courses">; token: string },
      {
        canEdit: boolean;
        courseId: Id<"courses">;
        drive: null | {
          canTakeOver: boolean;
          folderUrl?: string;
          mine: boolean;
          ownerName: string;
        };
        driveAvailable: boolean;
        exams: Array<{
          _creationTime: number;
          _id: Id<"assessments">;
          courseId: Id<"courses">;
          createdVia: "web" | "mcp";
          instructions?: string;
          kind: "task" | "quiz" | "midterm" | "final";
          publishedAt?: number;
          questionCount: number;
          settings: {
            attemptsAllowed: number;
            closesAt?: number;
            integrityLevel: "off" | "standard" | "strict";
            opensAt?: number;
            resultsVisibility: "hidden" | "score" | "full_after_close";
            shuffleOptions: boolean;
            shuffleQuestions: boolean;
            timeLimitMin?: number;
          };
          status: "draft" | "published" | "archived";
          title: string;
          totalPoints: number;
          updatedAt: number;
          weekId?: Id<"weeks">;
        }>;
        unplaced: Array<{
          _creationTime: number;
          _id: Id<"assessments">;
          courseId: Id<"courses">;
          createdVia: "web" | "mcp";
          instructions?: string;
          kind: "task" | "quiz" | "midterm" | "final";
          publishedAt?: number;
          questionCount: number;
          settings: {
            attemptsAllowed: number;
            closesAt?: number;
            integrityLevel: "off" | "standard" | "strict";
            opensAt?: number;
            resultsVisibility: "hidden" | "score" | "full_after_close";
            shuffleOptions: boolean;
            shuffleQuestions: boolean;
            timeLimitMin?: number;
          };
          status: "draft" | "published" | "archived";
          title: string;
          totalPoints: number;
          updatedAt: number;
          weekId?: Id<"weeks">;
        }>;
        weeks: Array<{
          _id: Id<"weeks">;
          assessments: Array<{
            _creationTime: number;
            _id: Id<"assessments">;
            courseId: Id<"courses">;
            createdVia: "web" | "mcp";
            instructions?: string;
            kind: "task" | "quiz" | "midterm" | "final";
            publishedAt?: number;
            questionCount: number;
            settings: {
              attemptsAllowed: number;
              closesAt?: number;
              integrityLevel: "off" | "standard" | "strict";
              opensAt?: number;
              resultsVisibility: "hidden" | "score" | "full_after_close";
              shuffleOptions: boolean;
              shuffleQuestions: boolean;
              timeLimitMin?: number;
            };
            status: "draft" | "published" | "archived";
            title: string;
            totalPoints: number;
            updatedAt: number;
            weekId?: Id<"weeks">;
          }>;
          description?: string;
          drive: null | {
            error?: string;
            shared: boolean;
            stale: boolean;
            syncing?: "folder" | "share" | "unshare";
            url?: string;
          };
          lessons: Array<{
            _id: Id<"lessons">;
            blockCount: number;
            createdVia: "web" | "mcp";
            status: "draft" | "published";
            title: string;
            updatedAt: number;
          }>;
          links: Array<{ id: string; title: string; url: string }>;
          order: number;
          publishedAt?: number;
          status: "draft" | "published";
          title: string;
        }>;
      }
    >;
    createWeekAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        client?: string;
        courseId: Id<"courses">;
        description?: string;
        links?: Array<{ title: string; url: string }>;
        requestId?: string;
        title?: string;
        token: string;
      },
      Id<"weeks">
    >;
    updateWeekAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        client?: string;
        description?: string;
        title?: string;
        token: string;
        weekId: Id<"weeks">;
      },
      null
    >;
    reorderWeeksAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        client?: string;
        courseId: Id<"courses">;
        token: string;
        weekIds: Array<Id<"weeks">>;
      },
      null
    >;
    deleteWeekAsAgent: FunctionReference<
      "mutation",
      "public",
      { client?: string; token: string; weekId: Id<"weeks"> },
      null
    >;
    addWeekLinksAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        client?: string;
        links: Array<{ title: string; url: string }>;
        token: string;
        weekId: Id<"weeks">;
      },
      Array<string>
    >;
    removeWeekLinkAsAgent: FunctionReference<
      "mutation",
      "public",
      { client?: string; linkId: string; token: string; weekId: Id<"weeks"> },
      null
    >;
    updateWeekLinkAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        client?: string;
        link: { title: string; url: string };
        linkId: string;
        token: string;
        weekId: Id<"weeks">;
      },
      null
    >;
    reorderWeekLinksAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        client?: string;
        linkIds: Array<string>;
        token: string;
        weekId: Id<"weeks">;
      },
      null
    >;
    placeAssessmentAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        assessmentId: Id<"assessments">;
        client?: string;
        token: string;
        weekId: Id<"weeks"> | null;
      },
      null
    >;
    getLessonAsAgent: FunctionReference<
      "query",
      "public",
      { client?: string; lessonId: Id<"lessons">; token: string },
      {
        _id: Id<"lessons">;
        blocks: Array<
          | { id: string; md: string; type: "text" }
          | {
              id: string;
              md: string;
              title?: string;
              tone: "tip" | "definition" | "warning" | "note";
              type: "callout";
            }
          | {
              caption?: string;
              code: string;
              id: string;
              language: string;
              preview?: boolean;
              type: "code";
            }
          | {
              alt: string;
              caption?: string;
              id: string;
              type: "image";
              url: string;
            }
          | { caption?: string; id: string; type: "video"; url: string }
          | {
              id: string;
              steps: Array<{ md: string; title?: string }>;
              title?: string;
              type: "steps";
            }
          | {
              check: {
                accepted?: Array<string>;
                explanation?: string;
                kind: "single" | "multiple" | "short";
                options?: Array<{ correct: boolean; text: string }>;
                prompt: string;
              };
              id: string;
              type: "check";
            }
          | {
              id: string;
              scene: {
                elements: Array<
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "heading";
                      size?: "sm" | "md" | "lg" | "xl";
                      text: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "text";
                      md: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      items: Array<string>;
                      kind: "list";
                      ordered?: boolean;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      code: string;
                      h?: number;
                      id: string;
                      kind: "code";
                      language: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      alt: string;
                      fit?: "cover" | "contain";
                      h?: number;
                      id: string;
                      kind: "image";
                      url: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      fill?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "shape";
                      label?: string;
                      shape: "rect" | "circle" | "pill" | "diamond";
                      stroke?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      curve?: number;
                      from: string;
                      id: string;
                      kind: "arrow";
                      label?: string;
                      to: string;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      decimals?: number;
                      h?: number;
                      id: string;
                      kind: "number";
                      label?: string;
                      prefix?: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      suffix?: string;
                      value: number;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      h?: number;
                      id: string;
                      kind: "note";
                      md: string;
                      tone: "tip" | "definition" | "warning" | "note";
                      w?: number;
                      x: number;
                      y: number;
                    }
                >;
                steps: Array<{
                  actions: Array<
                    | {
                        at?: number;
                        do: "enter";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "rise"
                          | "drop"
                          | "slide-left"
                          | "slide-right"
                          | "pop"
                          | "cascade"
                          | "wipe"
                          | "draw"
                          | "count"
                          | "type";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "exit";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "sink"
                          | "shrink"
                          | "slide-left"
                          | "slide-right";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "emphasize";
                        duration?: number;
                        effect?:
                          "pulse" | "shake" | "glow" | "flash" | "bounce";
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "focus";
                        duration?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "move";
                        duration?: number;
                        h?: number;
                        target: string;
                        w?: number;
                        x?: number;
                        y?: number;
                      }
                    | {
                        at?: number;
                        do: "camera";
                        duration?: number;
                        scale?: number;
                        target?: string;
                        x?: number;
                        y?: number;
                      }
                  >;
                  note?: string;
                }>;
                theme?: "paper" | "ink";
                title?: string;
              };
              type: "scene";
            }
        >;
        canEdit: boolean;
        courseId: Id<"courses">;
        courseTitle: string;
        createdVia: "web" | "mcp";
        status: "draft" | "published";
        title: string;
        updatedAt: number;
        weekId: Id<"weeks">;
        weekStatus: "draft" | "published";
        weekTitle: string;
      }
    >;
    createLessonAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        blocks?: Array<
          | { id?: string; md: string; type: "text" }
          | {
              id?: string;
              md: string;
              title?: string;
              tone: "tip" | "definition" | "warning" | "note";
              type: "callout";
            }
          | {
              caption?: string;
              code: string;
              id?: string;
              language: string;
              preview?: boolean;
              type: "code";
            }
          | {
              alt: string;
              caption?: string;
              id?: string;
              type: "image";
              url: string;
            }
          | { caption?: string; id?: string; type: "video"; url: string }
          | {
              id?: string;
              steps: Array<{ md: string; title?: string }>;
              title?: string;
              type: "steps";
            }
          | {
              check: {
                accepted?: Array<string>;
                explanation?: string;
                kind: "single" | "multiple" | "short";
                options?: Array<{ correct: boolean; text: string }>;
                prompt: string;
              };
              id?: string;
              type: "check";
            }
          | {
              id?: string;
              scene: {
                elements: Array<
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "heading";
                      size?: "sm" | "md" | "lg" | "xl";
                      text: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "text";
                      md: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      items: Array<string>;
                      kind: "list";
                      ordered?: boolean;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      code: string;
                      h?: number;
                      id: string;
                      kind: "code";
                      language: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      alt: string;
                      fit?: "cover" | "contain";
                      h?: number;
                      id: string;
                      kind: "image";
                      url: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      fill?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "shape";
                      label?: string;
                      shape: "rect" | "circle" | "pill" | "diamond";
                      stroke?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      curve?: number;
                      from: string;
                      id: string;
                      kind: "arrow";
                      label?: string;
                      to: string;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      decimals?: number;
                      h?: number;
                      id: string;
                      kind: "number";
                      label?: string;
                      prefix?: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      suffix?: string;
                      value: number;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      h?: number;
                      id: string;
                      kind: "note";
                      md: string;
                      tone: "tip" | "definition" | "warning" | "note";
                      w?: number;
                      x: number;
                      y: number;
                    }
                >;
                steps: Array<{
                  actions: Array<
                    | {
                        at?: number;
                        do: "enter";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "rise"
                          | "drop"
                          | "slide-left"
                          | "slide-right"
                          | "pop"
                          | "cascade"
                          | "wipe"
                          | "draw"
                          | "count"
                          | "type";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "exit";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "sink"
                          | "shrink"
                          | "slide-left"
                          | "slide-right";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "emphasize";
                        duration?: number;
                        effect?:
                          "pulse" | "shake" | "glow" | "flash" | "bounce";
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "focus";
                        duration?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "move";
                        duration?: number;
                        h?: number;
                        target: string;
                        w?: number;
                        x?: number;
                        y?: number;
                      }
                    | {
                        at?: number;
                        do: "camera";
                        duration?: number;
                        scale?: number;
                        target?: string;
                        x?: number;
                        y?: number;
                      }
                  >;
                  note?: string;
                }>;
                theme?: "paper" | "ink";
                title?: string;
              };
              type: "scene";
            }
        >;
        client?: string;
        requestId?: string;
        title: string;
        token: string;
        weekId: Id<"weeks">;
      },
      Id<"lessons">
    >;
    updateLessonAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        client?: string;
        lessonId: Id<"lessons">;
        title?: string;
        token: string;
      },
      null
    >;
    setLessonBlocksAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        blocks: Array<
          | { id?: string; md: string; type: "text" }
          | {
              id?: string;
              md: string;
              title?: string;
              tone: "tip" | "definition" | "warning" | "note";
              type: "callout";
            }
          | {
              caption?: string;
              code: string;
              id?: string;
              language: string;
              preview?: boolean;
              type: "code";
            }
          | {
              alt: string;
              caption?: string;
              id?: string;
              type: "image";
              url: string;
            }
          | { caption?: string; id?: string; type: "video"; url: string }
          | {
              id?: string;
              steps: Array<{ md: string; title?: string }>;
              title?: string;
              type: "steps";
            }
          | {
              check: {
                accepted?: Array<string>;
                explanation?: string;
                kind: "single" | "multiple" | "short";
                options?: Array<{ correct: boolean; text: string }>;
                prompt: string;
              };
              id?: string;
              type: "check";
            }
          | {
              id?: string;
              scene: {
                elements: Array<
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "heading";
                      size?: "sm" | "md" | "lg" | "xl";
                      text: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "text";
                      md: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      items: Array<string>;
                      kind: "list";
                      ordered?: boolean;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      code: string;
                      h?: number;
                      id: string;
                      kind: "code";
                      language: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      alt: string;
                      fit?: "cover" | "contain";
                      h?: number;
                      id: string;
                      kind: "image";
                      url: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      fill?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "shape";
                      label?: string;
                      shape: "rect" | "circle" | "pill" | "diamond";
                      stroke?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      curve?: number;
                      from: string;
                      id: string;
                      kind: "arrow";
                      label?: string;
                      to: string;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      decimals?: number;
                      h?: number;
                      id: string;
                      kind: "number";
                      label?: string;
                      prefix?: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      suffix?: string;
                      value: number;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      h?: number;
                      id: string;
                      kind: "note";
                      md: string;
                      tone: "tip" | "definition" | "warning" | "note";
                      w?: number;
                      x: number;
                      y: number;
                    }
                >;
                steps: Array<{
                  actions: Array<
                    | {
                        at?: number;
                        do: "enter";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "rise"
                          | "drop"
                          | "slide-left"
                          | "slide-right"
                          | "pop"
                          | "cascade"
                          | "wipe"
                          | "draw"
                          | "count"
                          | "type";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "exit";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "sink"
                          | "shrink"
                          | "slide-left"
                          | "slide-right";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "emphasize";
                        duration?: number;
                        effect?:
                          "pulse" | "shake" | "glow" | "flash" | "bounce";
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "focus";
                        duration?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "move";
                        duration?: number;
                        h?: number;
                        target: string;
                        w?: number;
                        x?: number;
                        y?: number;
                      }
                    | {
                        at?: number;
                        do: "camera";
                        duration?: number;
                        scale?: number;
                        target?: string;
                        x?: number;
                        y?: number;
                      }
                  >;
                  note?: string;
                }>;
                theme?: "paper" | "ink";
                title?: string;
              };
              type: "scene";
            }
        >;
        client?: string;
        lessonId: Id<"lessons">;
        token: string;
      },
      Array<string>
    >;
    addLessonBlocksAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        blocks: Array<
          | { id?: string; md: string; type: "text" }
          | {
              id?: string;
              md: string;
              title?: string;
              tone: "tip" | "definition" | "warning" | "note";
              type: "callout";
            }
          | {
              caption?: string;
              code: string;
              id?: string;
              language: string;
              preview?: boolean;
              type: "code";
            }
          | {
              alt: string;
              caption?: string;
              id?: string;
              type: "image";
              url: string;
            }
          | { caption?: string; id?: string; type: "video"; url: string }
          | {
              id?: string;
              steps: Array<{ md: string; title?: string }>;
              title?: string;
              type: "steps";
            }
          | {
              check: {
                accepted?: Array<string>;
                explanation?: string;
                kind: "single" | "multiple" | "short";
                options?: Array<{ correct: boolean; text: string }>;
                prompt: string;
              };
              id?: string;
              type: "check";
            }
          | {
              id?: string;
              scene: {
                elements: Array<
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "heading";
                      size?: "sm" | "md" | "lg" | "xl";
                      text: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "text";
                      md: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      items: Array<string>;
                      kind: "list";
                      ordered?: boolean;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      code: string;
                      h?: number;
                      id: string;
                      kind: "code";
                      language: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      alt: string;
                      fit?: "cover" | "contain";
                      h?: number;
                      id: string;
                      kind: "image";
                      url: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      fill?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "shape";
                      label?: string;
                      shape: "rect" | "circle" | "pill" | "diamond";
                      stroke?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      curve?: number;
                      from: string;
                      id: string;
                      kind: "arrow";
                      label?: string;
                      to: string;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      decimals?: number;
                      h?: number;
                      id: string;
                      kind: "number";
                      label?: string;
                      prefix?: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      suffix?: string;
                      value: number;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      h?: number;
                      id: string;
                      kind: "note";
                      md: string;
                      tone: "tip" | "definition" | "warning" | "note";
                      w?: number;
                      x: number;
                      y: number;
                    }
                >;
                steps: Array<{
                  actions: Array<
                    | {
                        at?: number;
                        do: "enter";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "rise"
                          | "drop"
                          | "slide-left"
                          | "slide-right"
                          | "pop"
                          | "cascade"
                          | "wipe"
                          | "draw"
                          | "count"
                          | "type";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "exit";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "sink"
                          | "shrink"
                          | "slide-left"
                          | "slide-right";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "emphasize";
                        duration?: number;
                        effect?:
                          "pulse" | "shake" | "glow" | "flash" | "bounce";
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "focus";
                        duration?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "move";
                        duration?: number;
                        h?: number;
                        target: string;
                        w?: number;
                        x?: number;
                        y?: number;
                      }
                    | {
                        at?: number;
                        do: "camera";
                        duration?: number;
                        scale?: number;
                        target?: string;
                        x?: number;
                        y?: number;
                      }
                  >;
                  note?: string;
                }>;
                theme?: "paper" | "ink";
                title?: string;
              };
              type: "scene";
            }
        >;
        client?: string;
        lessonId: Id<"lessons">;
        position?: number;
        requestId?: string;
        token: string;
      },
      Array<string>
    >;
    updateLessonBlockAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        block:
          | { id?: string; md: string; type: "text" }
          | {
              id?: string;
              md: string;
              title?: string;
              tone: "tip" | "definition" | "warning" | "note";
              type: "callout";
            }
          | {
              caption?: string;
              code: string;
              id?: string;
              language: string;
              preview?: boolean;
              type: "code";
            }
          | {
              alt: string;
              caption?: string;
              id?: string;
              type: "image";
              url: string;
            }
          | { caption?: string; id?: string; type: "video"; url: string }
          | {
              id?: string;
              steps: Array<{ md: string; title?: string }>;
              title?: string;
              type: "steps";
            }
          | {
              check: {
                accepted?: Array<string>;
                explanation?: string;
                kind: "single" | "multiple" | "short";
                options?: Array<{ correct: boolean; text: string }>;
                prompt: string;
              };
              id?: string;
              type: "check";
            }
          | {
              id?: string;
              scene: {
                elements: Array<
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "heading";
                      size?: "sm" | "md" | "lg" | "xl";
                      text: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "text";
                      md: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      items: Array<string>;
                      kind: "list";
                      ordered?: boolean;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      code: string;
                      h?: number;
                      id: string;
                      kind: "code";
                      language: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      alt: string;
                      fit?: "cover" | "contain";
                      h?: number;
                      id: string;
                      kind: "image";
                      url: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      fill?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "shape";
                      label?: string;
                      shape: "rect" | "circle" | "pill" | "diamond";
                      stroke?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      curve?: number;
                      from: string;
                      id: string;
                      kind: "arrow";
                      label?: string;
                      to: string;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      decimals?: number;
                      h?: number;
                      id: string;
                      kind: "number";
                      label?: string;
                      prefix?: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      suffix?: string;
                      value: number;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      h?: number;
                      id: string;
                      kind: "note";
                      md: string;
                      tone: "tip" | "definition" | "warning" | "note";
                      w?: number;
                      x: number;
                      y: number;
                    }
                >;
                steps: Array<{
                  actions: Array<
                    | {
                        at?: number;
                        do: "enter";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "rise"
                          | "drop"
                          | "slide-left"
                          | "slide-right"
                          | "pop"
                          | "cascade"
                          | "wipe"
                          | "draw"
                          | "count"
                          | "type";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "exit";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "sink"
                          | "shrink"
                          | "slide-left"
                          | "slide-right";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "emphasize";
                        duration?: number;
                        effect?:
                          "pulse" | "shake" | "glow" | "flash" | "bounce";
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "focus";
                        duration?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "move";
                        duration?: number;
                        h?: number;
                        target: string;
                        w?: number;
                        x?: number;
                        y?: number;
                      }
                    | {
                        at?: number;
                        do: "camera";
                        duration?: number;
                        scale?: number;
                        target?: string;
                        x?: number;
                        y?: number;
                      }
                  >;
                  note?: string;
                }>;
                theme?: "paper" | "ink";
                title?: string;
              };
              type: "scene";
            };
        blockId: string;
        client?: string;
        lessonId: Id<"lessons">;
        token: string;
      },
      null
    >;
    deleteLessonBlockAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        blockId: string;
        client?: string;
        lessonId: Id<"lessons">;
        token: string;
      },
      null
    >;
    moveLessonAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        client?: string;
        direction?: "up" | "down";
        lessonId: Id<"lessons">;
        token: string;
        weekId?: Id<"weeks">;
      },
      null
    >;
    reorderLessonsAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        client?: string;
        lessonIds: Array<Id<"lessons">>;
        token: string;
        weekId: Id<"weeks">;
      },
      null
    >;
    deleteLessonAsAgent: FunctionReference<
      "mutation",
      "public",
      { client?: string; lessonId: Id<"lessons">; token: string },
      null
    >;
    exportCourseForAgent: FunctionReference<
      "query",
      "public",
      { client?: string; courseId: Id<"courses">; token: string },
      { content: string; fileName: string }
    >;
    checkKalamiForAgent: FunctionReference<
      "action",
      "public",
      { client?: string; text: string; token: string },
      | {
          ok: true;
          summary: {
            assessments: {
              final: number;
              midterm: number;
              quiz: number;
              task: number;
            };
            exported?: { at: string; by: string; from: string };
            language: "ka" | "en";
            lessons: number;
            links: number;
            questions: number;
            title: string;
            weeks: number;
          };
          verified: null | { at: string; by: string };
        }
      | {
          errors: Array<string>;
          ok: false;
          summary?: {
            assessments: {
              final: number;
              midterm: number;
              quiz: number;
              task: number;
            };
            exported?: { at: string; by: string; from: string };
            language: "ka" | "en";
            lessons: number;
            links: number;
            questions: number;
            title: string;
            weeks: number;
          };
        }
    >;
    importKalamiForAgent: FunctionReference<
      "action",
      "public",
      {
        client?: string;
        requestId?: string;
        text: string;
        token: string;
        universityId?: Id<"universities"> | null;
      },
      | {
          courseId: Id<"courses">;
          ok: true;
          summary: {
            assessments: {
              final: number;
              midterm: number;
              quiz: number;
              task: number;
            };
            exported?: { at: string; by: string; from: string };
            language: "ka" | "en";
            lessons: number;
            links: number;
            questions: number;
            title: string;
            weeks: number;
          };
          verified: null | { at: string; by: string };
        }
      | {
          errors: Array<string>;
          ok: false;
          summary?: {
            assessments: {
              final: number;
              midterm: number;
              quiz: number;
              task: number;
            };
            exported?: { at: string; by: string; from: string };
            language: "ka" | "en";
            lessons: number;
            links: number;
            questions: number;
            title: string;
            weeks: number;
          };
        }
    >;
    prepareWeekDriveAsAgent: FunctionReference<
      "mutation",
      "public",
      { client?: string; token: string; weekId: Id<"weeks"> },
      null
    >;
  };
  questions: {
    add: FunctionReference<
      "mutation",
      "public",
      {
        assessmentId: Id<"assessments">;
        questions: Array<
          | {
              explanation?: string;
              options: Array<{ correct: boolean; text: string }>;
              points?: number;
              prompt: string;
              type: "single";
            }
          | {
              explanation?: string;
              options: Array<{ correct: boolean; text: string }>;
              points?: number;
              prompt: string;
              type: "multiple";
            }
          | {
              acceptedAnswers: Array<string>;
              caseSensitive?: boolean;
              explanation?: string;
              points?: number;
              prompt: string;
              type: "short";
            }
          | {
              explanation?: string;
              points?: number;
              prompt: string;
              rubric?: string;
              type: "essay";
            }
          | {
              assets?: Array<{ alt?: string; name: string; url: string }>;
              explanation?: string;
              hiddenChecks?: Array<
                | { label: string; selector: string; type: "exists" }
                | { label: string; selector: string; type: "not_exists" }
                | {
                    label: string;
                    max?: number;
                    min?: number;
                    selector: string;
                    type: "count";
                  }
                | {
                    caseSensitive?: boolean;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    label: string;
                    selector: string;
                    type: "text";
                  }
                | {
                    attribute: string;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    label: string;
                    selector: string;
                    type: "attr";
                  }
                | {
                    equals?: string;
                    every?: boolean;
                    label: string;
                    oneOf?: Array<string>;
                    property: string;
                    selector: string;
                    type: "css";
                    viewport?: number;
                  }
                | { href: string; label: string; type: "linked" }
              >;
              points?: number;
              prompt: string;
              solution: Array<{ content: string; name: string }>;
              starterFiles: Array<{ content: string; name: string }>;
              steps: Array<{
                checks: Array<
                  | { label: string; selector: string; type: "exists" }
                  | { label: string; selector: string; type: "not_exists" }
                  | {
                      label: string;
                      max?: number;
                      min?: number;
                      selector: string;
                      type: "count";
                    }
                  | {
                      caseSensitive?: boolean;
                      contains?: string;
                      equals?: string;
                      every?: boolean;
                      label: string;
                      selector: string;
                      type: "text";
                    }
                  | {
                      attribute: string;
                      contains?: string;
                      equals?: string;
                      every?: boolean;
                      label: string;
                      selector: string;
                      type: "attr";
                    }
                  | {
                      equals?: string;
                      every?: boolean;
                      label: string;
                      oneOf?: Array<string>;
                      property: string;
                      selector: string;
                      type: "css";
                      viewport?: number;
                    }
                  | { href: string; label: string; type: "linked" }
                >;
                hint?: string;
                instructions: string;
                title: string;
              }>;
              type: "code";
              variables?: Array<{ name: string; values: Array<string> }>;
            }
        >;
      },
      Array<Id<"questions">>
    >;
    update: FunctionReference<
      "mutation",
      "public",
      {
        question:
          | {
              explanation?: string;
              options: Array<{ correct: boolean; text: string }>;
              points?: number;
              prompt: string;
              type: "single";
            }
          | {
              explanation?: string;
              options: Array<{ correct: boolean; text: string }>;
              points?: number;
              prompt: string;
              type: "multiple";
            }
          | {
              acceptedAnswers: Array<string>;
              caseSensitive?: boolean;
              explanation?: string;
              points?: number;
              prompt: string;
              type: "short";
            }
          | {
              explanation?: string;
              points?: number;
              prompt: string;
              rubric?: string;
              type: "essay";
            }
          | {
              assets?: Array<{ alt?: string; name: string; url: string }>;
              explanation?: string;
              hiddenChecks?: Array<
                | { label: string; selector: string; type: "exists" }
                | { label: string; selector: string; type: "not_exists" }
                | {
                    label: string;
                    max?: number;
                    min?: number;
                    selector: string;
                    type: "count";
                  }
                | {
                    caseSensitive?: boolean;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    label: string;
                    selector: string;
                    type: "text";
                  }
                | {
                    attribute: string;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    label: string;
                    selector: string;
                    type: "attr";
                  }
                | {
                    equals?: string;
                    every?: boolean;
                    label: string;
                    oneOf?: Array<string>;
                    property: string;
                    selector: string;
                    type: "css";
                    viewport?: number;
                  }
                | { href: string; label: string; type: "linked" }
              >;
              points?: number;
              prompt: string;
              solution: Array<{ content: string; name: string }>;
              starterFiles: Array<{ content: string; name: string }>;
              steps: Array<{
                checks: Array<
                  | { label: string; selector: string; type: "exists" }
                  | { label: string; selector: string; type: "not_exists" }
                  | {
                      label: string;
                      max?: number;
                      min?: number;
                      selector: string;
                      type: "count";
                    }
                  | {
                      caseSensitive?: boolean;
                      contains?: string;
                      equals?: string;
                      every?: boolean;
                      label: string;
                      selector: string;
                      type: "text";
                    }
                  | {
                      attribute: string;
                      contains?: string;
                      equals?: string;
                      every?: boolean;
                      label: string;
                      selector: string;
                      type: "attr";
                    }
                  | {
                      equals?: string;
                      every?: boolean;
                      label: string;
                      oneOf?: Array<string>;
                      property: string;
                      selector: string;
                      type: "css";
                      viewport?: number;
                    }
                  | { href: string; label: string; type: "linked" }
                >;
                hint?: string;
                instructions: string;
                title: string;
              }>;
              type: "code";
              variables?: Array<{ name: string; values: Array<string> }>;
            };
        questionId: Id<"questions">;
      },
      null
    >;
    remove: FunctionReference<
      "mutation",
      "public",
      { questionId: Id<"questions"> },
      null
    >;
    reorder: FunctionReference<
      "mutation",
      "public",
      { assessmentId: Id<"assessments">; questionIds: Array<Id<"questions">> },
      null
    >;
  };
  submissions: {
    forAssessment: FunctionReference<
      "query",
      "public",
      {
        assessmentId: Id<"assessments">;
        paginationOpts: {
          cursor: string | null;
          endCursor?: string | null;
          id?: number;
          maximumBytesRead?: number;
          maximumRowsRead?: number;
          numItems: number;
        };
      },
      {
        continueCursor: string;
        isDone: boolean;
        page: Array<{
          answered: number;
          attemptId: Id<"attempts">;
          autoSubmitted: boolean;
          graded: boolean;
          gradingError?: string;
          integrity: {
            awayMs?: number;
            copyBlocked?: number;
            dropBlocked: number;
            fullscreenExits?: number;
            largeInserts: number;
            multiTab?: number;
            pasteBlocked: number;
            resizes?: number;
            shortcutsBlocked?: number;
            tabSwitches?: number;
          };
          integrityColor: "green" | "yellow" | "red";
          integrityScore: number;
          maxScore: number;
          needsGrading: boolean;
          number: number;
          questionsTotal: number;
          score?: number;
          startedAt: number;
          status: "in_progress" | "submitted";
          stepsDone: number;
          stepsTotal: number;
          student: string;
          submittedAt?: number;
        }>;
        pageStatus?: "SplitRecommended" | "SplitRequired" | null;
        splitCursor?: string | null;
      }
    >;
    detail: FunctionReference<
      "query",
      "public",
      { attemptId: Id<"attempts"> },
      {
        answers: Array<{
          autoScore?: number;
          key:
            | null
            | { correctOptionId: string; type: "single" }
            | { correctOptionIds: Array<string>; type: "multiple" }
            | {
                acceptedAnswers: Array<string>;
                caseSensitive: boolean;
                type: "short";
              }
            | { rubric?: string; type: "essay" }
            | {
                hiddenChecks: Array<
                  | {
                      id: string;
                      label: string;
                      selector: string;
                      type: "exists";
                    }
                  | {
                      id: string;
                      label: string;
                      selector: string;
                      type: "not_exists";
                    }
                  | {
                      id: string;
                      label: string;
                      max?: number;
                      min?: number;
                      selector: string;
                      type: "count";
                    }
                  | {
                      caseSensitive?: boolean;
                      contains?: string;
                      equals?: string;
                      every?: boolean;
                      id: string;
                      label: string;
                      selector: string;
                      type: "text";
                    }
                  | {
                      attribute: string;
                      contains?: string;
                      equals?: string;
                      every?: boolean;
                      id: string;
                      label: string;
                      selector: string;
                      type: "attr";
                    }
                  | {
                      equals?: string;
                      every?: boolean;
                      id: string;
                      label: string;
                      oneOf?: Array<string>;
                      property: string;
                      selector: string;
                      type: "css";
                      viewport?: number;
                    }
                  | { href: string; id: string; label: string; type: "linked" }
                >;
                solution: Array<{ content: string; name: string }>;
                type: "code";
              };
          manualPoints?: number;
          options?: Array<{ id: string; text: string }>;
          points: number;
          prompt: string;
          questionId: Id<"questions">;
          savedAt?: number;
          type: "single" | "multiple" | "short" | "essay";
          value?:
            | { optionId: string; type: "single" }
            | { optionIds: Array<string>; type: "multiple" }
            | { text: string; type: "short" }
            | { text: string; type: "essay" };
        }>;
        autoScore?: number;
        autoSubmitted: boolean;
        comments: Array<{
          _id: Id<"codeComments">;
          author: string;
          file: string;
          line: number;
          questionId: Id<"questions">;
          text: string;
        }>;
        feedback?: string;
        gradingError?: string;
        integrity: {
          awayMs?: number;
          copyBlocked?: number;
          dropBlocked: number;
          fullscreenExits?: number;
          largeInserts: number;
          multiTab?: number;
          pasteBlocked: number;
          resizes?: number;
          shortcutsBlocked?: number;
          tabSwitches?: number;
        };
        integrityColor: "green" | "yellow" | "red";
        manualScore?: number;
        maxScore: number;
        number: number;
        questions: Array<{
          autoScore?: number;
          checkResults?: Array<{ id: string; passed: boolean }>;
          code: {
            assets: Array<{ alt?: string; name: string; url: string }>;
            files: Array<{ content: string; name: string }>;
            steps: Array<{
              checks: Array<
                | {
                    id: string;
                    label: string;
                    selector: string;
                    type: "exists";
                  }
                | {
                    id: string;
                    label: string;
                    selector: string;
                    type: "not_exists";
                  }
                | {
                    id: string;
                    label: string;
                    max?: number;
                    min?: number;
                    selector: string;
                    type: "count";
                  }
                | {
                    caseSensitive?: boolean;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    id: string;
                    label: string;
                    selector: string;
                    type: "text";
                  }
                | {
                    attribute: string;
                    contains?: string;
                    equals?: string;
                    every?: boolean;
                    id: string;
                    label: string;
                    selector: string;
                    type: "attr";
                  }
                | {
                    equals?: string;
                    every?: boolean;
                    id: string;
                    label: string;
                    oneOf?: Array<string>;
                    property: string;
                    selector: string;
                    type: "css";
                    viewport?: number;
                  }
                | { href: string; id: string; label: string; type: "linked" }
              >;
              hint?: string;
              instructions: string;
              title: string;
            }>;
          };
          files?: Array<{ content: string; name: string }>;
          hiddenChecks: Array<
            | { id: string; label: string; selector: string; type: "exists" }
            | {
                id: string;
                label: string;
                selector: string;
                type: "not_exists";
              }
            | {
                id: string;
                label: string;
                max?: number;
                min?: number;
                selector: string;
                type: "count";
              }
            | {
                caseSensitive?: boolean;
                contains?: string;
                equals?: string;
                every?: boolean;
                id: string;
                label: string;
                selector: string;
                type: "text";
              }
            | {
                attribute: string;
                contains?: string;
                equals?: string;
                every?: boolean;
                id: string;
                label: string;
                selector: string;
                type: "attr";
              }
            | {
                equals?: string;
                every?: boolean;
                id: string;
                label: string;
                oneOf?: Array<string>;
                property: string;
                selector: string;
                type: "css";
                viewport?: number;
              }
            | { href: string; id: string; label: string; type: "linked" }
          >;
          prompt: string;
          questionId: Id<"questions">;
          savedAt?: number;
        }>;
        status: "in_progress" | "submitted";
        student: string;
      }
    >;
    setQuestionPoints: FunctionReference<
      "mutation",
      "public",
      {
        attemptId: Id<"attempts">;
        points?: number;
        questionId: Id<"questions">;
      },
      null
    >;
    addComment: FunctionReference<
      "mutation",
      "public",
      {
        attemptId: Id<"attempts">;
        file: string;
        line: number;
        questionId: Id<"questions">;
        text: string;
      },
      Id<"codeComments">
    >;
    removeComment: FunctionReference<
      "mutation",
      "public",
      { commentId: Id<"codeComments"> },
      null
    >;
    setGrade: FunctionReference<
      "mutation",
      "public",
      { attemptId: Id<"attempts">; feedback?: string; manualScore?: number },
      null
    >;
  };
  universities: {
    listActive: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{
        _id: Id<"universities">;
        name: { en: string; ka: string };
        slug: string;
        status: "active" | "archived";
      }>
    >;
    listAdministered: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{
        _id: Id<"universities">;
        name: { en: string; ka: string };
        slug: string;
        status: "active" | "archived";
      }>
    >;
    create: FunctionReference<
      "mutation",
      "public",
      { nameEn: string; nameKa: string; slug: string },
      Id<"universities">
    >;
  };
  users: {
    store: FunctionReference<
      "mutation",
      "public",
      Record<string, never>,
      Id<"users">
    >;
    me: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      null | {
        _id: Id<"users">;
        avatarUrl?: string;
        email: string;
        firstName?: string;
        honestyAccepted: boolean;
        isStaff: boolean;
        isSuperAdmin: boolean;
        lastName?: string;
        locale: "ka" | "en";
        memberships: Array<{
          role: "student" | "lecturer" | "uni_admin" | "super_admin";
          universityId?: Id<"universities">;
        }>;
        needsOnboarding: boolean;
        student: null | {
          faculty?: string;
          group?: string;
          studentNumber?: string;
          universityId?: Id<"universities">;
          universityName?: { en: string; ka: string };
          year?: number;
        };
        studioIntroSeenAt?: number;
      }
    >;
    markStudioIntroSeen: FunctionReference<
      "mutation",
      "public",
      Record<string, never>,
      null
    >;
    completeStudentOnboarding: FunctionReference<
      "mutation",
      "public",
      {
        faculty?: string;
        firstName: string;
        group?: string;
        honestyVersion: number;
        lastName: string;
        locale: "ka" | "en";
        studentNumber?: string;
        universityId?: Id<"universities">;
        year?: number;
      },
      null
    >;
  };
  notifications: {
    inbox: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      {
        emailBlocked: boolean;
        emailEnabled: boolean;
        items: Array<{
          _creationTime: number;
          _id: Id<"notifications">;
          assessmentKind?: "task" | "quiz" | "midterm" | "final";
          body?: string;
          courseId?: Id<"courses">;
          courseTitle: string;
          dueAt?: number;
          href: string;
          kind: "published" | "due_24h" | "due_1h" | "announcement";
          read: boolean;
          title: string;
        }>;
        unread: number;
      }
    >;
    markRead: FunctionReference<
      "mutation",
      "public",
      { notificationId: Id<"notifications"> },
      null
    >;
    markAllRead: FunctionReference<
      "mutation",
      "public",
      Record<string, never>,
      null
    >;
    setEmailPreference: FunctionReference<
      "mutation",
      "public",
      { enabled: boolean },
      null
    >;
  };
  groups: {
    listMine: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{
        _creationTime: number;
        _id: Id<"groups">;
        archived: boolean;
        courses: Array<{
          _id: Id<"courses">;
          status: "draft" | "published" | "archived";
          title: string;
        }>;
        description?: string;
        inviteEnabled: boolean;
        isPrivate: boolean;
        lecturers: number;
        manages: boolean;
        members: number;
        name: string;
        otherCourses: number;
        pendingInvites: number;
        teaches: boolean;
        universityName?: { en: string; ka: string };
        updatedAt: number;
      }>
    >;
    forUniversity: FunctionReference<
      "query",
      "public",
      { universityId: Id<"universities"> },
      Array<{
        _id: Id<"groups">;
        archived: boolean;
        courses: number;
        description?: string;
        inviteEnabled: boolean;
        lecturers: number;
        members: number;
        name: string;
      }>
    >;
    search: FunctionReference<
      "query",
      "public",
      { query: string },
      Array<{
        _id: Id<"groups">;
        description?: string;
        joined: boolean;
        lecturers: number;
        members: number;
        name: string;
        universityName: { en: string; ka: string };
      }>
    >;
    get: FunctionReference<
      "query",
      "public",
      { groupId: Id<"groups"> },
      {
        _creationTime: number;
        _id: Id<"groups">;
        archived: boolean;
        courses: Array<{
          _id: Id<"courses">;
          status: "draft" | "published" | "archived";
          title: string;
        }>;
        description?: string;
        inviteCode: string;
        inviteEnabled: boolean;
        inviteList: Array<{
          _id: Id<"groupInvites">;
          createdAt: number;
          email: string;
          emailedAt?: number;
          expiresAt: number;
        }>;
        isPrivate: boolean;
        lecturerList: Array<{
          joinedAt: number;
          name: string;
          userId: Id<"users">;
        }>;
        lecturers: number;
        manages: boolean;
        memberList: Array<{
          email: string;
          joinedAt: number;
          name: string;
          userId: Id<"users">;
          via: "link" | "email";
        }>;
        members: number;
        name: string;
        otherCourses: number;
        ownerName: string;
        pendingInvites: number;
        teaches: boolean;
        universityName?: { en: string; ka: string };
        updatedAt: number;
      }
    >;
    create: FunctionReference<
      "mutation",
      "public",
      { description?: string; name: string; universityId?: Id<"universities"> },
      Id<"groups">
    >;
    joinAsLecturer: FunctionReference<
      "mutation",
      "public",
      { groupId: Id<"groups"> },
      null
    >;
    leaveAsLecturer: FunctionReference<
      "mutation",
      "public",
      { groupId: Id<"groups"> },
      number
    >;
    removeLecturer: FunctionReference<
      "mutation",
      "public",
      { groupId: Id<"groups">; userId: Id<"users"> },
      null
    >;
    update: FunctionReference<
      "mutation",
      "public",
      {
        archived?: boolean;
        description?: string;
        groupId: Id<"groups">;
        name?: string;
      },
      null
    >;
    newInviteLink: FunctionReference<
      "mutation",
      "public",
      { groupId: Id<"groups"> },
      string
    >;
    setInviteLink: FunctionReference<
      "mutation",
      "public",
      { enabled: boolean; groupId: Id<"groups"> },
      null
    >;
    invite: FunctionReference<
      "mutation",
      "public",
      { emails: Array<string>; groupId: Id<"groups"> },
      {
        alreadyInvited: Array<string>;
        alreadyMembers: Array<string>;
        emailed: number;
        invalid: Array<string>;
        invited: Array<string>;
      }
    >;
    resendInviteEmail: FunctionReference<
      "mutation",
      "public",
      { inviteId: Id<"groupInvites"> },
      boolean
    >;
    withdrawInvite: FunctionReference<
      "mutation",
      "public",
      { inviteId: Id<"groupInvites"> },
      null
    >;
    removeStudent: FunctionReference<
      "mutation",
      "public",
      { groupId: Id<"groups">; userId: Id<"users"> },
      null
    >;
    shareCourse: FunctionReference<
      "mutation",
      "public",
      { courseId: Id<"courses">; groupId: Id<"groups"> },
      null
    >;
    unshareCourse: FunctionReference<
      "mutation",
      "public",
      { courseId: Id<"courses">; groupId: Id<"groups"> },
      null
    >;
    forCourse: FunctionReference<
      "query",
      "public",
      { courseId: Id<"courses"> },
      {
        available: Array<{ _id: Id<"groups">; members: number; name: string }>;
        shared: Array<{
          _id: Id<"groups">;
          archived: boolean;
          members: number;
          name: string;
        }>;
      }
    >;
    preview: FunctionReference<
      "query",
      "public",
      { code: string },
      null | {
        alreadyMember: boolean;
        courseCount: number;
        groupName: string;
        teacher: string;
      }
    >;
    join: FunctionReference<
      "mutation",
      "public",
      { code: string },
      Id<"groups">
    >;
    previewEmailInvite: FunctionReference<
      "query",
      "public",
      { token: string },
      null | {
        alreadyMember: boolean;
        courseCount: number;
        email: string;
        expiresAt: number;
        groupName: string;
        status: "pending" | "accepted" | "revoked";
        teacher: string;
      }
    >;
    acceptEmailInvite: FunctionReference<
      "mutation",
      "public",
      { token: string },
      Id<"groups">
    >;
    myInvites: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{
        expiresAt: number;
        groupName: string;
        teacher: string;
        token: string;
      }>
    >;
    mine: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{
        _id: Id<"groups">;
        joinedAt: number;
        name: string;
        teacher: string;
      }>
    >;
    leave: FunctionReference<
      "mutation",
      "public",
      { groupId: Id<"groups"> },
      null
    >;
  };
  drive: {
    connection: FunctionReference<
      "action",
      "public",
      Record<string, never>,
      { available: boolean; connected: boolean; problem?: string }
    >;
  };
  messages: {
    contactOptionsFor: FunctionReference<
      "query",
      "public",
      {
        assessmentId?: Id<"assessments">;
        courseId?: Id<"courses">;
        weekId?: Id<"weeks">;
      },
      {
        adminAvailable: boolean;
        context: {
          assessment?: {
            _id: Id<"assessments">;
            kind: "task" | "quiz" | "midterm" | "final";
            title: string;
          };
          course?: { _id: Id<"courses">; locale: "ka" | "en"; title: string };
          week?: { _id: Id<"weeks">; title: string; url?: string };
        };
        lecturers: Array<{
          name: string;
          userId: Id<"users">;
          via: Array<string>;
        }>;
        student: { email: string; locale: "ka" | "en"; name: string };
      }
    >;
    start: FunctionReference<
      "mutation",
      "public",
      {
        assessmentId?: Id<"assessments">;
        body: string;
        clientOpId: string;
        courseId?: Id<"courses">;
        customTopic?: string;
        lecturerId?: Id<"users">;
        recipient: "lecturer" | "admin";
        subject: string;
        topic:
          | "materials_access"
          | "missing_material"
          | "assignment"
          | "grade"
          | "submission"
          | "absence"
          | "app_problem"
          | "other";
        weekId?: Id<"weeks">;
      },
      Id<"conversations">
    >;
    mine: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{
        _id: Id<"conversations">;
        courseId?: Id<"courses">;
        courseTitle?: string;
        customTopic?: string;
        lastMessageAt: number;
        lastMessageFrom: "student" | "staff";
        messageCount: number;
        recipient: "lecturer" | "admin";
        recipientName: string;
        status: "open" | "answered" | "resolved";
        subject: string;
        topic:
          | "materials_access"
          | "missing_material"
          | "assignment"
          | "grade"
          | "submission"
          | "absence"
          | "app_problem"
          | "other";
        unread: boolean;
      }>
    >;
    thread: FunctionReference<
      "query",
      "public",
      { conversationId: Id<"conversations"> },
      {
        _id: Id<"conversations">;
        context: {
          assessment?: {
            _id: Id<"assessments">;
            kind: "task" | "quiz" | "midterm" | "final";
            title: string;
          };
          course?: { _id: Id<"courses">; locale: "ka" | "en"; title: string };
          week?: { _id: Id<"weeks">; title: string; url?: string };
        };
        customTopic?: string;
        messages: Array<{
          _creationTime: number;
          _id: Id<"conversationMessages">;
          body: string;
          emailed: boolean;
          from: "student" | "staff";
          mine: boolean;
          senderName: string;
        }>;
        recipient: "lecturer" | "admin";
        recipientName: string;
        status: "open" | "answered" | "resolved";
        studentEmail?: string;
        studentName: string;
        subject: string;
        topic:
          | "materials_access"
          | "missing_material"
          | "assignment"
          | "grade"
          | "submission"
          | "absence"
          | "app_problem"
          | "other";
        truncated: boolean;
        viewer: "student" | "lecturer" | "admin";
      }
    >;
    reply: FunctionReference<
      "mutation",
      "public",
      { body: string; clientOpId: string; conversationId: Id<"conversations"> },
      Id<"conversationMessages">
    >;
    resolve: FunctionReference<
      "mutation",
      "public",
      { conversationId: Id<"conversations">; resolved: boolean },
      null
    >;
    markRead: FunctionReference<
      "mutation",
      "public",
      { conversationId: Id<"conversations"> },
      null
    >;
    unreadCount: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      number
    >;
    inbox: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{
        _id: Id<"conversations">;
        as: "lecturer" | "admin";
        courseId?: Id<"courses">;
        courseTitle?: string;
        customTopic?: string;
        lastMessageAt: number;
        lastMessageFrom: "student" | "staff";
        messageCount: number;
        recipient: "lecturer" | "admin";
        status: "open" | "answered" | "resolved";
        studentName: string;
        subject: string;
        topic:
          | "materials_access"
          | "missing_material"
          | "assignment"
          | "grade"
          | "submission"
          | "absence"
          | "app_problem"
          | "other";
        unread: boolean;
      }>
    >;
  };
  lessons: {
    get: FunctionReference<
      "query",
      "public",
      { lessonId: Id<"lessons"> },
      {
        _id: Id<"lessons">;
        blocks: Array<
          | { id: string; md: string; type: "text" }
          | {
              id: string;
              md: string;
              title?: string;
              tone: "tip" | "definition" | "warning" | "note";
              type: "callout";
            }
          | {
              caption?: string;
              code: string;
              id: string;
              language: string;
              preview?: boolean;
              type: "code";
            }
          | {
              alt: string;
              caption?: string;
              id: string;
              type: "image";
              url: string;
            }
          | { caption?: string; id: string; type: "video"; url: string }
          | {
              id: string;
              steps: Array<{ md: string; title?: string }>;
              title?: string;
              type: "steps";
            }
          | {
              check: {
                accepted?: Array<string>;
                explanation?: string;
                kind: "single" | "multiple" | "short";
                options?: Array<{ correct: boolean; text: string }>;
                prompt: string;
              };
              id: string;
              type: "check";
            }
          | {
              id: string;
              scene: {
                elements: Array<
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "heading";
                      size?: "sm" | "md" | "lg" | "xl";
                      text: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "text";
                      md: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      items: Array<string>;
                      kind: "list";
                      ordered?: boolean;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      code: string;
                      h?: number;
                      id: string;
                      kind: "code";
                      language: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      alt: string;
                      fit?: "cover" | "contain";
                      h?: number;
                      id: string;
                      kind: "image";
                      url: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      fill?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "shape";
                      label?: string;
                      shape: "rect" | "circle" | "pill" | "diamond";
                      stroke?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      curve?: number;
                      from: string;
                      id: string;
                      kind: "arrow";
                      label?: string;
                      to: string;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      decimals?: number;
                      h?: number;
                      id: string;
                      kind: "number";
                      label?: string;
                      prefix?: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      suffix?: string;
                      value: number;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      h?: number;
                      id: string;
                      kind: "note";
                      md: string;
                      tone: "tip" | "definition" | "warning" | "note";
                      w?: number;
                      x: number;
                      y: number;
                    }
                >;
                steps: Array<{
                  actions: Array<
                    | {
                        at?: number;
                        do: "enter";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "rise"
                          | "drop"
                          | "slide-left"
                          | "slide-right"
                          | "pop"
                          | "cascade"
                          | "wipe"
                          | "draw"
                          | "count"
                          | "type";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "exit";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "sink"
                          | "shrink"
                          | "slide-left"
                          | "slide-right";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "emphasize";
                        duration?: number;
                        effect?:
                          "pulse" | "shake" | "glow" | "flash" | "bounce";
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "focus";
                        duration?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "move";
                        duration?: number;
                        h?: number;
                        target: string;
                        w?: number;
                        x?: number;
                        y?: number;
                      }
                    | {
                        at?: number;
                        do: "camera";
                        duration?: number;
                        scale?: number;
                        target?: string;
                        x?: number;
                        y?: number;
                      }
                  >;
                  note?: string;
                }>;
                theme?: "paper" | "ink";
                title?: string;
              };
              type: "scene";
            }
        >;
        canEdit: boolean;
        courseId: Id<"courses">;
        courseTitle: string;
        createdVia: "web" | "mcp";
        status: "draft" | "published";
        title: string;
        updatedAt: number;
        weekId: Id<"weeks">;
        weekStatus: "draft" | "published";
        weekTitle: string;
      }
    >;
    create: FunctionReference<
      "mutation",
      "public",
      {
        blocks?: Array<
          | { id?: string; md: string; type: "text" }
          | {
              id?: string;
              md: string;
              title?: string;
              tone: "tip" | "definition" | "warning" | "note";
              type: "callout";
            }
          | {
              caption?: string;
              code: string;
              id?: string;
              language: string;
              preview?: boolean;
              type: "code";
            }
          | {
              alt: string;
              caption?: string;
              id?: string;
              type: "image";
              url: string;
            }
          | { caption?: string; id?: string; type: "video"; url: string }
          | {
              id?: string;
              steps: Array<{ md: string; title?: string }>;
              title?: string;
              type: "steps";
            }
          | {
              check: {
                accepted?: Array<string>;
                explanation?: string;
                kind: "single" | "multiple" | "short";
                options?: Array<{ correct: boolean; text: string }>;
                prompt: string;
              };
              id?: string;
              type: "check";
            }
          | {
              id?: string;
              scene: {
                elements: Array<
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "heading";
                      size?: "sm" | "md" | "lg" | "xl";
                      text: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "text";
                      md: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      items: Array<string>;
                      kind: "list";
                      ordered?: boolean;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      code: string;
                      h?: number;
                      id: string;
                      kind: "code";
                      language: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      alt: string;
                      fit?: "cover" | "contain";
                      h?: number;
                      id: string;
                      kind: "image";
                      url: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      fill?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "shape";
                      label?: string;
                      shape: "rect" | "circle" | "pill" | "diamond";
                      stroke?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      curve?: number;
                      from: string;
                      id: string;
                      kind: "arrow";
                      label?: string;
                      to: string;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      decimals?: number;
                      h?: number;
                      id: string;
                      kind: "number";
                      label?: string;
                      prefix?: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      suffix?: string;
                      value: number;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      h?: number;
                      id: string;
                      kind: "note";
                      md: string;
                      tone: "tip" | "definition" | "warning" | "note";
                      w?: number;
                      x: number;
                      y: number;
                    }
                >;
                steps: Array<{
                  actions: Array<
                    | {
                        at?: number;
                        do: "enter";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "rise"
                          | "drop"
                          | "slide-left"
                          | "slide-right"
                          | "pop"
                          | "cascade"
                          | "wipe"
                          | "draw"
                          | "count"
                          | "type";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "exit";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "sink"
                          | "shrink"
                          | "slide-left"
                          | "slide-right";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "emphasize";
                        duration?: number;
                        effect?:
                          "pulse" | "shake" | "glow" | "flash" | "bounce";
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "focus";
                        duration?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "move";
                        duration?: number;
                        h?: number;
                        target: string;
                        w?: number;
                        x?: number;
                        y?: number;
                      }
                    | {
                        at?: number;
                        do: "camera";
                        duration?: number;
                        scale?: number;
                        target?: string;
                        x?: number;
                        y?: number;
                      }
                  >;
                  note?: string;
                }>;
                theme?: "paper" | "ink";
                title?: string;
              };
              type: "scene";
            }
        >;
        title: string;
        weekId: Id<"weeks">;
      },
      Id<"lessons">
    >;
    update: FunctionReference<
      "mutation",
      "public",
      { lessonId: Id<"lessons">; title?: string },
      null
    >;
    saveBlocks: FunctionReference<
      "mutation",
      "public",
      {
        blocks: Array<
          | { id?: string; md: string; type: "text" }
          | {
              id?: string;
              md: string;
              title?: string;
              tone: "tip" | "definition" | "warning" | "note";
              type: "callout";
            }
          | {
              caption?: string;
              code: string;
              id?: string;
              language: string;
              preview?: boolean;
              type: "code";
            }
          | {
              alt: string;
              caption?: string;
              id?: string;
              type: "image";
              url: string;
            }
          | { caption?: string; id?: string; type: "video"; url: string }
          | {
              id?: string;
              steps: Array<{ md: string; title?: string }>;
              title?: string;
              type: "steps";
            }
          | {
              check: {
                accepted?: Array<string>;
                explanation?: string;
                kind: "single" | "multiple" | "short";
                options?: Array<{ correct: boolean; text: string }>;
                prompt: string;
              };
              id?: string;
              type: "check";
            }
          | {
              id?: string;
              scene: {
                elements: Array<
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "heading";
                      size?: "sm" | "md" | "lg" | "xl";
                      text: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "text";
                      md: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      items: Array<string>;
                      kind: "list";
                      ordered?: boolean;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      code: string;
                      h?: number;
                      id: string;
                      kind: "code";
                      language: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      alt: string;
                      fit?: "cover" | "contain";
                      h?: number;
                      id: string;
                      kind: "image";
                      url: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      fill?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "shape";
                      label?: string;
                      shape: "rect" | "circle" | "pill" | "diamond";
                      stroke?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      curve?: number;
                      from: string;
                      id: string;
                      kind: "arrow";
                      label?: string;
                      to: string;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      decimals?: number;
                      h?: number;
                      id: string;
                      kind: "number";
                      label?: string;
                      prefix?: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      suffix?: string;
                      value: number;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      h?: number;
                      id: string;
                      kind: "note";
                      md: string;
                      tone: "tip" | "definition" | "warning" | "note";
                      w?: number;
                      x: number;
                      y: number;
                    }
                >;
                steps: Array<{
                  actions: Array<
                    | {
                        at?: number;
                        do: "enter";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "rise"
                          | "drop"
                          | "slide-left"
                          | "slide-right"
                          | "pop"
                          | "cascade"
                          | "wipe"
                          | "draw"
                          | "count"
                          | "type";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "exit";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "sink"
                          | "shrink"
                          | "slide-left"
                          | "slide-right";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "emphasize";
                        duration?: number;
                        effect?:
                          "pulse" | "shake" | "glow" | "flash" | "bounce";
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "focus";
                        duration?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "move";
                        duration?: number;
                        h?: number;
                        target: string;
                        w?: number;
                        x?: number;
                        y?: number;
                      }
                    | {
                        at?: number;
                        do: "camera";
                        duration?: number;
                        scale?: number;
                        target?: string;
                        x?: number;
                        y?: number;
                      }
                  >;
                  note?: string;
                }>;
                theme?: "paper" | "ink";
                title?: string;
              };
              type: "scene";
            }
        >;
        lessonId: Id<"lessons">;
      },
      Array<string>
    >;
    addBlocksTo: FunctionReference<
      "mutation",
      "public",
      {
        blocks: Array<
          | { id?: string; md: string; type: "text" }
          | {
              id?: string;
              md: string;
              title?: string;
              tone: "tip" | "definition" | "warning" | "note";
              type: "callout";
            }
          | {
              caption?: string;
              code: string;
              id?: string;
              language: string;
              preview?: boolean;
              type: "code";
            }
          | {
              alt: string;
              caption?: string;
              id?: string;
              type: "image";
              url: string;
            }
          | { caption?: string; id?: string; type: "video"; url: string }
          | {
              id?: string;
              steps: Array<{ md: string; title?: string }>;
              title?: string;
              type: "steps";
            }
          | {
              check: {
                accepted?: Array<string>;
                explanation?: string;
                kind: "single" | "multiple" | "short";
                options?: Array<{ correct: boolean; text: string }>;
                prompt: string;
              };
              id?: string;
              type: "check";
            }
          | {
              id?: string;
              scene: {
                elements: Array<
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "heading";
                      size?: "sm" | "md" | "lg" | "xl";
                      text: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "text";
                      md: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      items: Array<string>;
                      kind: "list";
                      ordered?: boolean;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      code: string;
                      h?: number;
                      id: string;
                      kind: "code";
                      language: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      alt: string;
                      fit?: "cover" | "contain";
                      h?: number;
                      id: string;
                      kind: "image";
                      url: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      fill?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "shape";
                      label?: string;
                      shape: "rect" | "circle" | "pill" | "diamond";
                      stroke?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      curve?: number;
                      from: string;
                      id: string;
                      kind: "arrow";
                      label?: string;
                      to: string;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      decimals?: number;
                      h?: number;
                      id: string;
                      kind: "number";
                      label?: string;
                      prefix?: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      suffix?: string;
                      value: number;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      h?: number;
                      id: string;
                      kind: "note";
                      md: string;
                      tone: "tip" | "definition" | "warning" | "note";
                      w?: number;
                      x: number;
                      y: number;
                    }
                >;
                steps: Array<{
                  actions: Array<
                    | {
                        at?: number;
                        do: "enter";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "rise"
                          | "drop"
                          | "slide-left"
                          | "slide-right"
                          | "pop"
                          | "cascade"
                          | "wipe"
                          | "draw"
                          | "count"
                          | "type";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "exit";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "sink"
                          | "shrink"
                          | "slide-left"
                          | "slide-right";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "emphasize";
                        duration?: number;
                        effect?:
                          "pulse" | "shake" | "glow" | "flash" | "bounce";
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "focus";
                        duration?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "move";
                        duration?: number;
                        h?: number;
                        target: string;
                        w?: number;
                        x?: number;
                        y?: number;
                      }
                    | {
                        at?: number;
                        do: "camera";
                        duration?: number;
                        scale?: number;
                        target?: string;
                        x?: number;
                        y?: number;
                      }
                  >;
                  note?: string;
                }>;
                theme?: "paper" | "ink";
                title?: string;
              };
              type: "scene";
            }
        >;
        lessonId: Id<"lessons">;
        position?: number;
      },
      Array<string>
    >;
    updateBlockIn: FunctionReference<
      "mutation",
      "public",
      {
        block:
          | { id?: string; md: string; type: "text" }
          | {
              id?: string;
              md: string;
              title?: string;
              tone: "tip" | "definition" | "warning" | "note";
              type: "callout";
            }
          | {
              caption?: string;
              code: string;
              id?: string;
              language: string;
              preview?: boolean;
              type: "code";
            }
          | {
              alt: string;
              caption?: string;
              id?: string;
              type: "image";
              url: string;
            }
          | { caption?: string; id?: string; type: "video"; url: string }
          | {
              id?: string;
              steps: Array<{ md: string; title?: string }>;
              title?: string;
              type: "steps";
            }
          | {
              check: {
                accepted?: Array<string>;
                explanation?: string;
                kind: "single" | "multiple" | "short";
                options?: Array<{ correct: boolean; text: string }>;
                prompt: string;
              };
              id?: string;
              type: "check";
            }
          | {
              id?: string;
              scene: {
                elements: Array<
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "heading";
                      size?: "sm" | "md" | "lg" | "xl";
                      text: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "text";
                      md: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      items: Array<string>;
                      kind: "list";
                      ordered?: boolean;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      code: string;
                      h?: number;
                      id: string;
                      kind: "code";
                      language: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      alt: string;
                      fit?: "cover" | "contain";
                      h?: number;
                      id: string;
                      kind: "image";
                      url: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      fill?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "shape";
                      label?: string;
                      shape: "rect" | "circle" | "pill" | "diamond";
                      stroke?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      curve?: number;
                      from: string;
                      id: string;
                      kind: "arrow";
                      label?: string;
                      to: string;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      decimals?: number;
                      h?: number;
                      id: string;
                      kind: "number";
                      label?: string;
                      prefix?: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      suffix?: string;
                      value: number;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      h?: number;
                      id: string;
                      kind: "note";
                      md: string;
                      tone: "tip" | "definition" | "warning" | "note";
                      w?: number;
                      x: number;
                      y: number;
                    }
                >;
                steps: Array<{
                  actions: Array<
                    | {
                        at?: number;
                        do: "enter";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "rise"
                          | "drop"
                          | "slide-left"
                          | "slide-right"
                          | "pop"
                          | "cascade"
                          | "wipe"
                          | "draw"
                          | "count"
                          | "type";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "exit";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "sink"
                          | "shrink"
                          | "slide-left"
                          | "slide-right";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "emphasize";
                        duration?: number;
                        effect?:
                          "pulse" | "shake" | "glow" | "flash" | "bounce";
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "focus";
                        duration?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "move";
                        duration?: number;
                        h?: number;
                        target: string;
                        w?: number;
                        x?: number;
                        y?: number;
                      }
                    | {
                        at?: number;
                        do: "camera";
                        duration?: number;
                        scale?: number;
                        target?: string;
                        x?: number;
                        y?: number;
                      }
                  >;
                  note?: string;
                }>;
                theme?: "paper" | "ink";
                title?: string;
              };
              type: "scene";
            };
        blockId: string;
        lessonId: Id<"lessons">;
      },
      null
    >;
    deleteBlockFrom: FunctionReference<
      "mutation",
      "public",
      { blockId: string; lessonId: Id<"lessons"> },
      null
    >;
    move: FunctionReference<
      "mutation",
      "public",
      {
        direction?: "up" | "down";
        lessonId: Id<"lessons">;
        weekId?: Id<"weeks">;
      },
      null
    >;
    setStatus: FunctionReference<
      "mutation",
      "public",
      { lessonId: Id<"lessons">; status: "draft" | "published" },
      null
    >;
    remove: FunctionReference<
      "mutation",
      "public",
      { lessonId: Id<"lessons"> },
      null
    >;
    read: FunctionReference<
      "query",
      "public",
      { lessonId: Id<"lessons"> },
      {
        _id: Id<"lessons">;
        blocks: Array<
          | { id: string; md: string; type: "text" }
          | {
              id: string;
              md: string;
              title?: string;
              tone: "tip" | "definition" | "warning" | "note";
              type: "callout";
            }
          | {
              caption?: string;
              code: string;
              id: string;
              language: string;
              preview?: boolean;
              type: "code";
            }
          | {
              alt: string;
              caption?: string;
              id: string;
              type: "image";
              url: string;
            }
          | { caption?: string; id: string; type: "video"; url: string }
          | {
              id: string;
              steps: Array<{ md: string; title?: string }>;
              title?: string;
              type: "steps";
            }
          | {
              check: {
                accepted?: Array<string>;
                explanation?: string;
                kind: "single" | "multiple" | "short";
                options?: Array<{ correct: boolean; text: string }>;
                prompt: string;
              };
              id: string;
              type: "check";
            }
          | {
              id: string;
              scene: {
                elements: Array<
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "heading";
                      size?: "sm" | "md" | "lg" | "xl";
                      text: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "text";
                      md: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      items: Array<string>;
                      kind: "list";
                      ordered?: boolean;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      code: string;
                      h?: number;
                      id: string;
                      kind: "code";
                      language: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      alt: string;
                      fit?: "cover" | "contain";
                      h?: number;
                      id: string;
                      kind: "image";
                      url: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      fill?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "shape";
                      label?: string;
                      shape: "rect" | "circle" | "pill" | "diamond";
                      stroke?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      curve?: number;
                      from: string;
                      id: string;
                      kind: "arrow";
                      label?: string;
                      to: string;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      decimals?: number;
                      h?: number;
                      id: string;
                      kind: "number";
                      label?: string;
                      prefix?: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      suffix?: string;
                      value: number;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      h?: number;
                      id: string;
                      kind: "note";
                      md: string;
                      tone: "tip" | "definition" | "warning" | "note";
                      w?: number;
                      x: number;
                      y: number;
                    }
                >;
                steps: Array<{
                  actions: Array<
                    | {
                        at?: number;
                        do: "enter";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "rise"
                          | "drop"
                          | "slide-left"
                          | "slide-right"
                          | "pop"
                          | "cascade"
                          | "wipe"
                          | "draw"
                          | "count"
                          | "type";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "exit";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "sink"
                          | "shrink"
                          | "slide-left"
                          | "slide-right";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "emphasize";
                        duration?: number;
                        effect?:
                          "pulse" | "shake" | "glow" | "flash" | "bounce";
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "focus";
                        duration?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "move";
                        duration?: number;
                        h?: number;
                        target: string;
                        w?: number;
                        x?: number;
                        y?: number;
                      }
                    | {
                        at?: number;
                        do: "camera";
                        duration?: number;
                        scale?: number;
                        target?: string;
                        x?: number;
                        y?: number;
                      }
                  >;
                  note?: string;
                }>;
                theme?: "paper" | "ink";
                title?: string;
              };
              type: "scene";
            }
        >;
        course: { _id: Id<"courses">; title: string };
        next: null | { _id: Id<"lessons">; title: string };
        previous: null | { _id: Id<"lessons">; title: string };
        title: string;
        week: { _id: Id<"weeks">; title: string };
      }
    >;
  };
  weeks: {
    outline: FunctionReference<
      "query",
      "public",
      { courseId: Id<"courses">; now: number },
      {
        canEdit: boolean;
        courseId: Id<"courses">;
        drive: null | {
          canTakeOver: boolean;
          folderUrl?: string;
          mine: boolean;
          ownerName: string;
        };
        driveAvailable: boolean;
        exams: Array<{
          _creationTime: number;
          _id: Id<"assessments">;
          courseId: Id<"courses">;
          createdVia: "web" | "mcp";
          instructions?: string;
          kind: "task" | "quiz" | "midterm" | "final";
          publishedAt?: number;
          questionCount: number;
          settings: {
            attemptsAllowed: number;
            closesAt?: number;
            integrityLevel: "off" | "standard" | "strict";
            opensAt?: number;
            resultsVisibility: "hidden" | "score" | "full_after_close";
            shuffleOptions: boolean;
            shuffleQuestions: boolean;
            timeLimitMin?: number;
          };
          status: "draft" | "published" | "archived";
          title: string;
          totalPoints: number;
          updatedAt: number;
          weekId?: Id<"weeks">;
        }>;
        unplaced: Array<{
          _creationTime: number;
          _id: Id<"assessments">;
          courseId: Id<"courses">;
          createdVia: "web" | "mcp";
          instructions?: string;
          kind: "task" | "quiz" | "midterm" | "final";
          publishedAt?: number;
          questionCount: number;
          settings: {
            attemptsAllowed: number;
            closesAt?: number;
            integrityLevel: "off" | "standard" | "strict";
            opensAt?: number;
            resultsVisibility: "hidden" | "score" | "full_after_close";
            shuffleOptions: boolean;
            shuffleQuestions: boolean;
            timeLimitMin?: number;
          };
          status: "draft" | "published" | "archived";
          title: string;
          totalPoints: number;
          updatedAt: number;
          weekId?: Id<"weeks">;
        }>;
        weeks: Array<{
          _id: Id<"weeks">;
          assessments: Array<{
            _creationTime: number;
            _id: Id<"assessments">;
            courseId: Id<"courses">;
            createdVia: "web" | "mcp";
            instructions?: string;
            kind: "task" | "quiz" | "midterm" | "final";
            publishedAt?: number;
            questionCount: number;
            settings: {
              attemptsAllowed: number;
              closesAt?: number;
              integrityLevel: "off" | "standard" | "strict";
              opensAt?: number;
              resultsVisibility: "hidden" | "score" | "full_after_close";
              shuffleOptions: boolean;
              shuffleQuestions: boolean;
              timeLimitMin?: number;
            };
            status: "draft" | "published" | "archived";
            title: string;
            totalPoints: number;
            updatedAt: number;
            weekId?: Id<"weeks">;
          }>;
          description?: string;
          drive: null | {
            error?: string;
            shared: boolean;
            stale: boolean;
            syncing?: "folder" | "share" | "unshare";
            url?: string;
          };
          lessons: Array<{
            _id: Id<"lessons">;
            blockCount: number;
            createdVia: "web" | "mcp";
            status: "draft" | "published";
            title: string;
            updatedAt: number;
          }>;
          links: Array<{ id: string; title: string; url: string }>;
          order: number;
          publishedAt?: number;
          status: "draft" | "published";
          title: string;
        }>;
      }
    >;
    create: FunctionReference<
      "mutation",
      "public",
      {
        courseId: Id<"courses">;
        description?: string;
        driveFolder?: boolean;
        links?: Array<{ title: string; url: string }>;
        title?: string;
      },
      Id<"weeks">
    >;
    update: FunctionReference<
      "mutation",
      "public",
      { description?: string; title?: string; weekId: Id<"weeks"> },
      null
    >;
    move: FunctionReference<
      "mutation",
      "public",
      { direction: "up" | "down"; weekId: Id<"weeks"> },
      null
    >;
    reorder: FunctionReference<
      "mutation",
      "public",
      { courseId: Id<"courses">; weekIds: Array<Id<"weeks">> },
      null
    >;
    publish: FunctionReference<
      "mutation",
      "public",
      { weekId: Id<"weeks"> },
      null
    >;
    unpublish: FunctionReference<
      "mutation",
      "public",
      { weekId: Id<"weeks"> },
      null
    >;
    remove: FunctionReference<
      "mutation",
      "public",
      { weekId: Id<"weeks"> },
      null
    >;
    addLinksTo: FunctionReference<
      "mutation",
      "public",
      { links: Array<{ title: string; url: string }>; weekId: Id<"weeks"> },
      Array<string>
    >;
    updateLinkIn: FunctionReference<
      "mutation",
      "public",
      { linkId: string; title: string; url: string; weekId: Id<"weeks"> },
      null
    >;
    removeLinkFrom: FunctionReference<
      "mutation",
      "public",
      { linkId: string; weekId: Id<"weeks"> },
      null
    >;
    moveLinkIn: FunctionReference<
      "mutation",
      "public",
      { direction: "up" | "down"; linkId: string; weekId: Id<"weeks"> },
      null
    >;
    addFolder: FunctionReference<
      "mutation",
      "public",
      { weekId: Id<"weeks"> },
      null
    >;
    retry: FunctionReference<
      "mutation",
      "public",
      { weekId: Id<"weeks"> },
      null
    >;
    moveToMyDrive: FunctionReference<
      "mutation",
      "public",
      { courseId: Id<"courses"> },
      null
    >;
    place: FunctionReference<
      "mutation",
      "public",
      { assessmentId: Id<"assessments">; weekId: Id<"weeks"> | null },
      null
    >;
  };
  kalami: {
    exportCourse: FunctionReference<
      "query",
      "public",
      { courseId: Id<"courses"> },
      { content: string; fileName: string }
    >;
    inspect: FunctionReference<
      "action",
      "public",
      { text: string },
      | {
          ok: true;
          summary: {
            assessments: {
              final: number;
              midterm: number;
              quiz: number;
              task: number;
            };
            exported?: { at: string; by: string; from: string };
            language: "ka" | "en";
            lessons: number;
            links: number;
            questions: number;
            title: string;
            weeks: number;
          };
          verified: null | { at: string; by: string };
        }
      | {
          errors: Array<string>;
          ok: false;
          summary?: {
            assessments: {
              final: number;
              midterm: number;
              quiz: number;
              task: number;
            };
            exported?: { at: string; by: string; from: string };
            language: "ka" | "en";
            lessons: number;
            links: number;
            questions: number;
            title: string;
            weeks: number;
          };
        }
    >;
    importCourse: FunctionReference<
      "action",
      "public",
      { text: string; universityId?: Id<"universities"> | null },
      | {
          courseId: Id<"courses">;
          ok: true;
          summary: {
            assessments: {
              final: number;
              midterm: number;
              quiz: number;
              task: number;
            };
            exported?: { at: string; by: string; from: string };
            language: "ka" | "en";
            lessons: number;
            links: number;
            questions: number;
            title: string;
            weeks: number;
          };
          verified: null | { at: string; by: string };
        }
      | {
          errors: Array<string>;
          ok: false;
          summary?: {
            assessments: {
              final: number;
              midterm: number;
              quiz: number;
              task: number;
            };
            exported?: { at: string; by: string; from: string };
            language: "ka" | "en";
            lessons: number;
            links: number;
            questions: number;
            title: string;
            weeks: number;
          };
        }
    >;
  };
  people: {
    search: FunctionReference<
      "query",
      "public",
      { query: string },
      Array<{
        _id: Id<"users">;
        email: string;
        memberships: Array<{
          _id: Id<"memberships">;
          role: "student" | "lecturer" | "uni_admin" | "super_admin";
          universityId?: Id<"universities">;
          universityName?: { en: string; ka: string };
        }>;
        name: string;
      }>
    >;
    changeStaffRole: FunctionReference<
      "mutation",
      "public",
      {
        membershipId: Id<"memberships">;
        role: "lecturer" | "uni_admin";
        universityId?: Id<"universities">;
      },
      null
    >;
    removeStaffRole: FunctionReference<
      "mutation",
      "public",
      { membershipId: Id<"memberships"> },
      null
    >;
  };
  platform: {
    overview: FunctionReference<
      "query",
      "public",
      { now: number; university?: Id<"universities"> | "none" },
      {
        assessments: {
          approximate: boolean;
          archived: number;
          byKind: {
            final: number;
            midterm: number;
            quiz: number;
            task: number;
          };
          draft: number;
          published: number;
        };
        courses: {
          archived: number;
          draft: number;
          published: number;
          total: number;
        };
        groups: { active: number; archived: number };
        isSuperAdmin: boolean;
        live: {
          attemptsInProgress: number;
          closingSoon: Array<{
            assessmentId: Id<"assessments">;
            closesAt: number;
            courseId: Id<"courses">;
            courseTitle: string;
            inProgress: number;
            kind: "task" | "quiz" | "midterm" | "final";
            title: string;
          }>;
        };
        openTeamConversations?: number;
        pendingInvites: number;
        people: {
          capped: boolean;
          lecturers: number;
          students: number;
          superAdmins?: number;
          uniAdmins: number;
        };
        recent: Array<{
          _id: Id<"auditLog">;
          action: string;
          actorEmail?: string;
          actorName: string;
          at: number;
          client?: string;
          courseId?: Id<"courses">;
          courseTitle?: string;
          summary: string;
          targetId: string;
          targetTable: string;
          via: "web" | "mcp";
        }>;
        universities: Array<{
          _id: Id<"universities">;
          name: { en: string; ka: string };
          status: "active" | "archived";
        }>;
      }
    >;
    universities: FunctionReference<
      "query",
      "public",
      { now: number },
      Array<{
        _creationTime: number;
        _id: Id<"universities">;
        admins: number;
        courses: number;
        groups: number;
        lecturers: number;
        name: { en: string; ka: string };
        pendingInvites: number;
        publishedCourses: number;
        slug: string;
        status: "active" | "archived";
        students: number;
      }>
    >;
    updateUniversity: FunctionReference<
      "mutation",
      "public",
      {
        nameEn?: string;
        nameKa?: string;
        slug?: string;
        status?: "active" | "archived";
        universityId: Id<"universities">;
      },
      null
    >;
    students: FunctionReference<
      "query",
      "public",
      {
        paginationOpts: {
          cursor: string | null;
          endCursor?: string | null;
          id?: number;
          maximumBytesRead?: number;
          maximumRowsRead?: number;
          numItems: number;
        };
        university?: Id<"universities"> | "none";
      },
      {
        continueCursor: string;
        isDone: boolean;
        page: Array<{
          avatarUrl?: string;
          courses: number;
          email: string;
          emailOff?: "opted_out" | "bounced" | "complained";
          faculty?: string;
          group?: string;
          groups: number;
          joinedAt: number;
          locale: "ka" | "en";
          membershipId: Id<"memberships">;
          name: string;
          onboarded: boolean;
          studentNumber?: string;
          universityId?: Id<"universities">;
          universityName?: { en: string; ka: string };
          userId: Id<"users">;
          year?: number;
        }>;
        pageStatus?: "SplitRecommended" | "SplitRequired" | null;
        splitCursor?: string | null;
      }
    >;
    findStudents: FunctionReference<
      "query",
      "public",
      { query: string; university?: Id<"universities"> | "none" },
      Array<{
        avatarUrl?: string;
        courses: number;
        email: string;
        emailOff?: "opted_out" | "bounced" | "complained";
        faculty?: string;
        group?: string;
        groups: number;
        joinedAt: number;
        locale: "ka" | "en";
        membershipId: Id<"memberships">;
        name: string;
        onboarded: boolean;
        studentNumber?: string;
        universityId?: Id<"universities">;
        universityName?: { en: string; ka: string };
        userId: Id<"users">;
        year?: number;
      }>
    >;
    student: FunctionReference<
      "query",
      "public",
      { userId: Id<"users"> },
      {
        attempts: Array<{
          _id: Id<"attempts">;
          assessmentId: Id<"assessments">;
          assessmentTitle: string;
          autoSubmitted: boolean;
          courseId: Id<"courses">;
          courseTitle: string;
          graded: boolean;
          integrity: "green" | "yellow" | "red";
          kind: "task" | "quiz" | "midterm" | "final";
          maxScore: number;
          needsGrading: boolean;
          number: number;
          percent?: number;
          score?: number;
          startedAt: number;
          status: "in_progress" | "submitted";
          submittedAt?: number;
        }>;
        enrollments: Array<{
          _id: Id<"enrollments">;
          courseId: Id<"courses">;
          courseStatus: "draft" | "published" | "archived";
          courseTitle: string;
          enrolledAt: number;
          groupNames: Array<string>;
          status: "active" | "removed";
          viaCode: boolean;
        }>;
        groups: Array<{
          _id: Id<"groups">;
          archived: boolean;
          joinedAt: number;
          name: string;
          universityName?: { en: string; ka: string };
          via: "link" | "email";
        }>;
        profile: {
          avatarUrl?: string;
          courses: number;
          email: string;
          emailOff?: "opted_out" | "bounced" | "complained";
          faculty?: string;
          group?: string;
          groups: number;
          joinedAt: number;
          locale: "ka" | "en";
          membershipId: Id<"memberships">;
          name: string;
          onboarded: boolean;
          studentNumber?: string;
          universityId?: Id<"universities">;
          universityName?: { en: string; ka: string };
          userId: Id<"users">;
          year?: number;
        };
        stats: {
          attempts: number;
          averagePercent?: number;
          bestPercent?: number;
          flagged: number;
          inProgress: number;
          needsGrading: number;
          submitted: number;
        };
      }
    >;
    setEnrollmentStatus: FunctionReference<
      "mutation",
      "public",
      { enrollmentId: Id<"enrollments">; status: "active" | "removed" },
      null
    >;
    updateStudentProfile: FunctionReference<
      "mutation",
      "public",
      {
        faculty?: string;
        group?: string;
        studentNumber?: string;
        universityId: Id<"universities"> | null;
        userId: Id<"users">;
        year?: number;
      },
      null
    >;
    staff: FunctionReference<
      "query",
      "public",
      {
        role?: "lecturer" | "uni_admin" | "super_admin";
        university?: Id<"universities"> | "none";
      },
      Array<{
        assistantCourses: number;
        avatarUrl?: string;
        email: string;
        emailOff?: "opted_out" | "bounced" | "complained";
        groups: number;
        joinedAt: number;
        lastActiveAt?: number;
        locale: "ka" | "en";
        name: string;
        ownedCourses: number;
        roles: Array<{
          membershipId: Id<"memberships">;
          role: "student" | "lecturer" | "uni_admin" | "super_admin";
          universityId?: Id<"universities">;
          universityName?: { en: string; ka: string };
        }>;
        userId: Id<"users">;
      }>
    >;
    findStaff: FunctionReference<
      "query",
      "public",
      { query: string; university?: Id<"universities"> | "none" },
      Array<{
        assistantCourses: number;
        avatarUrl?: string;
        email: string;
        emailOff?: "opted_out" | "bounced" | "complained";
        groups: number;
        joinedAt: number;
        lastActiveAt?: number;
        locale: "ka" | "en";
        name: string;
        ownedCourses: number;
        roles: Array<{
          membershipId: Id<"memberships">;
          role: "student" | "lecturer" | "uni_admin" | "super_admin";
          universityId?: Id<"universities">;
          universityName?: { en: string; ka: string };
        }>;
        userId: Id<"users">;
      }>
    >;
    staffMember: FunctionReference<
      "query",
      "public",
      { userId: Id<"users"> },
      {
        activity: Array<{
          _id: Id<"auditLog">;
          action: string;
          actorEmail?: string;
          actorName: string;
          at: number;
          client?: string;
          courseId?: Id<"courses">;
          courseTitle?: string;
          summary: string;
          targetId: string;
          targetTable: string;
          via: "web" | "mcp";
        }>;
        courses: Array<{
          _id: Id<"courses">;
          assessments: { archived: number; draft: number; published: number };
          role: "owner" | "assistant";
          status: "draft" | "published" | "archived";
          students: number;
          title: string;
          universityName?: { en: string; ka: string };
          updatedAt: number;
        }>;
        groups: Array<{
          _id: Id<"groups">;
          archived: boolean;
          joinedAt: number;
          members: number;
          name: string;
          universityName?: { en: string; ka: string };
        }>;
        profile: {
          assistantCourses: number;
          avatarUrl?: string;
          email: string;
          emailOff?: "opted_out" | "bounced" | "complained";
          groups: number;
          joinedAt: number;
          lastActiveAt?: number;
          locale: "ka" | "en";
          name: string;
          ownedCourses: number;
          roles: Array<{
            membershipId: Id<"memberships">;
            role: "student" | "lecturer" | "uni_admin" | "super_admin";
            universityId?: Id<"universities">;
            universityName?: { en: string; ka: string };
          }>;
          userId: Id<"users">;
        };
      }
    >;
    addStaffRole: FunctionReference<
      "mutation",
      "public",
      {
        role: "lecturer" | "uni_admin";
        universityId?: Id<"universities">;
        userId: Id<"users">;
      },
      null
    >;
    courses: FunctionReference<
      "query",
      "public",
      {
        paginationOpts: {
          cursor: string | null;
          endCursor?: string | null;
          id?: number;
          maximumBytesRead?: number;
          maximumRowsRead?: number;
          numItems: number;
        };
        status?: "draft" | "published" | "archived";
        university?: Id<"universities"> | "none";
      },
      {
        continueCursor: string;
        isDone: boolean;
        page: Array<{
          _creationTime: number;
          _id: Id<"courses">;
          assessments: { archived: number; draft: number; published: number };
          createdVia: "web" | "mcp";
          description?: string;
          joinCode: string;
          joinEnabled: boolean;
          locale: "ka" | "en";
          ownerEmail?: string;
          ownerId: Id<"users">;
          ownerName: string;
          semester?: string;
          status: "draft" | "published" | "archived";
          students: number;
          title: string;
          universityId?: Id<"universities">;
          universityName?: { en: string; ka: string };
          updatedAt: number;
        }>;
        pageStatus?: "SplitRecommended" | "SplitRequired" | null;
        splitCursor?: string | null;
      }
    >;
    findCourses: FunctionReference<
      "query",
      "public",
      { query: string; university?: Id<"universities"> | "none" },
      Array<{
        _creationTime: number;
        _id: Id<"courses">;
        assessments: { archived: number; draft: number; published: number };
        createdVia: "web" | "mcp";
        description?: string;
        joinCode: string;
        joinEnabled: boolean;
        locale: "ka" | "en";
        ownerEmail?: string;
        ownerId: Id<"users">;
        ownerName: string;
        semester?: string;
        status: "draft" | "published" | "archived";
        students: number;
        title: string;
        universityId?: Id<"universities">;
        universityName?: { en: string; ka: string };
        updatedAt: number;
      }>
    >;
    course: FunctionReference<
      "query",
      "public",
      { courseId: Id<"courses"> },
      {
        assessments: Array<{
          _id: Id<"assessments">;
          closesAt?: number;
          inProgress: number;
          kind: "task" | "quiz" | "midterm" | "final";
          opensAt?: number;
          publishedAt?: number;
          questionCount: number;
          status: "draft" | "published" | "archived";
          submitted: number;
          title: string;
          totalPoints: number;
          updatedAt: number;
        }>;
        course: {
          _creationTime: number;
          _id: Id<"courses">;
          assessments: { archived: number; draft: number; published: number };
          createdVia: "web" | "mcp";
          description?: string;
          joinCode: string;
          joinEnabled: boolean;
          locale: "ka" | "en";
          ownerEmail?: string;
          ownerId: Id<"users">;
          ownerName: string;
          semester?: string;
          status: "draft" | "published" | "archived";
          students: number;
          title: string;
          universityId?: Id<"universities">;
          universityName?: { en: string; ka: string };
          updatedAt: number;
        };
        enrollments: { active: number; removed: number };
        groups: Array<{ _id: Id<"groups">; members: number; name: string }>;
        staff: Array<{
          email?: string;
          name: string;
          role: "owner" | "assistant";
          userId: Id<"users">;
        }>;
      }
    >;
    transferCourse: FunctionReference<
      "mutation",
      "public",
      { courseId: Id<"courses">; newOwnerEmail: string },
      null
    >;
    groups: FunctionReference<
      "query",
      "public",
      { university?: Id<"universities"> | "none" },
      Array<{
        _creationTime: number;
        _id: Id<"groups">;
        archived: boolean;
        courses: number;
        description?: string;
        inviteEnabled: boolean;
        lecturers: number;
        members: number;
        name: string;
        ownerName: string;
        pendingInvites: number;
        universityId?: Id<"universities">;
        universityName?: { en: string; ka: string };
        updatedAt: number;
      }>
    >;
    findPeople: FunctionReference<
      "query",
      "public",
      { query: string },
      Array<{
        email: string;
        name: string;
        roles: Array<"student" | "lecturer" | "uni_admin" | "super_admin">;
        universityName?: { en: string; ka: string };
        userId: Id<"users">;
      }>
    >;
    broadcastPreview: FunctionReference<
      "query",
      "public",
      {
        audience:
          | { kind: "everyone" }
          | { kind: "students"; universityId?: Id<"universities"> | "none" }
          | { kind: "staff"; universityId?: Id<"universities"> | "none" }
          | { kind: "university"; universityId: Id<"universities"> }
          | { groupId: Id<"groups">; kind: "group" }
          | { courseId: Id<"courses">; kind: "course" }
          | { kind: "people"; userIds: Array<Id<"users">> }
          | { emails: Array<string>; kind: "emails" };
        emailEveryone: boolean;
      },
      {
        blocked: number;
        capped: boolean;
        emailConfigured: boolean;
        emailable: number;
        noAccount: number;
        optedOut: number;
        pushConfigured: boolean;
        recipients: number;
        staff: number;
        students: number;
        withPush: number;
      }
    >;
    sendBroadcast: FunctionReference<
      "mutation",
      "public",
      {
        audience:
          | { kind: "everyone" }
          | { kind: "students"; universityId?: Id<"universities"> | "none" }
          | { kind: "staff"; universityId?: Id<"universities"> | "none" }
          | { kind: "university"; universityId: Id<"universities"> }
          | { groupId: Id<"groups">; kind: "group" }
          | { courseId: Id<"courses">; kind: "course" }
          | { kind: "people"; userIds: Array<Id<"users">> }
          | { emails: Array<string>; kind: "emails" };
        body: string;
        channels: { email: boolean; push: boolean };
        emailEveryone: boolean;
        groupId?: Id<"groups">;
        link?: string;
        title: string;
      },
      Id<"broadcasts">
    >;
    broadcasts: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{
        _creationTime: number;
        _id: Id<"broadcasts">;
        audienceLabel: string;
        body: string;
        channels: { email: boolean; push: boolean };
        emailEveryone: boolean;
        emailed: number;
        finishedAt?: number;
        from: { en: string; ka: string };
        groupId?: Id<"groups">;
        groupName?: string;
        inApp: number;
        link?: string;
        pushed: number;
        recipients: number;
        senderName: string;
        status: "sending" | "sent";
        title: string;
      }>
    >;
    broadcastRecipients: FunctionReference<
      "query",
      "public",
      {
        broadcastId: Id<"broadcasts">;
        paginationOpts: {
          cursor: string | null;
          endCursor?: string | null;
          id?: number;
          maximumBytesRead?: number;
          maximumRowsRead?: number;
          numItems: number;
        };
      },
      {
        continueCursor: string;
        isDone: boolean;
        page: Array<{
          _id: Id<"broadcastDeliveries">;
          devices: number;
          email: string;
          emailSkipped?: "off" | "opted_out" | "blocked" | "not_configured";
          emailed: boolean;
          inApp: boolean;
          invited: boolean;
          name: string;
          role: "student" | "lecturer" | "uni_admin" | "super_admin" | "none";
          userId?: Id<"users">;
        }>;
        pageStatus?: "SplitRecommended" | "SplitRequired" | null;
        splitCursor?: string | null;
      }
    >;
    activity: FunctionReference<
      "query",
      "public",
      {
        paginationOpts: {
          cursor: string | null;
          endCursor?: string | null;
          id?: number;
          maximumBytesRead?: number;
          maximumRowsRead?: number;
          numItems: number;
        };
        targetTable?: string;
      },
      {
        continueCursor: string;
        isDone: boolean;
        page: Array<{
          _id: Id<"auditLog">;
          action: string;
          actorEmail?: string;
          actorName: string;
          at: number;
          client?: string;
          courseId?: Id<"courses">;
          courseTitle?: string;
          summary: string;
          targetId: string;
          targetTable: string;
          via: "web" | "mcp";
        }>;
        pageStatus?: "SplitRecommended" | "SplitRequired" | null;
        splitCursor?: string | null;
      }
    >;
    system: FunctionReference<
      "query",
      "public",
      { now: number },
      {
        attemptsInProgress: number;
        deploy: { busy: boolean; reason: string };
        email: {
          configured: boolean;
          suppressions: Array<{
            _id: Id<"emailSuppressions">;
            at: number;
            email: string;
            name?: string;
            status: "bounced" | "complained" | "unsubscribed";
            userId?: Id<"users">;
          }>;
        };
        migration: { materialsLeft: number };
        scheduledJobs: Array<{ does: string; every: string; name: string }>;
      }
    >;
    clearEmailSuppression: FunctionReference<
      "mutation",
      "public",
      { email: string },
      null
    >;
  };
  push: {
    mine: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{ endpoint: string; lastUsedAt: number; userAgent?: string }>
    >;
    requestTest: FunctionReference<
      "mutation",
      "public",
      Record<string, never>,
      number
    >;
    subscribe: FunctionReference<
      "mutation",
      "public",
      {
        endpoint: string;
        keys: { auth: string; p256dh: string };
        userAgent?: string;
      },
      null
    >;
    unsubscribe: FunctionReference<
      "mutation",
      "public",
      { endpoint: string },
      null
    >;
    vapidPublicKey: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      string | null
    >;
  };
  study: {
    whoami: FunctionReference<
      "query",
      "public",
      { client?: string; token: string },
      null | {
        courses: number;
        email: string;
        locale: "ka" | "en";
        name: string;
        university?: { en: string; ka: string };
        userId: Id<"users">;
      }
    >;
    listCourses: FunctionReference<
      "query",
      "public",
      { client?: string; token: string },
      Array<{
        _id: Id<"courses">;
        archived: boolean;
        description?: string;
        lecturer: string;
        openCount: number;
        semester?: string;
        title: string;
      }>
    >;
    getCourse: FunctionReference<
      "query",
      "public",
      { client?: string; courseId: Id<"courses">; token: string },
      {
        _id: Id<"courses">;
        archived: boolean;
        assessments: Array<{
          _id: Id<"assessments">;
          closesAt?: number;
          kind: "task" | "quiz" | "midterm" | "final";
          opensAt?: number;
          playable: boolean;
          questionCount: number;
          result: null | {
            score?: number;
            status: "in_progress" | "submitted";
            submittedAt?: number;
          };
          state: "upcoming" | "open" | "closed";
          title: string;
          totalPoints: number;
          weekId?: Id<"weeks">;
        }>;
        description?: string;
        lecturer: string;
        materials: Array<{
          _id: string;
          description?: string;
          host: string;
          source: "drive" | "link";
          title: string;
          url: string;
        }>;
        semester?: string;
        title: string;
        weeks: Array<{
          _id: Id<"weeks">;
          description?: string;
          driveUrl?: string;
          lessons: Array<{ _id: Id<"lessons">; title: string }>;
          links: Array<{
            host: string;
            id: string;
            title: string;
            url: string;
          }>;
          title: string;
        }>;
      }
    >;
    getLesson: FunctionReference<
      "query",
      "public",
      { client?: string; lessonId: Id<"lessons">; token: string },
      {
        _id: Id<"lessons">;
        blocks: Array<
          | { id: string; md: string; type: "text" }
          | {
              id: string;
              md: string;
              title?: string;
              tone: "tip" | "definition" | "warning" | "note";
              type: "callout";
            }
          | {
              caption?: string;
              code: string;
              id: string;
              language: string;
              preview?: boolean;
              type: "code";
            }
          | {
              alt: string;
              caption?: string;
              id: string;
              type: "image";
              url: string;
            }
          | { caption?: string; id: string; type: "video"; url: string }
          | {
              id: string;
              steps: Array<{ md: string; title?: string }>;
              title?: string;
              type: "steps";
            }
          | {
              check: {
                accepted?: Array<string>;
                explanation?: string;
                kind: "single" | "multiple" | "short";
                options?: Array<{ correct: boolean; text: string }>;
                prompt: string;
              };
              id: string;
              type: "check";
            }
          | {
              id: string;
              scene: {
                elements: Array<
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "heading";
                      size?: "sm" | "md" | "lg" | "xl";
                      text: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      align?: "left" | "center" | "right";
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "text";
                      md: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      items: Array<string>;
                      kind: "list";
                      ordered?: boolean;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      code: string;
                      h?: number;
                      id: string;
                      kind: "code";
                      language: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      alt: string;
                      fit?: "cover" | "contain";
                      h?: number;
                      id: string;
                      kind: "image";
                      url: string;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      fill?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      h?: number;
                      id: string;
                      kind: "shape";
                      label?: string;
                      shape: "rect" | "circle" | "pill" | "diamond";
                      stroke?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      curve?: number;
                      from: string;
                      id: string;
                      kind: "arrow";
                      label?: string;
                      to: string;
                    }
                  | {
                      color?:
                        | "ink"
                        | "paper"
                        | "graphite"
                        | "panel"
                        | "card"
                        | "charcoal"
                        | "highlighter"
                        | "highlighter-deep"
                        | "red-pen"
                        | "ok"
                        | "warn";
                      decimals?: number;
                      h?: number;
                      id: string;
                      kind: "number";
                      label?: string;
                      prefix?: string;
                      size?: "sm" | "md" | "lg" | "xl";
                      suffix?: string;
                      value: number;
                      w?: number;
                      x: number;
                      y: number;
                    }
                  | {
                      h?: number;
                      id: string;
                      kind: "note";
                      md: string;
                      tone: "tip" | "definition" | "warning" | "note";
                      w?: number;
                      x: number;
                      y: number;
                    }
                >;
                steps: Array<{
                  actions: Array<
                    | {
                        at?: number;
                        do: "enter";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "rise"
                          | "drop"
                          | "slide-left"
                          | "slide-right"
                          | "pop"
                          | "cascade"
                          | "wipe"
                          | "draw"
                          | "count"
                          | "type";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "exit";
                        duration?: number;
                        effect?:
                          | "fade"
                          | "sink"
                          | "shrink"
                          | "slide-left"
                          | "slide-right";
                        stagger?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "emphasize";
                        duration?: number;
                        effect?:
                          "pulse" | "shake" | "glow" | "flash" | "bounce";
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "focus";
                        duration?: number;
                        targets: Array<string>;
                      }
                    | {
                        at?: number;
                        do: "move";
                        duration?: number;
                        h?: number;
                        target: string;
                        w?: number;
                        x?: number;
                        y?: number;
                      }
                    | {
                        at?: number;
                        do: "camera";
                        duration?: number;
                        scale?: number;
                        target?: string;
                        x?: number;
                        y?: number;
                      }
                  >;
                  note?: string;
                }>;
                theme?: "paper" | "ink";
                title?: string;
              };
              type: "scene";
            }
        >;
        course: { _id: Id<"courses">; title: string };
        next: null | { _id: Id<"lessons">; title: string };
        previous: null | { _id: Id<"lessons">; title: string };
        title: string;
        week: { _id: Id<"weeks">; title: string };
      }
    >;
    getWork: FunctionReference<
      "query",
      "public",
      { assessmentId: Id<"assessments">; client?: string; token: string },
      | {
          assessment: {
            _id: Id<"assessments">;
            closesAt?: number;
            course: { _id: Id<"courses">; title: string };
            kind: "task" | "quiz" | "midterm" | "final";
            state: "open" | "closed";
            title: string;
          };
          available: false;
          reason: string;
        }
      | {
          available: true;
          kind: "task";
          task: {
            assessment: {
              _id: Id<"assessments">;
              closesAt?: number;
              instructions?: string;
              integrityLevel: "off" | "standard" | "strict";
              resultsVisibility: "hidden" | "score" | "full_after_close";
              state: "open" | "closed";
              title: string;
              totalPoints: number;
            };
            attempt: null | {
              autoSubmitted: boolean;
              feedback?: string;
              maxScore: number;
              score?: number;
              startedAt: number;
              status: "in_progress" | "submitted";
              submittedAt?: number;
            };
            comments: Array<{
              _id: Id<"codeComments">;
              author: string;
              file: string;
              line: number;
              questionId: Id<"questions">;
              text: string;
            }>;
            course: { _id: Id<"courses">; title: string };
            hiddenChecks: Array<{
              id: string;
              label: string;
              questionId: Id<"questions">;
            }>;
            questions: Array<{
              _id: Id<"questions">;
              code: {
                assets: Array<{ alt?: string; name: string; url: string }>;
                files: Array<{ content: string; name: string }>;
                steps: Array<{
                  checks: Array<
                    | {
                        id: string;
                        label: string;
                        selector: string;
                        type: "exists";
                      }
                    | {
                        id: string;
                        label: string;
                        selector: string;
                        type: "not_exists";
                      }
                    | {
                        id: string;
                        label: string;
                        max?: number;
                        min?: number;
                        selector: string;
                        type: "count";
                      }
                    | {
                        caseSensitive?: boolean;
                        contains?: string;
                        equals?: string;
                        every?: boolean;
                        id: string;
                        label: string;
                        selector: string;
                        type: "text";
                      }
                    | {
                        attribute: string;
                        contains?: string;
                        equals?: string;
                        every?: boolean;
                        id: string;
                        label: string;
                        selector: string;
                        type: "attr";
                      }
                    | {
                        equals?: string;
                        every?: boolean;
                        id: string;
                        label: string;
                        oneOf?: Array<string>;
                        property: string;
                        selector: string;
                        type: "css";
                        viewport?: number;
                      }
                    | {
                        href: string;
                        id: string;
                        label: string;
                        type: "linked";
                      }
                  >;
                  hint?: string;
                  instructions: string;
                  title: string;
                }>;
              };
              points: number;
              prompt: string;
            }>;
            responses: Array<{
              autoScore?: number;
              checkResults?: Array<{ id: string; passed: boolean }>;
              files: Array<{ content: string; name: string }>;
              progress?: { passed: Array<string>; step: number };
              questionId: Id<"questions">;
              savedAt: number;
            }>;
            unsupported: number;
          };
        }
      | {
          assessment: {
            _id: Id<"assessments">;
            closesAt?: number;
            course: { _id: Id<"courses">; title: string };
            instructions?: string;
            kind: "task" | "quiz" | "midterm" | "final";
            questionCount: number;
            resultsVisibility: "hidden" | "score" | "full_after_close";
            state: "open" | "closed";
            title: string;
            totalPoints: number;
          };
          attempt: {
            attemptsUsed: number;
            autoSubmitted: boolean;
            feedback?: string;
            maxScore: number;
            number: number;
            pendingGrading: boolean;
            score?: number;
            startedAt: number;
            submittedAt?: number;
          };
          available: true;
          comments: Array<{
            _id: Id<"codeComments">;
            author: string;
            file: string;
            line: number;
            questionId: Id<"questions">;
            text: string;
          }>;
          kind: "quiz" | "midterm" | "final";
          note?: string;
          questions: Array<{
            _id: Id<"questions">;
            acceptedAnswers?: Array<string>;
            correctOptionIds?: Array<string>;
            explanation?: string;
            myAnswer?:
              | { optionId: string; type: "single" }
              | { optionIds: Array<string>; type: "multiple" }
              | { text: string; type: "short" }
              | { text: string; type: "essay" }
              | {
                  files: Array<{ content: string; name: string }>;
                  type: "code";
                };
            options?: Array<{ id: string; text: string }>;
            points: number;
            pointsEarned?: number;
            prompt: string;
            type: "single" | "multiple" | "short" | "essay" | "code";
          }>;
        }
    >;
    progress: FunctionReference<
      "query",
      "public",
      { client?: string; token: string },
      Array<{
        course: {
          _id: Id<"courses">;
          archived: boolean;
          lecturer: string;
          title: string;
        };
        work: Array<{
          _id: Id<"assessments">;
          closesAt?: number;
          finished: boolean;
          kind: "task" | "quiz" | "midterm" | "final";
          score?: number;
          state: "upcoming" | "open" | "closed";
          status: "not_started" | "in_progress" | "submitted";
          title: string;
          totalPoints: number;
          weekTitle?: string;
        }>;
      }>
    >;
    upNext: FunctionReference<
      "query",
      "public",
      { client?: string; token: string },
      Array<{
        _id: Id<"assessments">;
        closesAt?: number;
        courseId: Id<"courses">;
        courseTitle: string;
        kind: "task" | "quiz" | "midterm" | "final";
        playable: boolean;
        started: boolean;
        title: string;
      }>
    >;
    findInLessons: FunctionReference<
      "query",
      "public",
      { client?: string; query: string; token: string },
      Array<{
        course: { _id: Id<"courses">; title: string };
        lessonId: Id<"lessons">;
        snippet: string;
        title: string;
        weekTitle: string;
      }>
    >;
  };
  readingDocuments: {
    listForAgent: FunctionReference<
      "query",
      "public",
      { client?: string; token: string; weekId: Id<"weeks"> },
      Array<{ documentKey: string; linked: boolean; url?: string }>
    >;
    saveAsAgent: FunctionReference<
      "action",
      "public",
      {
        client?: string;
        content: string;
        documentKey: string;
        title: string;
        token: string;
        weekId: Id<"weeks">;
      },
      {
        documentId: string;
        documentKey: string;
        url: string;
        weekId: Id<"weeks">;
      }
    >;
  };
};
export type InternalApiType = {};
