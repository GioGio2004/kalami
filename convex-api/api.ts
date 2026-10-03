import { type FunctionReference, anyApi } from "convex/server";
import { type GenericId as Id } from "convex/values";

export const api: PublicApiType = anyApi as unknown as PublicApiType;
export const internal: InternalApiType = anyApi as unknown as InternalApiType;

export type PublicApiType = {
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
  assessments: {
    create: FunctionReference<
      "mutation",
      "public",
      {
        courseId: Id<"courses">;
        instructions?: string;
        kind: "quiz" | "midterm" | "final";
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
          kind: "quiz" | "midterm" | "final";
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
            | { rubric?: string; type: "essay" };
          options?: Array<{ id: string; text: string }>;
          order: number;
          points: number;
          prompt: string;
          type: "single" | "multiple" | "short" | "essay";
        }>;
      }
    >;
    update: FunctionReference<
      "mutation",
      "public",
      {
        assessmentId: Id<"assessments">;
        instructions?: string;
        kind?: "quiz" | "midterm" | "final";
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
        };
        createdVia: "web" | "mcp";
        description?: string;
        joinCode: string;
        joinEnabled: boolean;
        locale: "ka" | "en";
        role: "owner" | "assistant" | "admin" | "super_admin";
        semester?: string;
        status: "draft" | "published" | "archived";
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
          kind: "quiz" | "midterm" | "final";
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
        };
        createdVia: "web" | "mcp";
        description?: string;
        joinCode: string;
        joinEnabled: boolean;
        locale: "ka" | "en";
        role: "owner" | "assistant" | "admin" | "super_admin";
        semester?: string;
        status: "draft" | "published" | "archived";
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
        };
        createdVia: "web" | "mcp";
        description?: string;
        joinCode: string;
        joinEnabled: boolean;
        locale: "ka" | "en";
        role: "owner" | "assistant" | "admin" | "super_admin";
        semester?: string;
        status: "draft" | "published" | "archived";
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
          kind: "quiz" | "midterm" | "final";
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
        };
        createdVia: "web" | "mcp";
        description?: string;
        joinCode: string;
        joinEnabled: boolean;
        locale: "ka" | "en";
        role: "owner" | "assistant" | "admin" | "super_admin";
        semester?: string;
        status: "draft" | "published" | "archived";
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
          kind: "quiz" | "midterm" | "final";
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
            | { rubric?: string; type: "essay" };
          options?: Array<{ id: string; text: string }>;
          order: number;
          points: number;
          prompt: string;
          type: "single" | "multiple" | "short" | "essay";
        }>;
      }
    >;
    createAssessmentAsAgent: FunctionReference<
      "mutation",
      "public",
      {
        courseId: Id<"courses">;
        instructions?: string;
        kind: "quiz" | "midterm" | "final";
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
        kind?: "quiz" | "midterm" | "final";
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
  };
  mcpTokens: {
    list: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      Array<{
        _creationTime: number;
        _id: Id<"mcpTokens">;
        lastUsedAt?: number;
        name: string;
        prefix: string;
        revokedAt?: number;
      }>
    >;
    create: FunctionReference<
      "mutation",
      "public",
      { name: string },
      { token: string; tokenId: Id<"mcpTokens"> }
    >;
    revoke: FunctionReference<
      "mutation",
      "public",
      { tokenId: Id<"mcpTokens"> },
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
};
export type InternalApiType = {};
