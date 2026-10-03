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
        universityId: Id<"universities">;
        universityName: { en: string; ka: string };
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
        universityId: Id<"universities">;
        universityName: { en: string; ka: string };
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
        universityId?: Id<"universities">;
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
        universityId: Id<"universities">;
      },
      { inviteId: Id<"invites">; token: string }
    >;
    listForUniversity: FunctionReference<
      "query",
      "public",
      { universityId: Id<"universities"> },
      Array<{
        _creationTime: number;
        _id: Id<"invites">;
        acceptedAt?: number;
        email: string;
        expiresAt: number;
        revokedAt?: number;
        role: "lecturer" | "uni_admin";
        token?: string;
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
        universityName: { en: string; ka: string };
      }
    >;
    accept: FunctionReference<
      "mutation",
      "public",
      { token: string },
      { role: "lecturer" | "uni_admin"; universityId: Id<"universities"> }
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
        }>;
        description?: string;
        lecturer: string;
        semester?: string;
        title: string;
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
      { token: string },
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
      { token: string },
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
        universityId: Id<"universities">;
        universityName: { en: string; ka: string };
        updatedAt: number;
      }>
    >;
    getCourse: FunctionReference<
      "query",
      "public",
      { courseId: Id<"courses">; token: string },
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
        universityId: Id<"universities">;
        universityName: { en: string; ka: string };
        updatedAt: number;
      }
    >;
    createCourseAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        description?: string;
        locale?: "ka" | "en";
        semester?: string;
        title: string;
        token: string;
        universityId?: Id<"universities">;
      },
      Id<"courses">
    >;
    getAssessment: FunctionReference<
      "query",
      "public",
      { assessmentId: Id<"assessments">; token: string },
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
      }
    >;
    createAssessmentAsAgent: FunctionReference<
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
        token: string;
      },
      Id<"assessments">
    >;
    updateAssessmentAsAgent: FunctionReference<
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
        token: string;
      },
      null
    >;
    addQuestionsAsAgent: FunctionReference<
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
        token: string;
      },
      Array<Id<"questions">>
    >;
    updateQuestionAsAgent: FunctionReference<
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
        token: string;
      },
      null
    >;
    deleteQuestionAsAgent: FunctionReference<
      "mutation",
      "public",
      { questionId: Id<"questions">; token: string },
      null
    >;
    reorderQuestionsAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        assessmentId: Id<"assessments">;
        questionIds: Array<Id<"questions">>;
        token: string;
      },
      null
    >;
    checkCodeTask: FunctionReference<
      "query",
      "public",
      {
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
          universityId: Id<"universities">;
          universityName: { en: string; ka: string };
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
        faculty: string;
        firstName: string;
        group: string;
        honestyVersion: number;
        lastName: string;
        locale: "ka" | "en";
        studentNumber?: string;
        universityId: Id<"universities">;
        year: number;
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
        items: Array<{
          _creationTime: number;
          _id: Id<"notifications">;
          assessmentKind: "task" | "quiz" | "midterm" | "final";
          courseId: Id<"courses">;
          courseTitle: string;
          dueAt?: number;
          href: string;
          kind: "published" | "due_24h" | "due_1h";
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
  };
};
export type InternalApiType = {};
