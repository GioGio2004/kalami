# Project task backlog

Use this file to record problems, agree on the intended behavior, and track implementation and user testing. Keep completed tasks here as a history. Give each new task the next unused ID; never renumber existing tasks.

## Workflow

Statuses: `Needs clarification` → `Ready` → `In progress` → `Ready for review` → `Done`. Use `Blocked` when an implementation cannot continue, and record the reason.

- Record new findings immediately. Ideas with unresolved behavior stay `Needs clarification`.
- Implement only tasks marked `Ready`, in queue order unless the user specifies an ID. Work on one task at a time. If none are ready, report that instead of starting an unapproved idea.
- Before editing, mark the task `In progress` and record the implementing agent as owner. Check current changes and project instructions; preserve other work.
- Keep the change within the task's agreed scope. Record newly discovered issues as separate tasks.
- After implementation, record what changed, relevant file paths, actual checks and their results, and any remaining limitations. Do not claim checks that were not run.
- Mark the task `Ready for review` when implementation and applicable checks are complete. The user tests the result and confirms `Done`; implementation alone is not completion.
- If user testing finds a problem, return the task to `Ready` with reproduction details. Preserve earlier implementation notes.
- Update this file after each task. Do not start the next task unless the user's instruction authorizes continuing through the queue.

## Queue

| ID | Task | Status | Owner |
| --- | --- | --- | --- |
| TASK-001 | Admin-managed shared groups and lecturer group search | Ready for review | Claude (Claude Code) |
| TASK-002 | Show lessons as slides: one block per page | Ready for review | Claude (Claude Code) |
| TASK-003 | Video embed console warning (`allow` vs `allowfullscreen`) | Ready for review | Claude (Claude Code) |
| TASK-004 | Super admin: invite lecturers with a university picker and one invite list | Ready for review | Claude (Claude Code) |
| TASK-005 | Admin page cards widen the page on phones until they slide in | Needs clarification | Unassigned |
| TASK-006 | Staff invites emailed through Resend; professional email design | Ready for review | Claude (Claude Code) |
| TASK-007 | Super admin: find people by email and change their staff role | Ready for review | Claude (Claude Code) |
| TASK-008 | Standalone admin panel at `/admin`: own sidebar, student and lecturer stats, status controls for everything | Ready for review | Claude (Claude Code) |
| TASK-009 | High-end lesson presentation: roomy slides, real code windows, full-screen presenter, polished student lesson page | Ready for review | Claude (Claude Code) |
| TASK-010 | Student app as a PWA: installable, offline-aware, Web Push notifications end to end, install prompts | Ready for review | Claude (Claude Code) |
| TASK-011 | Read-only MCP connector for students: study their courses, lessons, materials and finished work with their own AI | Ready for review | Claude (Claude Code) |
| TASK-012 | Staff `/agents` page: the Copy button covers the connector address on phones | Ready | Unassigned |
| TASK-013 | Notification center in the admin panel: messages to anyone, groups, courses and whole audiences by bell, push and email | Ready for review | Claude (Claude Code) |
| TASK-014 | Notification center: message any email addresses, with or without an account, and turn a message into personal group invitations | Ready for review | Claude (Claude Code) |
| TASK-015 | Animated scenes in lessons: a `scene` block agents build from a validated vocabulary, played with GSAP | Ready for review | Claude (Claude Code) |
| TASK-016 | Presentations: their own item in a week, typed slides in curated themes, a GSAP player, an editor and agent tools | Ready for review | Claude (Claude Code) |
| TASK-017 | Presentations: reorder and move between weeks; the student study assistant can open and search them | Ready for review | Claude (Claude Code) |
| TASK-018 | Presentation files: export one presentation as a .kalami file and import it into any week, on any Kalami | Ready for review | Claude (Claude Code) |
| TASK-019 | Presentation share links: a public link anyone can watch a presentation with, no account needed | Ready for review | Claude (Claude Code) |

Keep the queue and the task details consistent when changing status or owner.

## TASK-001 — Admin-managed shared groups and lecturer group search

- **Status:** Ready for review (behavior agreed 2026-10-05; implemented the same day)
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-05

### Problem

Lecturers currently create groups independently. The same student group may have 5–10 lecturers, resulting in duplicate groups and inconsistent names.

### Requested behavior

- Move group creation to admins.
- Allow multiple lecturers to work with the same group.
- Give lecturers a search field to find their groups.

### Decided by the user (2026-10-05)

- **Only admins create groups.** Lecturers cannot create them, in the UI or through the backend.
- **Lecturers find groups and join them themselves** (search, then Join; no admin assignment needed). Purpose: one group per real student group, so 5–10 lecturers stop creating duplicates.
- Implied by the above: a group is a **fixed student cohort** shared by every lecturer who teaches it, not one course's enrollment. Each lecturer shares their own courses with it.

### Current model (inspected 2026-10-05, staff repo)

- `groups` has one `ownerId` (the lecturer who made it) and **no university**. Only the owner (or the super admin) can manage it: rename, archive, invite link, email invites, remove students, share courses (`requireGroupManager` in `convex/model/groups.ts`).
- `groups.create` only requires a staff account (`requireStaffActor`), rate-limited to 20/hour, so any lecturer can create groups today. The Groups page shows the create button to all staff. The MCP connector has no group tools.
- Students join by the group link or an email invite (`groupMembers`); sharing a course with a group (`courseGroups`) enrolls every member, now and later.
- Data: the dev deployment `glad-mockingbird-933` has **0 groups and 0 course links**, so nothing to migrate there. Production was not inspected.

### Proposed approach (awaiting confirmation of the open points)

- Groups get a `universityId`. A university admin creates groups for their university; the super admin for any university. Group names are unique per university (case-insensitive), so admins can't create duplicates either.
- Lecturers get a "My groups" page with a search field over their university's groups, each with **Join**; joined groups show first. Clear empty and no-match states. A new `groupLecturers` table records who joined (replacing the single `ownerId` for teaching purposes).
- A joined lecturer can share and unshare **their own** courses with the group and leave it. They see the group's name and student count, never other lecturers' courses, materials or results.
- Admins manage the group itself: rename, archive/delete, students (link, email invites, removal), and lecturers (remove a lecturer).
- Migration: if any lecturer-owned groups exist when this ships, each becomes a group in its owner's university with the owner joined as a lecturer, keeping its students and course links. Production must be inspected first.

### Answered by the user (2026-10-05)

- **Search scope:** a lecturer finds and joins only groups of their own university.
- **Students:** admins manage students (link, email invites, removal). Joined lecturers can see and share the group's join link (e.g. show it in class) but can't change it or remove students.
- **Lecturers without a university** (private tutors, school teachers) keep creating their own private groups, which only they manage and nobody else can find (no one to duplicate with).
- **Leaving:** when a lecturer leaves a group, their courses are unshared from it automatically; students keep a course only if they joined it another way.

The proposed approach above stands with these answers.

### Acceptance criteria

Ticked = verified by Claude on 2026-10-05 (backend tests and dev-gallery checks, see notes); unticked = needs production or the user.

- [x] University admins create groups for their university and the super admin for any university; lecturers at a university cannot create groups through either the UI or backend operations. Lecturers without a university can still create private groups.
- [x] Group names are unique per university (case-insensitive), so admins can't create duplicates.
- [x] One group supports multiple lecturers without duplicating student membership.
- [x] Lecturer search returns only non-archived groups of the lecturer's own university (never another university's, never tutors' private groups), with clear empty and no-match states; Join and Leave work.
- [x] A joined lecturer can share/unshare only their own courses with the group and can see and copy its join link, but cannot rename/archive it, change the link, invite by email or remove students. Leaving unshares their courses.
- [x] Sharing a group does not grant unintended access to other lecturers' content or student results.
- [x] Admins can rename, archive, manage students and remove lecturers for their university's groups only.
- [x] Students' join flows (link, email invite) keep working; what students see about a group doesn't show an admin as their "teacher".
- [ ] Existing groups and related data are handled according to the agreed migration plan (dev has none; production checked before deploying). *(Migration built, tested and run on dev; production still to run after deploying.)*
- [x] Admin and lecturer flows have been checked, including unauthorized access attempts. *(Backend tests and gallery screens; no signed-in live sessions.)*
- [ ] The user has tested and accepted the behavior.

### Implementation and verification notes

2026-10-05: implementation was first requested while the decisions above were open, so it was not started then. After the user answered them, Claude (Claude Code) implemented it the same day.

**What changed (staff repo `kalami-stuff`, which owns the backend):**

- Schema (`convex/schema.ts`): `groups` gains optional `universityId` (absent = an independent teacher's private group) and `nameKey` (lowercased, spaces squeezed) with index `by_universityId_and_nameKey`; new table `groupLecturers` (`groupId`, `userId`, `joinedAt`; indexes `by_userId`, `by_groupId_and_userId`) records who teaches a group. `ownerId` now means "who made it".
- Rules (`convex/model/groups.ts`, rewritten):
  - **Run a group** (rename, archive, invite link, email invites, remove students, take lecturers off): the super admin and the admins of the group's university; for a private group, its owner. Groups not yet migrated still count their owner, so nothing breaks before the migration runs.
  - **Create**: with `universityId` only by that university's admin or the super admin, with names unique per university (case and spacing ignored, also on rename, archived groups included). Without a university only an independent teacher (no staff membership at any university) or the super admin; the owner of a private group also teaches it. A university lecturer gets FORBIDDEN: "Your university's admins make the groups… Find yours under Groups and join it."
  - **Search** (`groups.search`): non-archived groups of the universities the person teaches at, name contains the query, max 50, by name; never other universities' groups or private groups.
  - **Join / leave** (`groups.joinAsLecturer`, `groups.leaveAsLecturer`): join only own-university, non-archived groups (idempotent, max 50 lecturers); leaving unshares the courses the lecturer owns or shared there (students keep a course only if enrolled another way); a private group's owner can't leave it.
  - **Teaching a group**: share/unshare your own courses, see and copy its invite link; see your own courses in it plus a count of other lecturers' courses (no titles), the student count but no student list, no invites, no lecturer list.
  - **Admins**: `groups.forUniversity` lists a university's groups (incl. archived) with student/lecturer/course counts; `groups.removeLecturer` takes a lecturer off (their courses leave too).
  - **Students**: what students see as a group's "teacher" is now the university's name in the student's language (or the teacher's name for a private group); a personal email invite shows the person who sent it. Students can message the lecturers who teach their groups (not the admin who made them) (`convex/model/messages.ts`).
  - **Deleted accounts** (`convex/users.ts`): a deleted lecturer stops teaching all groups (courses stay with students); only private groups are closed when their owner is deleted, university groups carry on.
  - **Migration** `groups:migrateToUniversityGroups` (internal, paged, idempotent): old groups move to their owner's university with the owner kept as a lecturer; owners without a university get a private group; reports name clashes. Documented in `OPERATIONS.md`.
- Public API (`convex/groups.ts`): `create` takes optional `universityId`; new `forUniversity`, `search`, `joinAsLecturer`, `leaveAsLecturer`, `removeLecturer`; `get` returns `manages`/`teaches`/`isPrivate`, `otherCourses`, `lecturers`, `universityName`, `lecturerList`.
- UI:
  - Groups page (`app/(staff)/groups/page.tsx`, `components/groups/GroupsDashboard.tsx`): university lecturers see "My groups" and "Find your group" (search box, results with student/lecturer counts and Join or "You teach it"), with empty ("Your university has no groups yet…") and no-match states; independent teachers keep "New group" for private groups; the super admin is pointed to the admin page; admins get a "Manage groups" link.
  - Group page (`components/groups/GroupView.tsx`, `app/(staff)/groups/[groupId]/page.tsx`): whoever runs the group gets the full page plus a Lecturers section with "Take off…"; a lecturer who teaches it gets the link (copy only), "Your courses", a students note and "Leave group…" with a confirmation explaining that their courses leave too.
  - Admin page: each university section gets a Groups panel (`components/admin/GroupsBoard.tsx`, `UniversityGroups.tsx`, `AdminView.tsx`, `app/(staff)/admin/page.tsx`): create a group (name + note "Helps lecturers pick the right group") and a filterable list with counts and Open.
  - Course page Groups card (`components/studio/CourseGroups.tsx`): offers the groups the lecturer teaches; the empty hint now says "Find your group under Groups and join it".
  - Dev gallery (`components/dev/StaffGallery.tsx`): new views `groups-independent`, `groups-admin`, `group-admin`; samples updated.
- Tests: `convex/groups.test.ts` rewritten and extended (admins create, lecturers can't; unique names incl. rename; other university's admin refused; search scope/empty/no-match; join/leave; teaching view hides students and colleagues' courses and can't run the group; leaving and removal unshare; private groups; students' host names; messaging; deleted accounts; migration incl. name clashes and re-run); `convex/courseDelete.test.ts` and `convex/messages.test.ts` updated to admin-made groups.
- Student repo (`kalami`): `convex-api/api.ts` regenerated with `npm run api:student`. No student UI change was needed: the "teacher" strings the dashboard and join pages show now come from the server as described.

**Checks run (2026-10-05):**

- `kalami-stuff`: `npx tsc --noEmit` ✅, `npm run lint` ✅, `npx vitest run` ✅ 19 files / 201 tests.
- `kalami`: `npx tsc --noEmit` ✅ against the regenerated API.
- Deployed to the **dev** deployment `glad-mockingbird-933` with `npx convex dev --once` ✅; ran `npx convex run groups:migrateToUniversityGroups '{"cursor":null}'` on dev → `{ moved: 0, madePrivate: 0, nameClashes: 0, isDone: true }` (dev had no groups).
- Browser, staff dev gallery at 1440 and 375 wide: `groups` (my groups + search with Join / "You teach it"), `groups-empty` (no-match message), `groups-independent`, `groups-admin`, `group` (lecturer view: only Leave and Copy link, own course + "Other lecturers share 2 more"), `group-admin` (full controls, Lecturers with "Take off…", back link to Admin), the leave confirmation, the admin page's Groups panel, and the course page's Groups card. No page-level horizontal overflow on the group screens; no console errors from them.

**Limitations / not verified:**

- No signed-in browser testing: real admin, lecturer and student sessions weren't available, so the flows were verified by the backend tests and the gallery's sample data, not by clicking through the live app.
- Production was not inspected or changed. Before deploying to production: deploy the backend, then run the migration with `--prod` and rename any reported name clashes.
- Found during verification, not caused by this task: the admin page's existing "Add a university" and "Invites" cards slide in from the right on scroll and widen the page by ~32px on phones until revealed (TASK-005). The dev gallery's existing sample dates cause a dev-only hydration warning on the course view.

### User review

Pending. Suggested test: as super admin, create a group under a university on the Admin page; as a lecturer of that university, find it under Groups, join, share a course, open its link as a student; then leave as the lecturer and check the student lost the course.

## TASK-002 — Show lessons as slides: one block per page

- **Status:** Ready for review
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-05
- **Scope:** Staff preview, editor preview integration, and student lesson reader across both repositories.

### Problem / reproduction

The user showed the staff Edit and Preview screens for "HTML document structure" (12 blocks). Preview stacks every block into a long, narrow document. Edit displays a long list of forms beside a small scrolling preview. The user wants the student-facing experience to be the priority: each existing block should become one presentation page, with one slide visible at a time.

Reference route on the staff app: `http://localhost:3101/courses/jx793qwdgy787mczdf9qvbvm7s8fpm93/lessons/nx7ehk295jakybxy0p20jbekad8fp5rt`.

User-provided screenshots (local files):

- Preview: `C:/Users/khvic/Downloads/localhost_3101_courses_jx793qwdgy787mczdf9qvbvm7s8fpm93_lessons_nx7ehk295jakybxy0p20jbekad8fp5rt (1).png`
- Edit: `C:/Users/khvic/Downloads/localhost_3101_courses_jx793qwdgy787mczdf9qvbvm7s8fpm93_lessons_nx7ehk295jakybxy0p20jbekad8fp5rt (2).png`

### Investigation findings

Source inspection and the supplied screenshots support the following; no authenticated browser test was performed for this investigation.

- **Staff source repository:** `C:/Users/khvic/Desktop/kalami-stuff`. **Student repository:** `C:/Users/khvic/Desktop/kalami` (this backlog lives here). Claude must work across both repositories for this task.
- Staff `components/lessons-editor/LessonEditor.tsx` owns Edit/Preview, the sidebar's "Lesson / This block" switch, draft selection, and the floating `SaveBar`. Full Preview renders `readyBlocks` in a `max-w-[720px]` article. The sidebar has a separate scrolling preview path. Update both paths, not just full Preview. Ensure save controls never obscure slide content or navigation.
- Staff `components/lessons/LessonBlocks.tsx` is the shared renderer. `LessonBlocks` maps all blocks into a vertical `space-y-6` list; exported `Block` renders an individual block. It already supports text, callout, code with optional sandboxed HTML/CSS output, image, video, steps, and quick check.
- `Steps` and `Check` currently keep interaction state locally with `useState`. Simply swapping a single mounted block can lose answers/progress or leak state between two blocks of the same type. Preserve state by stable block identity while navigating within a lesson; reset appropriately when content changes. Off-screen content must not remain keyboard-focusable, and hidden videos must not keep playing.
- Staff `components/lessons/types.ts` defines the existing ordered blocks and their IDs. `components/lessons-editor/draft.ts` supplies stable draft keys, conversion, and incomplete-block handling. Full Preview currently omits unfinished blocks and reports their count. Keep unfinished blocks visible as explanatory placeholders in the editing preview; full Preview may retain the explicit omission notice and count only renderable slides.
- Student `components/lessons-reader/LessonView.tsx` wraps the renderer with the course/week/title, estimated reading time, scroll-based `ReadingProgress`, and previous/next lesson links. Its layout must change too: replace scroll-based progress with slide progress, compact the header so the slide is prominent, and distinguish slide navigation from lesson navigation. Preserve back-to-course and contact actions.
- Student `app/(student)/courses/[courseId]/lessons/[lessonId]/page.tsx` reads `api.lessons.read` and handles loading/unavailable lessons. Preserve that access and publication behavior.
- **Shared source of truth is the staff repo.** `kalami-stuff/scripts/sync-student.mjs` copies `components/lessons` to the student repo, but also deletes/replaces the sandbox and checks directories. Inspect both working trees before syncing; use a scoped lesson-only sync if necessary to avoid overwriting unrelated ongoing work. Do not fix only the student copy and have it overwritten later.
- Student `components/dev/sampleLessons.ts` and `components/dev/StudentGallery.tsx` provide existing lesson fixtures/gallery entry points that may help visual verification; they do not replace authenticated testing.

### Requested behavior and implementation scope

- Render **one existing block per slide**, in existing order. The example lesson becomes 12 slides. A code block and its live output remain together; a steps block with all of its internal steps remains one slide. Do not split Markdown headings into additional slides or add a title-only slide.
- Make slides the default lesson presentation in student reading and staff full Preview. Use a shared slide player in the staff-owned `components/lessons` directory so rendering and navigation stay consistent across apps.
- Provide clearly labeled Previous/Next slide controls and a visible "Slide X of N" indicator. Disable navigation at boundaries; do not wrap or automatically advance. Keep controls reachable without scrolling through the entire lesson.
- Support keyboard navigation when the slide player has focus, without intercepting typing, quiz controls, embedded content, or editor shortcuts. Use accessible labels, focus indication, slide-change announcements, and reduced-motion support. Hidden slides must not be announced as visible content.
- Give the slide the main visual area, with readable typography and spacing consistent with Kalami. Adapt to desktop and phones; do not force a fixed aspect ratio that clips content or shrinks text. Long blocks may scroll within the current slide; code may scroll horizontally without overflowing the page. Images, videos, and code/output layouts must fit their available container, including the narrow editor preview.
- Retain current quiz checking, explanations, code copy, sandbox restrictions, and step reveal behavior. These remain ungraded lesson interactions; navigation must not require a correct answer. Preserve answers/results and revealed steps when navigating away and back during the same lesson session. Cross-refresh persistence is outside this task.
- Keep existing block authoring, saving, publishing, duplication, removal, and reordering. Make the selected block's slide easy to inspect in the editor preview, using draft keys rather than array indices for identity. Handle deleting/reordering the active block without a blank or out-of-range slide. A full editor redesign is not required for this task.
- Preserve draft/unsaved/unfinished-block messages and read-only permissions. Use the same slide presentation for the saved content students see and the renderable draft content lecturers preview.
- Derive slides from current blocks: no content migration or new backend slide model is expected. Do not change assessment/exam players. Fullscreen presenter mode, slide export, speaker notes, and new authoring tools are separate future work.

### Acceptance criteria and verification

Ticked = verified by Claude on 2026-10-05 (details in the notes below); unticked = only partly verified or needs the user.

- [ ] A lesson containing 12 valid blocks shows 12 navigable slides in both staff full Preview and the student reader, in the same order. *(Verified with gallery fixtures of 15 and 9 blocks, one slide per block in order; the real 12-block lesson needs an authenticated check.)*
- [x] All seven block types render correctly; single-answer, multiple-answer, and short-answer quick checks still work.
- [x] Answers/results and step progress survive forward/back navigation and never transfer to a different block. Leaving a video slide stops its playback.
- [x] Empty and one-block lessons, first/last slides, long text/code, and missing or unfinished draft content have usable states and accurate counts.
- [x] Editing, selecting, adding, duplicating, reordering, deleting, and saving blocks keep preview selection valid; unsaved changes are represented accurately.
- [x] Desktop and mobile layouts are checked visually. No clipped content, page-level horizontal overflow, or SaveBar/navigation overlap. Check the narrow editor preview as well as full Preview.
- [ ] Keyboard-only use, input/quiz interaction, focus visibility, slide announcements, and reduced motion are checked. *(All checked in the browser except reduced motion, which was code-reviewed only.)*
- [ ] Staff preview and actual published student reading are both verified; draft/unavailable lessons remain inaccessible to unauthorized students. Record unavailable credentials or other testing limitations explicitly. *(No signed-in sessions available; see Limitations.)*
- [ ] Existing lesson/course navigation, publication, and saving still work. No unintended changes to assessment players or backend content. *(No assessment-player or backend changes; saving checked against the gallery mock; publishing not exercised.)*
- [x] Run appropriate lint/type/build checks in both affected repositories and focused behavioral tests for slide navigation/state retention. Record actual commands and results; follow each repository's instructions and read relevant bundled Next.js guides before coding.
- [x] Shared lesson files are consistent across repositories without overwriting unrelated work.
- [ ] User has tested and accepted the result before status becomes `Done`.

### Implementation and verification notes

Investigation (before implementation): read staff editor, draft model, shared renderer/types and sync script, plus student reader, route, and fixture references.

**Implementation — 2026-10-05, Claude (Claude Code).**

How it works:

- New shared slide player `LessonSlides` (staff-owned `components/lessons`, copied to the student app). One existing block = one slide, in order; nothing is split or added. Previous/Next slide buttons (disabled at the ends, no wrap, no auto-advance) and a visible "Slide X of N" with a progress bar sit in a bar under the slide that stays pinned to the bottom of the screen while a long slide scrolls, so the controls never require scrolling through the slide. ← / → move between slides while focus is in the player, except in fields, quiz options, menus/tabs, embedded frames, sideways-scrolling code, or with any modifier key (Alt+← stays browser Back, Ctrl/⌘ combos stay with the editor). Slide changes are announced in a polite live region ("Slide 3 of 12"); if focus was inside the slide that left (or on a button that just became disabled) it moves to the new slide, which has a visible focus ring.
- State: a slide mounts the first time it's shown and then stays mounted but `hidden` (display none: not focusable, not announced), keyed by block id, so check answers/results and revealed steps survive back-and-forth navigation and never pass to another block. Quick checks restart when their answer key changes and steps when their count changes (rewording keeps state). Video slides are unmounted when left, which stops playback. Persistence ends with the page (cross-refresh is out of scope).
- Motion: the new slide fades/slides in from the side it came from; with reduced motion there is no movement (`useReducedMotion` plus the apps' `MotionConfig reducedMotion="user"`), the progress bar doesn't animate, and scrolling is instant.
- Layout: the slide card takes the main area (min height, content centred, no fixed aspect ratio). Code + live output sit side by side only when the block itself is ≥ 42rem wide (container query instead of window width), so they stack in the editor's narrow preview and on phones; code scrolls sideways inside its own box; images are capped at 70% of the screen height.
- Student reader (`LessonView`): compact header (breadcrumb, smaller title, "N slides · about M min"), then the slides; the scroll-based reading-progress bar is gone (the slide bar shows progress). Lesson navigation stays below, labelled "Previous lesson"/"Next lesson" in an "Other lessons" nav, with Back to course and the contact card unchanged. The route, `api.lessons.read` and the not-available screen are unchanged.
- Staff editor (`LessonEditor`): full Preview is the slide player over the renderable blocks (wider article), still with "Previewing your unsaved changes" and a notice "N unfinished blocks aren't shown: X slides of Y blocks". The side preview (wide screens) is the same player in compact form over **all** blocks, unfinished ones shown as explanatory placeholders so slide numbers match block numbers. Both follow the selected block by draft key, and stepping through the preview selects the matching block; deleting or reordering the active block keeps a valid slide (the neighbour, never blank or out of range). The old "Lesson / This block" switch was removed because the slide preview now shows the selected block on its own. The floating SaveBar now floats only over the blocks column in Edit (so it can't cover the preview) and is not floating in Preview (so it can't cover the slide bar).
- The old vertical `LessonBlocks` list and its scroll-in animation were removed (no remaining users); `Block` is unchanged apart from the code/image layout above. No backend, content-model, assessment-player or publishing changes.

Changed files:

- `kalami-stuff/components/lessons/LessonSlides.tsx` (new), `slides.ts` (new: slide resolution, state identity, key filtering), `slides.test.ts` (new, staff only), `LessonBlocks.tsx`
- `kalami-stuff/components/lessons-editor/LessonEditor.tsx`
- `kalami/components/lessons/{LessonSlides.tsx, slides.ts, LessonBlocks.tsx}` (synced copies), `kalami/components/lessons-reader/LessonView.tsx`

Sync: both working trees were checked first (the student copy of `components/lessons` had no local edits; sandbox/checks copies matched apart from test files). Only `components/lessons` was copied (tests excluded), not the full `sync-student.mjs`; afterwards `diff -rq --exclude='*.test.ts'` reports the two folders identical. Unrelated in-progress work in both trees (student landing page files, `CLAUDE.md`; staff course-outline/dashboard changes from earlier today) was left untouched.

Checks run (2026-10-05):

- `kalami-stuff`: `npx tsc --noEmit` ✅, `npm run lint` ✅, `npx vitest run` ✅ 19 files / 192 tests (includes 16 new slide tests: deleted/reordered active block, out-of-range fallback, state keys never shared between blocks and reset on answer-key changes, arrow keys ignored in inputs/radios/menus/tabs/iframes/wide code and with modifiers).
- `kalami`: `npx tsc --noEmit` ✅, `npm run lint` ✅ (the student repo has no test runner).
- Production builds: `npm run build` ✅ in `kalami-stuff` and ✅ in `kalami` (run alongside the running dev servers, which Next 16 supports via the separate `.next/dev` output). The student build includes other uncommitted work in that tree.
- Browser, student dev gallery (`localhost:3100/dev/ui?view=lesson`, 15 blocks): 15 slides in order, exactly one visible each time; all 7 block types rendered; Next disabled on slide 15, Previous on slide 1; single, multiple and short-answer checks gave right/wrong results with explanation, and answers + results were still there after leaving and coming back; a revealed step survived navigation; the video iframe existed only while its slide was shown. Keyboard: → from the focused slide moved on, kept focus in the player and announced "Slide 13 of 15"; → on a quiz radio and ← in the short-answer field did not change slide (caret moved); Enter on Next onto the last slide moved focus to the slide instead of losing it; focus ring visible after keyboard use. `lesson-last` (4 slides, latest-lesson card, Back to course) and `lesson-not-found` unchanged. 1440×900 and 375×812: no page-level horizontal overflow, code scrolls inside its box, code/output stacked on phones; button text labels show from 320px of player width (icon + accessible name below that).
- Browser, staff dev gallery (`localhost:3101/dev/ui?view=lesson-editor` / `lesson-preview`, 9 blocks): side preview 9 slides; clicking block 6 showed slide 6; stepping the preview selected the matching block; duplicate → slide 7 of 10 selected; move up → followed to 6 of 10; deleting the selected copy → neighbour 6 of 9 (and "unsaved changes" correctly cleared, since content matched the saved version again); deleting the last block while shown → 8 of 8; adding an empty Text block → its placeholder slide "Empty text block"; full Preview → "8 slides of 9 blocks" notice and 8 slides; Save from Preview kept the slide position; one block → "Slide 1 of 1" with both buttons disabled; no blocks → "Nothing to read yet." in both previews. SaveBar (x 222–670) and side preview (from x 827) no longer overlap at 1440 wide; in Preview the SaveBar is in the page flow. 375 wide: all 9 preview slides without overflow. No console errors after a marked reload (only the existing video-iframe `allow`/`allowfullscreen` warning, see TASK-003).

Limitations / not verified:

- No authenticated testing: the real "HTML document structure" lesson (12 blocks) on the reference staff route and a real published lesson in the student app were not opened, because the in-app browser has no signed-in lecturer/student session. Verified only with the dev-gallery fixtures (same components, sample data). Access/publication behaviour was not re-tested; the student route, `api.lessons.read` and all Convex code are unchanged.
- Reduced motion was checked by code review only (the browser tool can't emulate `prefers-reduced-motion`).
- Real touch devices and screen readers (NVDA/VoiceOver) were not used; announcements were checked through the live region's text.
- Publishing from the editor was not exercised (the gallery mocks the backend); saving was exercised against the mock.

### User review

Pending. Suggested test: open "HTML document structure" in the staff editor (Edit and Preview), then the same lesson as a student after publishing; try a quick check, steps, a video, and keyboard ← / →.

## TASK-003 — Video embed console warning (`allow` vs `allowfullscreen`)

- **Status:** Ready for review (approved 2026-10-05 when the user asked to finish all tasks)
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-05 (found while verifying TASK-002)

### Problem / reproduction

Opening a lesson slide with a YouTube/Vimeo video logs the browser warning "Allow attribute will take precedence over 'allowfullscreen'." The shared `Video` renderer in `kalami-stuff/components/lessons/LessonBlocks.tsx` sets both `allow="…; fullscreen"` and `allowFullScreen`. Fullscreen works; it is console noise only. Pre-existing, not caused by TASK-002.

### Proposed approach

Drop the redundant `allowFullScreen` attribute (the `allow` list already grants fullscreen), sync `components/lessons` to the student app, and confirm the fullscreen button still works on YouTube and Vimeo. Low priority; mark `Ready` if wanted.

### Acceptance criteria

- [x] No `allowfullscreen` warning on video slides. *(Fullscreen permission kept via `allow`; YouTube's own fullscreen button wasn't clicked, see notes.)*
- [ ] User tested and accepted the result.

### Implementation and verification notes

2026-10-05, Claude (Claude Code):

- Removed the redundant `allowFullScreen` attribute from the two video iframes: the lesson renderer `kalami-stuff/components/lessons/LessonBlocks.tsx` (Video) and the editor's video preview `kalami-stuff/components/lessons-editor/BlockForms.tsx`. Both keep `allow="…; fullscreen"`, which is what grants fullscreen. Copied only `LessonBlocks.tsx` into `kalami/components/lessons/`; `diff -rq --exclude='*.test.ts'` reports the shared lesson folders identical.
- Checks: `npx tsc --noEmit` ✅ and `eslint` on the changed folders ✅ in both repos. Student dev gallery (`localhost:3100/dev/ui?view=lesson`): after a console marker, opened the video slide (11 of 15); the YouTube iframe mounted with `allow` containing `fullscreen` and no `allowfullscreen` attribute, and the "Allow attribute will take precedence over 'allowfullscreen'" warning no longer appears.
- Limitation: the fullscreen button inside YouTube's player (a cross-origin frame) wasn't clicked; per the browser's permissions policy the `fullscreen` entry in `allow` is what enables it.

### User review

Pending.

## TASK-004 — Super admin: invite lecturers with a university picker and one invite list

- **Status:** Ready for review
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-05 (requested by the user during TASK-001)

### Problem / reproduction

The user (super admin) wants to invite lecturers personally and assign each one to their university while inviting, so lecturers are sorted by university and easy to keep track of. Today this is possible but awkward: the staff app's Admin page (`kalami-stuff/components/admin/AdminView.tsx`) shows a separate "Invite someone" board inside each university's section (plus one for independent teachers), so the super admin has to find the right section first, and there's no single place to see who was invited to which university.

Backend support already exists: `invites.create` takes an optional `universityId` and a role (`lecturer` / `uni_admin`); accepting an invite gives the person that role in that university (`convex/invites.ts`, `invites` has `by_universityId`).

### Agreed behavior and scope

- At the top of the Admin page, the super admin gets one **Invite** form: email, **University** dropdown (every university, plus "No university (independent teacher)"), and role (Lecturer, or University admin when a university is picked). The invite link is created and copied as today.
- One **invite list** across all universities showing email, university, role and status (pending/accepted/expired/withdrawn), filterable by university, with Copy link and Withdraw for pending invites.
- University admins keep their current single-university board (no picker needed).
- Out of scope unless asked: moving an already-registered lecturer to another university, invite emails (links are still sent by hand).

### Acceptance criteria

- [x] The super admin can invite a lecturer to any university, or as an independent teacher, from one form; the accepted invite puts the lecturer in the chosen university.
- [x] The combined list shows every invite with its university and status, and can be filtered by university.
- [x] University admins still see and invite only for their own university; nobody else can use the picker.
- [ ] User tested and accepted the result.

### Implementation and verification notes

2026-10-05, Claude (Claude Code):

- Backend (`kalami-stuff/convex/invites.ts`): new query `invites.listAll`, super admin only (`requireSuperAdmin`): the 500 newest staff invites with their `universityId` and university name (none for an independent teacher); the link (`token`) only for pending invites. Creating still goes through the existing `invites.create`, which already takes the university per invite and makes the accepted person a member of it.
- UI: `components/admin/InviteCenter.tsx` (new): "Invite someone" with a **University** select (active universities + "No university: independent teacher"; nothing preselected, so an invite can't land in the wrong university by default), email and role (University admin only offered when a university is picked), and the copyable link once created ("Link ready for …, <university>"). "All invites" lists every invite with role · university · expiry and a status pill, Copy/Withdraw for pending ones, and a filter (every university / one university / independent teachers). `components/admin/SuperAdminInvites.tsx` wires it to `invites.listAll`/`create`/`revoke`. `AdminView.tsx` gets an `invites` slot above the universities; `app/(staff)/admin/page.tsx` shows it to the super admin instead of the per-university boards and the separate "Independent teachers" board. University admins keep their per-university board. `InvitesBoard.tsx` now exports its status helpers for reuse. Dev gallery: `admin` (super admin, two universities) and new `admin-uni`.
- Tests: new test in `convex/foundation.test.ts`: invites to two universities and one independent teacher from the super admin, `listAll` order and university names, accepting puts the lecturer in the invite's university, links disappear once accepted/withdrawn, and a university admin gets FORBIDDEN on `listAll`.

Checks run (2026-10-05): `kalami-stuff` `npx tsc --noEmit` ✅, `npm run lint` ✅, `npx vitest run` ✅ 19 files / 202 tests; deployed to dev `glad-mockingbird-933` with `npx convex dev --once` ✅; `npm run api:student` then `kalami` `npx tsc --noEmit` ✅ and `npm run lint` ✅. Browser, staff gallery `?view=admin` at 1440 and 375 wide: picker lists both universities and the independent option; submitting with no university is blocked by the required select; picking the independent option hides the role choice; creating for Tbilisi State showed "Link ready for new.lecturer@tsu.ge, Tbilisi State University"; the list shows each invite's university and status, and the filter narrowed it to Tbilisi State (2) and independent (1); only one invite form on the page. `?view=admin-uni`: the university admin's own board, no picker. The invite section fits 375 px.

Limitations: no signed-in super admin session in the browser (verified with the gallery's sample data and the backend test). The list shows the newest 500 invites. Moving an already-registered lecturer to another university remains out of scope.

### User review

Pending.

## TASK-005 — Admin page cards widen the page on phones until they slide in

- **Status:** Needs clarification
- **Owner:** Unassigned
- **Reported:** 2026-10-05 (found while verifying TASK-001)

### Problem / reproduction

Staff app, Admin page at 375 px wide (dev gallery `?view=admin`): the page measured 407 px wide (`scrollWidth`) against a 375 px viewport. The cause is the existing scroll-reveal animation: "Add a university" (`Enter kind="right"`) and the invite list (`RevealItem kind="right"`) start 56 px to the right with opacity 0 and only move into place when scrolled into view, so until then the page can be panned sideways on a phone. The new Groups panel is not affected (it doesn't animate). Measured in the in-app browser with its pane in the background, where animations may not run, so it should be confirmed on a real phone.

### Proposed approach

Clip horizontal overflow on the admin page's sections (or switch those reveals to a vertical slide on small screens), then re-check 375 px with no sideways scroll. Mark `Ready` if wanted.

### Acceptance criteria

- [ ] No sideways scrolling on the admin page at 375 px, before or after the cards slide in.
- [ ] User tested and accepted the result.

### Implementation and verification notes

Not started.

### User review

Pending.

## TASK-006 — Staff invites emailed through Resend; professional email design

- **Status:** Ready for review (requested by the user 2026-10-05)
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-05

### Problem / reproduction

On the staff Admin page, inviting a lecturer or university admin only creates a link: the page says "Send it yourself for now; invite emails come later", so the user ends up sending invitations some other way (the user described it as "via Clerk"; the code makes no Clerk invitation calls). The user wants Kalami to email the invitations itself through Resend, with the link in them, and wants Kalami's emails to look professional: they look "a little sloppy" now (one plain frame for everything; the group invite interleaves Georgian and English line by line; no fallback link).

Investigation: emails go through the `@convex-dev/resend` component (`kalami-stuff/convex/email.ts`, templates in `convex/lib/email/templates.ts`): group invites, assessment notifications, message notices. Staff invites (`convex/invites.ts`) send nothing. The dev deployment has no `RESEND_API_KEY`, `EMAIL_FROM`, `STAFF_APP_URL` or `STUDENT_APP_URL`, so nothing is emailed in dev today.

### Agreed behavior and scope

- Creating a staff invite (super admin's invite center or a university admin's board) emails the invitee a personal invitation through Resend with the invite link, the university and role, who invited them and when it expires. Re-inviting an open invite sends it again (not more than once per 10 minutes). Pending invites get a "Resend email" action. The admin page says whether it was emailed; when email isn't configured or the address bounced, it says so and the link can still be copied.
- One professional design for every Kalami email (staff invite, group invite, assessment notifications, message notices): brand header, headline, short text, key details as label/value rows, one clear button, the link written out as a fallback, tidy footer. Emails to people whose language isn't known (invites) are in Georgian, then English, as two clean sections instead of interleaved lines.
- Out of scope: Clerk's own sign-in/verification-code emails (configured in Clerk), changing who receives which notifications.

### Acceptance criteria

- [x] A new staff invite is emailed through Resend with a working personal link to the staff app's invite page; a resend works and is throttled; suppressed (bounced/complained) addresses aren't emailed. *(Verified in backend tests with the Resend component; no real send yet.)*
- [x] The admin page shows whether each invite was emailed and offers Resend; without email configured it says so and the link still works.
- [x] All Kalami emails share the new design, in HTML and plain text, with escaped content and correct language(s); they render well on desktop and phone widths.
- [x] Existing email behaviour (notifications, messages, group invites, unsubscribe, idempotency, bounce handling) still works.
- [ ] User tested and accepted the result (including a real send once `RESEND_API_KEY` is set).

### Implementation and verification notes

2026-10-05, Claude (Claude Code):

- **Sending** (`kalami-stuff/convex/email.ts`): new `sendStaffInviteEmail` (skips when `RESEND_API_KEY` is missing, in Resend test mode for non-test addresses, or for suppressed addresses; logs to `emailLog` so bounces are traced; reply-to is the inviting admin; idempotency key per invite and minute) and `staffInviteUrl` (`STAFF_APP_URL/invite/<token>`).
- **Invites** (`convex/invites.ts`, `convex/schema.ts`): `invites` gains `emailId`/`emailedAt`. `invites.create` emails the invitation and returns `email: "sent" | "recent" | "off"`; creating again for an open invite resends it unless it went out in the last 10 minutes. New `invites.resendEmail` (same rights as creating; refuses accepted/withdrawn invites; renews an expired invite's 14 days first; rate-limited with the `invite` limit). `listForUniversity` and `listAll` return `emailedAt`.
- **Design** (`convex/lib/email/templates.ts`, rewritten): one `renderEmail` layout for all emails (Kalami header, white card with a lime top line, eyebrow label, headline, paragraphs, label/value details panel, quoted message block, button, written-out fallback link, footer), inline-styled tables for email clients plus a small-screen media query, long words wrap, Georgian labels aren't uppercased (no Mtavruli). New `renderStaffInviteEmail` (role, university or "independent teacher", invited by, valid until in Tbilisi time, the address to sign in with). Group invites are now a Georgian section then an English section instead of interleaved lines. Notifications, staff message notices and student reply notices moved to the layout with the same copy (deadline as a detail row). Unsubscribe page restyled to match.
- **Admin UI**: `components/admin/InvitesBoard.tsx` (shared `CreatedInvite`, `InviteRowActions`, `emailedLine`; button "Send invitation"; result "Invitation emailed to …" / "Already emailed a few minutes ago…" / "Not emailed: email isn't set up… Send the link yourself" with the link to copy; rows "emailed <date>" / "not emailed" and Resend · Copy · Withdraw), `InviteCenter.tsx`, `SuperAdminInvites.tsx`, `UniversityInvites.tsx`. The old "Send it yourself for now; invite emails come later" note is gone.
- **Previews**: `components/dev/EmailPreviews.tsx` + gallery view `/dev/ui?view=emails` renders every email from the real templates at 680 and 375 px with subject and plain text.
- **Docs**: `OPERATIONS.md` Email section (what's emailed, settings, dev values).
- **Tests** (`convex/email.test.ts`): staff invitation content (both languages, escaping, independent teacher), create→sent and logged, re-invite/resend within 10 min → recent, later resend of an expired invite renews and sends, accepted invite can't be resent, no API key → off, suppressed address → off, a university admin can't resend admin invites or another university's; notification test updated for the deadline row and fallback link.

Checks run (2026-10-05): `kalami-stuff` `npx tsc --noEmit` ✅, `npm run lint` ✅, `npx vitest run` ✅ 19 files / 206 tests; deployed to dev `glad-mockingbird-933` (`npx convex dev --once`) ✅; `npm run api:student` and `kalami` `npx tsc --noEmit` ✅. Browser: `/dev/ui?view=emails`, all 8 emails at 680 and 375 px with no horizontal overflow (after adding wrapping and small-screen padding); `/dev/ui?view=admin`: "Send invitation" → "Invitation emailed to new.lecturer@tsu.ge · Tbilisi State University." with Copy link, rows show emailed/not emailed, Resend reports its outcome in the row.

Limitations: no real email was sent: the dev deployment has no `RESEND_API_KEY` (only the user should set it), and `STAFF_APP_URL`/`STUDENT_APP_URL` aren't set on dev, so dev emails would link to the production hosts until they are (commands in OPERATIONS.md). Rendering was checked in Chrome only, not in Gmail/Outlook/Apple Mail. Georgian copy should get a native read. Clerk's own sign-in and verification-code emails are configured in Clerk, not here.

### User review

Pending.

## TASK-007 — Super admin: find people by email and change their staff role

- **Status:** Ready for review (requested and agreed 2026-10-05)
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-05

### Problem / reproduction

The user (super admin) wants to search people by email on the staff Admin page and switch their role. Today roles only come from accepted invites (`convex/invites.ts`) or the `admin:grantSuperAdmin` CLI; there is no way to see or change someone's role in the app. Roles live only in Kalami's `memberships` table (role + university), not in Clerk.

### Agreed behavior and scope (user's answers, 2026-10-05)

- **Who:** only the super admin can search people and change roles.
- **Search** by email (start of the address) shows each person's name, email and roles (student, lecturer, university admin, super admin, with university).
- **Role changes:** lecturer ↔ university admin. Students stay students (accounts remain student or staff, never both); making someone a super admin stays a CLI step, and a super admin's own role can't be changed here.
- **University:** a lecturer or university admin can also be moved to another university, or (lecturers) made an independent teacher. Their existing courses stay where they were created.
- **Remove access:** a staff role can be removed entirely; without any staff role they can't use the staff app. Their courses stay, manageable by the university's admins and the super admin.

### Acceptance criteria

- [x] Only the super admin can search people and change roles (backend refuses everyone else).
- [x] Searching an email (start of the address) lists matching people with their roles and universities; deleted accounts don't show.
- [x] Lecturer ↔ university admin and the university can be changed; a university admin always has a university; students and super admins can't be changed here.
- [x] Removing a staff role works; with no staff role left the person loses staff access, and their courses stay.
- [x] Moving someone away from a university takes them off that university's groups (courses they shared stay with the students).
- [ ] User tested and accepted the result.

### Implementation and verification notes

2026-10-05, Claude (Claude Code):

- **Backend** `kalami-stuff/convex/people.ts` (new), super admin only (`requireSuperAdmin`):
  - `people.search({ query })`: people whose email starts with the query (at least 2 characters, case-insensitive, `users.by_email` range, max 25), without deleted accounts, each with name, email and memberships (role, university and its name).
  - `people.changeStaffRole({ membershipId, role, universityId? })`: lecturer ↔ uni_admin and/or another university (lecturers may have none = independent teacher); a university admin needs a university; the university must be active; changing into a role the person already has at that university removes the duplicate row; student and super admin rows are refused (CONFLICT).
  - `people.removeStaffRole({ membershipId })`: deletes a lecturer/uni_admin row (students and super admin refused).
  - Both are logged with `logAudit`. When nothing else ties the person to their old university, they're taken off its groups (`stopTeachingAtUniversity` in `convex/model/groups.ts`); course links stay, so students keep the courses (same rule as deleted lecturers).
- **UI**: Admin page "People" section (super admin only): `components/admin/PeoplePanel.tsx` (search by email with 250 ms debounce in `SuperAdminPeople.tsx`; each person with their roles; staff roles get Change (role segmented + university select; "independent teacher" only for lecturers) and Remove… with a confirmation; students show "Students stay students", the platform admin role "Changed from the command line"; empty, too-short and no-match states), `AdminView.tsx` (`people` slot), `app/(staff)/admin/page.tsx`. Dev gallery `?view=admin` has sample people.
- **Tests** `convex/people.test.ts` (7): non-super-admins refused for search/change/remove; prefix search with roles and university names, deleted hidden; lecturer→uni_admin (gains admin page) →lecturer elsewhere→independent; uni_admin without university refused; student and super admin rows refused; removing the only staff role ends staff access while the course stays; moving away removes them from the old university's groups while students keep the shared course, and a second role at the same university keeps them; merging duplicates.

Checks run (2026-10-05): `kalami-stuff` `npx tsc --noEmit` ✅, `npm run lint` ✅, `npx vitest run` ✅ 20 files / 213 tests; deployed to dev with `npx convex dev --once` ✅; `npm run api:student` + `kalami` `npx tsc --noEmit` ✅. Browser, staff gallery `?view=admin`: People section lists sample people; Change shows the university select with "No university: independent teacher" for a lecturer and drops it (keeping the chosen university) when switching to University admin; Remove… shows the confirmation; no horizontal overflow from the section at 1440 and 375 px.

Limitations: verified with backend tests and gallery sample data, not with a signed-in super admin in the browser. Search matches the start of an email only (not names or the middle of an address). A person's existing courses stay with their original university when they move.

### User review

Pending.

## TASK-008 — Standalone admin panel at `/admin`: own sidebar, student and lecturer stats, status controls for everything

- **Status:** Ready for review (requested 2026-10-05; scope below is Claude's reading of the request, open points listed; implemented the same day)
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-05

### Problem / reproduction

The user (super admin) asked for "the ultimate tool" for the admin panel: one place that manages everything, can touch any status and change it, shows all the stats of students and lecturers, and lives on its own route separated from the rest of the staff app, with its own sidebar dividing the features.

Today the admin page is one long page inside the staff layout (`kalami-stuff/app/(staff)/admin/page.tsx`, under the staff pill header): a create-university card, the invite center, the people search and, per university, invites and groups. There are no stats, no status controls beyond invites and roles, and no overview of courses, groups or activity.

### Agreed behavior and scope

- **Own route group** `app/(admin)/admin/*` in the staff app, outside the `(staff)` layout: no staff pill header. A left **sidebar** on wide screens (sections grouped under Overview / People / Teaching / Platform), a top bar with scrollable section chips on phones, a user button and a "Back to the studio" link.
- **Who gets in:** the super admin (everything, platform-wide, with a university filter: every university / one / no university) and university admins (their own university only: Overview, Students, Lecturers, Invites, Courses, Groups). Everyone else sees "Nothing to administer here". Every backend function re-checks the role and the university scope.
- **Sections:**
  - *Overview*: counts (students, lecturers, university admins, universities, courses by status, assessments by status, groups, pending invites, open team conversations), what's live right now (attempts in progress, work closing within 2 hours), the latest activity.
  - *Students*: list (newest first, Load more), filter by university, search by email; each with university, faculty, group, year, courses. A detail panel with their courses (enrollment status toggle active/removed), groups, every attempt with score and integrity, and their stats (attempts, submitted, average, best, waiting for grading). Admin can edit the student's profile (university, faculty, group, year, student number).
  - *Lecturers*: lecturers and university admins with roles, courses owned, groups taught, last activity; a detail panel with their courses (status, students), groups, recent activity; role actions (change, remove, **add a role**, e.g. a second university or making a role-less account a lecturer).
  - *People*: the TASK-007 search (any account by email, roles, change/remove).
  - *Invites*: the TASK-004 invite center (super admin) or the university's board (university admin).
  - *Universities*: list with stats (students, lecturers, admins, courses, groups, pending invites), create, **archive/restore**, rename and change the slug.
  - *Courses*: all courses (filter by university and status, search), owner, students, assessments by status; status draft/published/archived, joining on/off, new join code, **transfer to another owner**, delete (confirmation); a detail panel listing assessments with their own status controls and attempt counts.
  - *Groups*: every group (filter by university), members, lecturers, courses; archive/restore and link open/closed; open the group page.
  - *Activity*: the whole audit log, newest first, filter by action; who, via web or an agent, what.
  - *System*: deploy guard (is an exam running?), email configured or not, email suppressions (bounced/complained) with "allow again", people whose address bounced (reset), the materials→weeks migration leftover count, scheduled jobs.
- **Statuses the panel changes:** university status, course status + joining, assessment status, enrollment status, group archived/link, invite withdrawn, staff roles, student profile/university, email suppression. Each change is written to the audit log.
- **Kept out, on purpose (say so if wanted):** changing an attempt's status (reopening submitted work breaks grading; grading stays on the course page), reading conversations (private between student and lecturer; the team inbox stays at `/inbox`), making someone a super admin (stays `npx convex run admin:grantSuperAdmin`, as decided in TASK-007), deleting accounts (Clerk owns accounts; deletion arrives by webhook).

### Acceptance criteria

- [x] `/admin` renders outside the staff header with its own sidebar; every section above is reachable; phones get the top bar with chips and no horizontal overflow.
- [x] The super admin sees platform-wide data and can filter by university; a university admin sees only their university; lecturers and students are refused by the backend and see the "nothing to administer" screen.
- [x] Student and lecturer lists show the stats above and the detail panels work; every status control above changes the record and shows up in Activity.
- [x] Existing admin flows keep working: invites (TASK-004), people roles (TASK-007), groups made by admins (TASK-001), create university.
- [ ] User tested and accepted the result.

### Implementation and verification notes

2026-10-05, Claude (Claude Code). Everything in `kalami-stuff` unless noted.

- **Backend** `convex/platform.ts` (public, 20 functions) + `convex/model/platform.ts` (the logic). Every function starts with `requireAdminScope` (super admin: everything; university admin: their universities; everyone else FORBIDDEN) and a `university` filter (`Id | "none" | undefined`) that the server checks against the scope (`coverage`); a university admin asking for another university gets FORBIDDEN, a record outside their reach NOT_FOUND. Queries: `overview` (people/courses/assessments/groups/invites counts, attempts in progress, work closing within 2 h, 10 latest audit lines), `universities` (with counts), `students` (paginated, newest first) + `findStudents` (email prefix) + `student` (enrollments, groups, attempts with score/percent/integrity colour, stats), `staff` (all staff once each, role filter) + `findStaff` + `staffMember` (courses, groups, recent changes), `courses` (paginated, status filter) + `findCourses` (title or join code) + `course` (staff, assessments with attempt counts, groups, enrollment counts), `groups`, `activity` (paginated, filter by table; super admin only), `system` (deploy guard, email configured, suppressions with the matching account, materials migration leftovers, jobs; super admin only). Mutations: `updateUniversity` (names, slug, archive/restore; super admin), `setEnrollmentStatus`, `updateStudentProfile` (university/faculty/group/year/ID; only the super admin takes a student out of every university), `addStaffRole` (super admin anywhere; university admins only lecturers at home; students refused), `transferCourse` (new owner by email, must be staff; old owner stays as assistant), `clearEmailSuppression` (super admin). All write the audit log. Status changes for courses, joining, assessments, groups and invites reuse the existing mutations, which already allow admins. Counts are capped (5000 per role, 1000 courses/groups) and say so.
- **Schema** (`convex/schema.ts`): new indexes `memberships.by_role_and_universityId`, `courses.by_status`, `courses.by_universityId_and_status`, `auditLog.by_targetTable`. `convex/ops.ts` now shares `deployGuardStatus` with the System page.
- **Route** `app/(admin)/layout.tsx` (StaffGate → `AdminArea`) + `template.tsx` + pages `admin/{page,students,lecturers,people,invites,universities,courses,groups,activity,system}/page.tsx` (thin, wired). The old `app/(staff)/admin/page.tsx`, `AdminView.tsx`, `GroupsBoard.tsx`, `UniversityGroups.tsx` are gone; `components/admin/types.ts` holds the shared types, `CreateUniversityCard.tsx` the extracted form. Groups pages now link to `/admin/groups`.
- **UI** `components/admin/panel/`: `AdminShell` (desktop sidebar with Overview / People / Teaching / Platform groups and the university picker "Showing"; on phones a sticky bar with the picker and scrollable section chips; super-admin-only items hidden for university admins), `AdminArea` (gate + `listAdministered` + scope), `AdminScope` (the filter, remembered per tab in sessionStorage; `useMinute` for queries that take `now`), `ui.tsx` (PanelHeader, StatTile, StatusBar, Card, Avatar, SearchBox, ListFooter…), and one view per section: `OverviewView`, `StudentsView` + `StudentDetail` (dialog: stats tiles, profile edit, courses with Remove/Let back in, groups, attempts), `StaffView` + `StaffDetail` (dialog: roles with Change/Remove/Add a role, courses, groups, recent changes), `CoursesView` + `CourseDetail` (dialog: status, joining, new code, staff + transfer, assessments with their own status pills, groups, delete with confirmation, "Open in the studio"), `UniversitiesView` (create, edit names/slug, archive/restore, counts), `GroupsView` (new group with university select, filter, archived toggle, close/open link, archive/restore, Open), `ActivityView`, `SystemView`. Invites and Find a person reuse TASK-004/007 components inside the shell. New icons Search/Grid/Pulse; `lib/useDebounced.ts`.
- **Dev gallery** `components/dev/AdminGallery.tsx`: `?view=panel-overview`, `panel-overview-uni`, `panel-students`, `panel-student`, `panel-lecturers`, `panel-lecturer`, `panel-courses`, `panel-course`, `panel-universities`, `panel-groups`, `panel-activity`, `panel-system`, plus `admin` (invites), `admin-people`, `admin-uni` now inside the shell.
- **Tests** `convex/platform.test.ts` (14): lecturers/students refused everywhere and a university admin refused the super admin's pages; a university admin sees their own university only (and FORBIDDEN elsewhere); overview counts incl. a live attempt; universities with counts, rename/slug/archive/restore, archived refuses invites, slug conflicts, audit actions; students list order and counts, email search, detail with a submitted quiz (100 %), deleted hidden, non-students NOT_FOUND; remove/let back in changes what the student sees; profile edit by a university admin, super-admin-only moves out, validation; staff listed once each with roles/counts, role filter, no super admins for a university admin, email search, detail; addStaffRole rules; courses list/filter/search/detail; transfer (old owner becomes assistant and loses editing, students keep the course, other university NOT_FOUND); groups across universities; activity paging and table filter; system page and lifting a suppression.

Checks run (2026-10-05): `kalami-stuff` `npx tsc --noEmit` ✅ (after `npx next typegen`, since the running dev server still listed the deleted page), `npm run lint` ✅, `npx vitest run` ✅ 21 files / 227 tests; deployed to dev `glad-mockingbird-933` with `npx convex dev --once` ✅; `npm run api:student`, then `kalami` `npx tsc --noEmit` ✅ and `npm run lint` ✅. Browser (the user's dev server on 3101, gallery): every `panel-*` view and `admin`/`admin-uni` at 1440 px: sidebar with grouped sections and the picker, stat tiles and status bars, the three dialogs; the university-admin overview hides Find a person / Activity / System and shows one university. At 375 px: top bar with picker and avatar, scrollable chips, student rows wrap, course dialog fits; `document.documentElement.scrollWidth` = 375 (no horizontal overflow). Real routes `/admin`, `/admin/students`, `/admin/courses`, `/admin/system` compile and redirect to sign-in when signed out (307).

Limitations: verified with backend tests and gallery sample data, not with a signed-in super admin in the browser (same as TASK-004/007). Email search matches the start of an address only; course search covers the newest 1000 courses in scope. Staff and groups lists aren't paginated (they read up to 1000 rows per role/university). Activity and System are super-admin only. Page headings animate in with `AnimatedHeading`; in the browser pane they can look blurred in screenshots (known rAF throttling), not in a real tab. Kept out on purpose, as listed above: attempt status, reading conversations, super admin promotion, deleting accounts.

### User review

Pending.

## TASK-009 — High-end lesson presentation: roomy slides, real code windows, full-screen presenter, polished student lesson page

- **Status:** Ready for review (requested 2026-10-05 with a screenshot of "Basics of Web Technologies › Week 3 · Tables", slide 2 of 8; implemented the same day)
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-05

### Problem / reproduction

Student app, a published lesson in slides mode (TASK-002). The user's screenshot shows the slide squeezed into nested cards: the dark code block is clipped on the right and scrolls sideways, the live result floats loose next to it with no frame, the slide card is narrow (52 rem) with the controls pill overlapping its bottom edge, and the whole thing reads "tight". In the user's words: the course presentation should be high-end and professional, there should be a full-screen view, the code is not well organised and doesn't look good, and the entire student page should be polished too.

### Agreed behavior and scope (Claude's reading of the request)

- **Slide stage** (shared `components/lessons/LessonSlides.tsx`, staff-owned, copied to the student app): a wide stage (up to 64 rem), generous padding, the content vertically centred with a readable measure for prose and the full width for code, images and video; a small "Slide 2 of 8 · Example" eyebrow on the slide; a refined controls bar (Previous, a per-slide progress strip with the count, Next, and a Present button) that no longer overlaps the slide; keyboard hint on wide screens. Everything TASK-002 settled stays: one block per slide, no wrap, state kept per block, ← / → rules, announcements, reduced motion.
- **Full screen**: a Present mode in the player (button in the bar, in the lesson header, and the `F` key): the player takes over the screen (the Fullscreen API where the browser allows it, a fixed overlay otherwise, so phones work too), with a top bar (lesson title, slide count, Exit), bigger type, the same controls; `Esc` or Exit leaves it; answers and revealed steps survive entering and leaving.
- **Code blocks** (shared `LessonBlocks.tsx`): an editor-window look (window dots, language tag, Copy), line numbers, syntax colouring for HTML, CSS and JavaScript from a small tokenizer of our own (no new dependency; colours are theme tokens), code scrolling inside its own window; the live result in a matching "browser window" frame (dots, "Result") beside the code on wide slides and under it on narrow ones, both the same height. Markdown headings inside text blocks render as real headings.
- **Student lesson page** (`components/lessons-reader/LessonView.tsx`): a calmer header (breadcrumb, title, "N slides · about M min", Present and Back to course), the wider stage, polished next/previous lesson cards and footer. The course page's lesson rows become a numbered sequence with the same look. No backend, route or content-model changes; the staff editor's full Preview widens to match (its side preview stays compact).
- Not in scope: a redesign of the dashboard or other student pages beyond the lesson/course pages above (say so if wanted), slide export, speaker notes, changing how lessons are authored.

### Acceptance criteria

- [x] A lesson with a code + result block shows the code in a framed window with line numbers and colours, no clipping, and the result framed beside/under it; the slide has room and the controls never cover its content (desktop and 375 px).
- [x] Present enters a full-screen view (API or overlay), Esc/Exit leaves it, and a quick check answered before presenting is still answered after.
- [x] Every block type renders well in the stage; keyboard navigation, announcements and state retention from TASK-002 still hold. *(Checked in the student dev gallery; the real "Tables" lesson needs the user's signed-in check.)*
- [x] The student lesson page header, footer and the course page's lesson rows match the new look; the staff editor's preview still works.
- [x] Lint/type checks pass in both repos, slide/highlight tests pass, shared lesson files are identical in both repos.
- [ ] User tested and accepted the result.

### Implementation and verification notes

2026-10-05, Claude (Claude Code). The shared lesson files are edited in `kalami-stuff/components/lessons` and copied to `kalami/components/lessons` (scoped copy, tests excluded); `components/sandbox/Markdown.tsx` likewise.

- **Code colouring** `components/lessons/highlight.ts` (new, shared): a tokenizer for HTML (tags, attributes, strings, comments; `<style>`/`<script>` bodies as CSS/JS), CSS (selectors, at-rules, properties, values, numbers, functions, nested `@media` blocks) and JavaScript/other (keywords, strings, comments, numbers, calls). Every character comes back in order, broken into lines. Colours are theme tokens `--code-*` in both apps' `globals.css` (`text-code-tag` etc.), so a theme can restyle them. Tests `highlight.test.ts` (6, staff).
- **Blocks** `LessonBlocks.tsx`: the code block is an editor window (dots, file name from the language such as `index.html`, Copy pill, line numbers, coloured tokens, scrolling inside the window, 60 % of the screen high at most) and, for examples with a preview, a matching "Result · live" browser window; side by side from 42 rem of block width (container query, so the editor's narrow preview stacks them), stretched to the same height. Callouts, steps (with a thread between the numbers), quick checks (chip + ring instead of the dashed border), images and videos got the same rounded, ringed treatment. Type sizes are now em-based, so the presenter scales a whole slide. `blockKindLabel` / `blockIsProse` tell the player what a slide is. Markdown `#`/`##`/`###` render as h3/h4 headings sized in em.
- **Player** `LessonSlides.tsx`: the stage is a wide card (prose blocks centred at 46 rem, code/figures full width), 36 rem / 70 dvh minimum height, a slide eyebrow "05 / 15 · Example with result", a controls pill with Previous, "5 / 15" over a per-slide progress strip (a single bar past 20 slides), a Present button and Next, plus a keyboard hint on wide slides. **Presenter**: `present()`/`exit()` through a `ref` handle, the bar button, or `F` (never while typing); the root becomes a fixed overlay (title bar with Exit and "← → to move · Esc to leave", 18 px base type, scrolling stage, controls at the bottom), `requestFullscreen` is asked for where the browser allows it, `fullscreenchange`/Esc leave it, the body stops scrolling behind it. Nothing remounts, so answers and revealed steps survive. The compact editor preview is unchanged (no eyebrow, no Present).
- **Student page** `kalami/components/lessons-reader/LessonView.tsx`: 66 rem wide; header without the panel (course pill with a back arrow › week, big title, "15 slides · about 2 min · ← → to move", a Present button), the player, then "Other lessons" cards and a footer strip with Back to course and the contact card. New `Expand` icon in the student `icons.tsx`. **Course page** `CourseView.tsx`: lesson rows numbered ("Lesson 1 of 2") with an ink Read pill.
- **Staff editor** `LessonEditor.tsx`: the full Preview article is 64 rem wide and passes the lesson title to the presenter.

Checks run (2026-10-05): `kalami-stuff` `npx tsc --noEmit` ✅, `npm run lint` ✅, `npx vitest run` ✅ 22 files / 233 tests (incl. the 6 new highlight tests and the 16 slide tests); `kalami` `npx tsc --noEmit` ✅, `npm run lint` ✅; `diff -rq` of the shared folders: identical. Browser, student dev server (3100, gallery `?view=lesson`, 15 blocks): at 1440 px the code and result windows sit side by side (474 px each, equal height 328 px), the code doesn't overflow its window, the controls bar sits below the slide (no overlap), the keyboard hint shows, the page has no horizontal overflow; at 375 px they stack, no overflow, Present offered. Presenter: `F` opened the overlay (fixed, 1440×1000, 18 px type, body scroll locked, focus on the slide, top bar with the title and Exit); a quick check answered before presenting still showed its answer and "Not quite" inside the presenter and after Esc, with focus back on the slide and body scrolling restored. Keyboard ← / → moved 8 slides each way. Staff gallery: the editor's side preview has no Present button and no eyebrow ("1 / 9"), the full Preview is 1024 px wide with the eyebrow and Present. Course gallery: "Lesson 1 of 2 / 2 of 2" rows. No console errors on either page.

Limitations: the Browser pane was hidden during the check, so the layout was verified by DOM measurements and page text rather than screenshots after the first slide (the first screenshot showed the new stage, pill and hint); `requestFullscreen` was refused in the automated pane (no user gesture), so the overlay fallback is what was exercised; the real "Tables" lesson in a signed-in student session, touch devices, screen readers and reduced motion were not tested. The dashboard and other student pages were not redesigned.

### User review

Pending.

## TASK-010 — Student app as a PWA: installable, offline-aware, Web Push notifications end to end, install prompts

- **Status:** Ready for review (requested and implemented 2026-10-05; needs the user's real-phone check)
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-05

### Problem / reproduction

The user wants the whole student app to work as a Progressive Web App ("the dashboard is using it properly but the rest is not optimized"), and push notifications that actually work. Today there is no manifest, no service worker and no push: the plan from 2026-10-04 (dashboard cards and the bell done; "next: PWA with push + install prompts") was never built. Notifications exist as rows (`notifications` table) shown by the bell and emailed through Resend; push was meant to carry the same rows.

### Agreed behavior and scope

- **Installable**: a web app manifest (`app/manifest.ts`: name, start at `/dashboard`, standalone, Kalami colours, 192/512 icons plus maskable ones and a badge, rendered from the existing mark), Apple home-screen metadata and theme colour, so Android/Chrome offer "Install" and iOS can add it to the Home Screen.
- **Service worker** (`public/sw.js`, hand-written, no new dependency): caches the app shell's static files and icons, serves an `/offline` page when a page can't load, never touches Convex or Clerk traffic, receives pushes and opens the right page on tap. Not registered in development's caching mode (dev gets push handling only), so HMR keeps working.
- **Web Push, end to end**: VAPID keys on the Convex deployment (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`; the public key is served by a query, so the apps need no extra variable); a `pushSubscriptions` table; `push.subscribe/unsubscribe/mine`; delivery from the same notification fan-out as email, through a Node action using `web-push` (dead subscriptions removed on 404/410); a "Send a test notification" button under the bell and a CLI test action for the user's own devices.
- **Turning it on**: a "Notify this device" switch under the bell with honest states (unsupported browser, blocked by the browser, iPhone not yet installed, on/off), and the browser's permission prompt only on tap.
- **Install prompts**: a dismissable card on the dashboard: a real Install button on Android/desktop Chrome (`beforeinstallprompt`), a "Share → Add to Home Screen" guide on iPhone/iPad; hidden once installed.
- **Standalone polish across pages**: safe-area insets (notch and home indicator) for the header, the lesson controls and page bottoms; no pull-to-refresh bounce in the installed app; an offline banner on every student page; the whole app shell works at phone width in standalone mode.
- Out of scope: offline reading of lesson content or doing quizzes offline (Convex needs a connection; the app says so), push for staff, background sync.

### Acceptance criteria

- [x] The manifest and icons validate; `/manifest.webmanifest`, `/sw.js`, `/offline` and the icons are public (no sign-in redirect); the SW registers in the student app. *(Registration itself could not run in the in-app browser, see Limitations; the worker's behaviour was verified in a Node harness.)*
- [x] With VAPID set, a student can turn push on under the bell, receives the test notification on that device, and gets a push when work is published or a deadline is near; turning it off removes the subscription; a dead subscription is removed after a push fails with 404/410. *(Sending verified end to end against a fake device on the dev deployment; the on-device part needs the user's phone.)*
- [x] The install card shows the right thing per platform and disappears when installed or dismissed.
- [x] Offline: a page load without a connection shows the offline page; the banner appears and disappears with the connection.
- [x] Lint/type checks pass in both repos; backend tests cover subscriptions, delivery scheduling and dead-subscription cleanup.
- [ ] User tested on a real phone (install + push) and accepted the result.

### Implementation and verification notes

2026-10-05, Claude (Claude Code).

**Backend (`kalami-stuff`)**

- `convex/schema.ts`: `pushSubscriptions` (userId, endpoint, keys, userAgent, lastUsedAt, failures; indexes by user and by endpoint); `notifications.pushedAt` so a retried batch never pushes twice.
- `convex/push.ts`: `vapidPublicKey` (public key or null until the deployment is set up), `subscribe` (upsert by endpoint; a device follows whoever signs in on it; at most 8 devices per student, oldest dropped; rate-limited `pushSubscribe`), `unsubscribe`, `mine`, `requestTest` (schedules the test push to all of the student's devices; `pushTest` limit); internal `payloadsFor`, `devicesOf`, `userIdByEmail`, `recordResults` (gone → deleted, failure → strike and dropped after 5, success → fresh; rows marked pushed).
- `convex/pushDelivery.ts` ("use node", `web-push` + types installed): `deliver` (scheduled by the notification fan-out in `model/notifications.ts` next to `email.deliver`), `sendTest`, `sendTestByEmail` (CLI: `npx convex run pushDelivery:sendTestByEmail '{"email":"…"}'`). `web-push` is imported dynamically only when VAPID is configured, so tests and keyless deployments never load it; TTL one day, urgency high, a topic per notification.
- `convex/lib/pushMessage.ts`: the push text in Georgian/English (same wording family as the email templates, due times in Tbilisi time).
- `convex/lib/limits.ts`: `pushSubscribe`, `pushTest`. `OPERATIONS.md`: VAPID rows in the settings table and a "Push notifications" section.
- Dev deployment `glad-mockingbird-933`: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` set (keys generated locally with `web-push`). **Production needs its own pair** (`npx web-push generate-vapid-keys`, then `npx convex env set … --prod`); nothing else to configure, the app fetches the public key from the backend.
- Tests: `convex/push.test.ts` (5: on/off and refusals, device follows the account + the 8-device cap, test button counts and schedules only when configured, fan-out rows reach the devices of enrolled students once, gone/failed/ok bookkeeping and lookups) and `convex/lib/pushMessage.test.ts` (3).

**Student app (`kalami`)**

- `app/manifest.ts` (id/start `/dashboard`, standalone, paper colours, education, shortcuts Dashboard/Messages), `public/icons/` (192/512 plain, 192/512 maskable, 96 badge, rendered from `app/icon.svg` with sharp), root `layout.tsx` metadata (`manifest`, `appleWebApp`, `applicationName`, `formatDetection`) and `viewport` (`viewport-fit=cover`, theme colour), `<ServiceWorker />`.
- `public/sw.js` (hand-written): precaches `/offline`, the manifest and icons; page loads network-first with the offline page as fallback; `/_next/static` cache-first; icons/manifest stale-while-revalidate; never touches `/api`, Clerk, the dev gallery or other origins; `push` shows the payload (icon, badge, tag, language, URL), `notificationclick` focuses an open Kalami window and navigates it (or opens one), foreign URLs fall back to the dashboard; `pushsubscriptionchange` re-subscribes; `?mode=dev` (development) caches and intercepts nothing.
- `app/offline/page.tsx` (static, public in `proxy.ts`), `lib/pwa.ts` (key conversion, iOS/standalone detection, the deferred `beforeinstallprompt` store, dismiss memory), `components/pwa/`: `ServiceWorker`, `usePwa` (online, standalone, install prompt), `OfflineBanner` (student layout), `InstallCard` (+ `InstallCardView`: Chrome/Android Install button, iPhone three-step Share → Add to Home Screen guide; hidden when installed/standalone or dismissed for 14 days) on the dashboard (`DashboardView` `install` slot), `usePush` + `PushSetting` (+ `PushSettingView`) in the bell's footer (`NotificationsPanel`/`Bell` `push` slot): states loading / unavailable / unsupported / needs-install (iPhone in Safari) / blocked / off / on, the browser's permission prompt only on tap, a stale-key subscription replaced, "Send a test notification" with the device count.
- Standalone polish: the pill header and the offline banner keep clear of the status bar (`safe-area-inset-top`), the student `main` and the lesson slide controls (shared `LessonSlides`, copied) keep clear of the home indicator, `overscroll-behavior-y: none` and no text-size auto-adjust in `display-mode: standalone` (globals.css).
- Dev gallery: `pwa-install`, `pwa-install-ios`, `notifications` (push on, with the test line), `notifications-push-off`, `notifications-push-iphone`, `notifications-push-blocked`; `studentPage` now includes the offline banner.

**Checks run (2026-10-05)**

- `kalami-stuff`: `npx convex dev --once` ✅ (deployed to dev), `npx tsc --noEmit` ✅, `npm run lint` ✅, `npx vitest run` ✅ 24 files / 241 tests; `npm run api:student` ✅. `kalami`: `npx tsc --noEmit` ✅, `npm run lint` ✅.
- HTTP on the dev server (3100): `/manifest.webmanifest` 200 `application/manifest+json` with the expected content, `/sw.js` 200 JavaScript, `/offline` 200 (no sign-in redirect), icons 200 `image/png`.
- **Push end to end on the dev deployment:** a fake device (a valid P-256 key, an endpoint at Mozilla's push service) was imported for the user's own account, then `npx convex run pushDelivery:sendTestByEmail '{"email":"giokhvichia69@gmail.com"}'` answered `Sent to 0 device(s); 1 gone (removed), 0 failed.` and `push:devicesOf` showed no devices left: the Node action loaded `web-push`, signed with the dev VAPID key, reached the push service, read its 404 and removed the device.
- **Service worker in a Node harness** (vm with fake `self`/`caches`/`clients`): precaches `/offline` and the icons; an offline navigation returns the cached offline page; a static chunk is served from cache on the second request even offline; `/api`, Convex, Clerk and other origins are never intercepted; a push payload becomes a notification with icon, badge, tag, language and URL, a bad payload still shows "Kalami"; a tap opens the page in a new window, or navigates an open Kalami window, and a foreign URL falls back to the dashboard; dev mode caches and intercepts nothing but still shows pushes.
- Browser (student dev gallery, pane hidden so by DOM/text): manifest link, theme colour, `apple-mobile-web-app-capable`, `viewport-fit=cover` present; install card renders for Chrome (Install / Not now) and iPhone (three steps, Got it), fits at 375 px without horizontal overflow; the bell's footer shows the push switch in the on / off / iPhone / blocked states with the right wording and disabled states; the offline banner appears when the browser reports offline and goes when back online.

**Limitations**

- The in-app browser refuses every service-worker registration (even a missing script gives "An unknown error occurred when fetching the script"), and its permission prompt can't be granted, so installing, registering the worker and turning push on were not exercised in a browser here; the worker was verified in the harness and the sending side against a real push service. **Please test on your phone:** open the dev or deployed app over HTTPS, install it (Android: the card's Install; iPhone: Share → Add to Home Screen, then open from the home screen), turn on "Notify this device" under the bell, tap "Send a test notification". From a computer, `npx convex run pushDelivery:sendTestByEmail '{"email":"<yours>"}'` reports what happened.
- Production has no VAPID keys until you set them (OPERATIONS.md); until then the switch says "Not available on this server yet" and nothing else changes.
- Offline covers the app shell and the offline page, not lesson content or quizzes (Convex needs a connection; the banner says so). Staff get no push.

### User review

2026-10-05: the user reported "push notifications on mobile don't work". Findings and fixes (Claude):

- **Cause on production:** both repos had been committed and deployed (the staff Vercel build deploys the Convex backend; prod `strong-lyrebird-617` had every `push.*`/`pushDelivery.*` function and the `pushSubscriptions` table), but prod had **no VAPID settings**, so `push.vapidPublicKey` returned null and the switch under the bell could only say "Not available on this server yet". Fixed: a production key pair was generated locally with `web-push`, stored on prod as `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` (`mailto:kalamispace@gmail.com`) and the local copy deleted; prod now answers the public key. Verified end to end on prod: a fake device imported for the user's own account, `npx convex run pushDelivery:sendTestByEmail '{"email":"giokhvichia69@gmail.com"}' --prod` → `Sent to 0 device(s); 1 gone (removed), 0 failed.`, device list empty afterwards. `https://app.kalami.space` serves the manifest, `/sw.js`, `/offline` and the icons (all 200). No real device had ever subscribed on dev or prod before this.
- **Cause on a phone against the dev server over the LAN (`http://192.168…`):** browsers hide service workers and push on plain http, and the switch blamed the browser ("This browser can't show notifications"). Fixed in `components/pwa/usePush.ts` + `PushSetting.tsx` (uncommitted in `kalami`): new `insecure` state ("Notifications only work over a secure address (https)…"), new `no-worker` state when the worker never activates (with a reload hint instead of "Checking this device…" forever), `lib/pwa.ts` `ensureServiceWorker()` registers the worker itself and waits for it with a timeout (used on load and when turning push on, so a failed early registration no longer hangs the switch); the "unavailable" wording now says the server has no notification keys. Gallery view `notifications-push-insecure`. Checks: `kalami` `npx tsc --noEmit` ✅, `npm run lint` ✅; the gallery shows the new state with the switch disabled.
- To get the clearer messages on phones, commit and push the `kalami` changes (`lib/pwa.ts`, `components/pwa/*`, `components/dev/StudentGallery.tsx`); production push itself already works with the code that is live.

Suggested test on the phone, on `https://app.kalami.space`: Android Chrome: open the app, bell → "Notify this device" → allow → "Send a test notification". iPhone: Share → Add to Home Screen, open Kalami from the home screen, then the same. Status pending the user's test.

## TASK-011 — Read-only MCP connector for students: study their courses, lessons, materials and finished work with their own AI

- **Status:** Ready for review (requested 2026-10-06, built 2026-10-06)
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-06

### Problem / reproduction

The user wants students to connect their own AI assistant to Kalami, read-only, so they can analyse their homework **after they finish it**, together with the lessons and materials: "dynamic study is our priority". Today the MCP connector (`staff.kalami.space/api/mcp`) is for lecturers only; a student who signs in there is refused (`actorFromToken` returns null for non-staff).

### Agreed behavior and scope

- **A second connector for students** at the student app's origin, `https://app.kalami.space/api/mcp`, with the same "Sign in with Kalami" OAuth flow (Clerk) and the same signed service credential to Convex; Convex accepts only onboarded student accounts there (staff get nothing, as students get nothing on the staff connector).
- **Read-only tools**: `whoami`, `list_courses`, `get_course` (weeks with lessons, materials: Drive folders and links, the week's tasks and quizzes with state and the student's result), `get_lesson` (all blocks), `get_my_work` (a finished task, quiz or exam: the questions as the student saw them, their own answers, what was right and the explanations **only where the lecturer's results setting already shows them in the app**, score, the lecturer's feedback and red-pen comments; for code tasks the student's files and the checks), `my_progress` (every course's work with status and score), `whats_next` (open work and deadlines) and `find_in_lessons` (where a topic was covered). No tool changes anything.
- **"After they finish it"**: `get_my_work` answers only for work the student can no longer take again: submitted and (closed, or no attempts left, or a code task). Questions and answers show once the work is closed or full results are visible, correct answers and explanations only with full results, the score only when the results setting shows it: the same rules as the student app, so the connector never reveals more than the screen does, and never helps during an attempt.
- **In the student app**: an "AI assistant" page (`/assistant`) with per-client connect steps (claude.ai, ChatGPT, Claude Code, Cursor, VS Code, Gemini CLI, Codex) and what the assistant can and can't see, a card on the dashboard pointing to it, a header link on wide screens.
- Settings: the student app needs `MCP_SERVICE_SECRET` (the same value as Convex and the staff app) on Vercel; `lib/mcp/oauth.ts` becomes a shared file synced from the staff repo.
- Out of scope: writing anything for students (notes, answers), chat history, agents acting for students in quizzes, reading other students' work.

### Acceptance criteria

- [x] `app.kalami.space/api/mcp` answers 401 with `resource_metadata` pointing at the student app's `/.well-known/oauth-protected-resource`, which names Clerk as the authorization server (checked on the dev server; prod after deploy).
- [x] A signed-in student's assistant can list courses, read lessons and materials, see progress, and analyse finished work; a staff account gets "not signed in as a student"; a lecturer's connector is unchanged (backend tests; `convex/mcp.ts` untouched).
- [x] Unfinished work (not started, in progress, retakes left, not opened) returns no questions or answers; answer keys appear only when the app would show them (backend tests).
- [x] Backend tests cover the token actor, the finished-work rules, the visibility rules and the search; lint/type checks pass in both repos; shared files identical.
- [ ] User tested with their own assistant and accepted the result.

### Implementation and verification notes

**Backend (kalami-stuff, Convex):**

- `convex/lib/access.ts`: `studentFromToken` / `requireTokenStudent` resolve the signed service credential to an onboarded student (not deleted, not staff-only, a student membership with onboarding done); staff and strangers get `UNAUTHENTICATED` "Not signed in to Kalami as a student. Reconnect Kalami in your assistant." `actorFromToken` (staff) is unchanged, so the lecturer connector still refuses students.
- `convex/model/study.ts` (new): `studyWhoami`, `finishedWith` (finished = submitted and closed, or a code task, or no attempts left; otherwise a plain reason and nothing else), `getFinishedWork` (task → `getStudentTask`; quiz/exam → the questions as the student saw them with `myAnswer`, shown once the work is closed or full results are visible; `pointsEarned`, `correctOptionIds`, `acceptedAnswers`, `explanation` only with full results; the score only when the results setting shows it; a `note` says what is withheld), `getProgress`, `searchLessons` (published lessons of joined courses, 300 lessons / 20 hits cap, a snippet each). Everything goes through the student app's own helpers (`getStudentCourse`, `getStudentLesson`, `getStudentTask`, `windowState`, `visibleResults`, `finalScore`), so the connector never shows more than the screen.
- `convex/study.ts` (new): queries only (`whoami`, `listCourses`, `getCourse`, `getLesson`, `getWork`, `progress`, `upNext`, `findInLessons`), each taking `{ token, client? }`. `convex/model/quiz.ts` exports `studentQuestion` and `attemptOrder` for reuse.
- `convex/study.test.ts` (new, 7 tests): credential acceptance (student yes; lecturer, super admin, unknown user, forged signature, malformed credential, unfinished onboarding no; the staff connector still refuses the student), courses/lessons/search limited to joined courses and published lessons, the full quiz lifecycle (not started → in progress → submitted while open with full-after-close → closed with keys → score-only without keys → hidden without a score; another student gets `NOT_FOUND`, staff `UNAUTHENTICATED`), retakes left = off limits until closed, progress and up-next. Fixture note: publishing a week publishes its draft lessons, so the hidden lesson is set back to draft afterwards.
- `STUDIO.md` section 4.1 documents the student connector; `OPERATIONS.md` lists `MCP_SERVICE_SECRET` for the student Vercel project; `scripts/sync-student.mjs` syncs `lib/mcp/oauth.ts` (its comments are now generic for both apps).
- Deployed to the **dev** Convex deployment only (`npx convex dev --once`); `npm run api:student` regenerated `kalami/convex-api/api.ts`. Nothing was deployed to prod.

**Student app (kalami):**

- `lib/mcp/oauth.ts` (synced copy), `lib/mcp/server.ts` (server `kalami-study` 1.0.0; tools `whoami`, `list_courses`, `get_course`, `get_lesson`, `find_in_lessons`, `my_progress`, `whats_next`, `get_my_work`; study-companion instructions: read-only, never help with open work, answer in the student's language), `app/api/mcp/route.ts`, `app/.well-known/oauth-protected-resource` (+ `/api/mcp` variant) and `oauth-authorization-server` routes; `proxy.ts` leaves `/api/mcp` and `/.well-known` public (bearer auth, not Clerk sessions).
- `/assistant` page (`app/(student)/assistant/page.tsx`, `components/assistant/AssistantView.tsx` + `ConnectSnippets.tsx`, `components/ui/CopyButton.tsx`, `lib/useOrigin.ts`): per-client steps (Claude app, ChatGPT, Claude Code, Cursor, VS Code, Gemini CLI, Codex, other), the can/can't list, example prompts. `StudentNav` link "AI assistant" (wide screens), a dashboard card linking to it, dev gallery view `assistant`.
- `.env.local` got `MCP_SERVICE_SECRET` (dev value; not committed). Packages added: `mcp-handler`, `@modelcontextprotocol/server`, `zod`.

**Checks run (2026-10-06):**

- kalami-stuff: `npx tsc --noEmit` clean, `npm run lint` clean, `npx vitest run` 25 files / 248 tests passed (7 new).
- kalami: `npx tsc --noEmit` clean, `npm run lint` clean.
- Dev server (`localhost:3100`): `POST /api/mcp` without a token → 401 with `WWW-Authenticate: Bearer … resource_metadata="…/.well-known/oauth-protected-resource"`; with a garbage bearer → 401 `invalid_token`; `/.well-known/oauth-protected-resource` (and the `/api/mcp` variant) names the Clerk dev instance and `/assistant` as documentation; `/.well-known/oauth-authorization-server` mirrors Clerk; `/assistant` redirects to sign-in when signed out.
- Gallery `/dev/ui?view=assistant` at 1440 px and 375 px: renders, no horizontal overflow; on phones the Copy button now sits under the address instead of covering it.

**Limitations / follow-ups:**

- Not yet exercised end to end with a real assistant: that needs the prod deploy (claude.ai cannot reach localhost) plus `MCP_SERVICE_SECRET` on the student Vercel project (the prod value, same as Convex prod and the staff project). Until that variable is set, every student sign-in on the prod connector fails with 401.
- Clerk's OAuth application settings (CIMD/DCR) are shared, so no Clerk change was needed; the consent screen says "Kalami" for both connectors.
- The staff `/agents` page has the same phone-width Copy button overlap: TASK-012.

### User review

Pending.

## TASK-012 — Staff `/agents` page: the Copy button covers the connector address on phones

- **Status:** Ready
- **Owner:** Unassigned
- **Reported:** 2026-10-06

### Problem / reproduction

Found while building TASK-011. On the staff app's `/agents` page at phone width, the connector address `<pre>` scrolls sideways and the absolutely positioned Copy button (`components/agents/ConnectSnippets.tsx`, `absolute right-3 top-3`) covers the end of the text.

### Agreed behavior and scope

Same fix as the student page: below `sm` stack the button under the address (wrapper `flex flex-col items-end gap-2 sm:block`, button `sm:absolute sm:right-3 sm:top-3`, `pre` padding `sm:pr-28`). Nothing else changes.

### Acceptance criteria

- [ ] At 375 px the full address stays readable and the button sits under it; at 640 px and up the layout is unchanged.
- [ ] `npx tsc --noEmit` and `npm run lint` pass in kalami-stuff.
- [ ] User tested and accepted the result.

### Implementation and verification notes

Pending.

### User review

Pending.

## TASK-013 — Notification center in the admin panel: messages to anyone, groups, courses and whole audiences by bell, push and email

- **Status:** Ready for review (requested 2026-10-06, built 2026-10-06)
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-06

### Problem / reproduction

The user wants a notification center in the admin panel: send push notifications and emails to anyone they want, with a person search, broadcasts to groups ("I want the specific groups to be able to get the notifications"), "basically full controls". Today only the system sends notifications (new work, deadline reminders); an admin has no way to reach people.

### Agreed behavior and scope

- **New section "Notifications"** at `/admin/notifications`, for the platform admin and university admins (scoped like the rest of the panel).
- **Compose:** a title, the message, an optional link (a path in the student app or an https address). **Audience:** everyone on Kalami (platform admin only); all students or all lecturers and admins, optionally at one university or outside any; everyone at a university; one group (its students); one course (its active students); specific people found by email (students and staff, picked one by one). **Channels:** a push to students' devices and/or an email; the bell in the student app always shows it, since the row there is the record. An option to email people who switched notification emails off, for important notices; bounced or complained addresses are never emailed.
- **Before sending:** a live count of who it reaches (students, staff, how many have push on, how many get the email and why the rest don't), then a confirmation.
- **Delivery:** in batches of 100 through scheduled mutations, one delivery row per person, so a retried batch never reaches anyone twice; pushes go through the existing push pipeline, emails through Resend with the one-click unsubscribe headers. Lecturers and admins get email only (the staff app has no bell or push).
- **History:** every broadcast with its status and counts (reached, bell, push, email), and per broadcast the list of recipients with what each one got. An audit log entry per broadcast; at most 30 per hour per admin.
- **Student app:** the bell and the push show an announcement with its text and who sent it ("Kalami" or the university).
- Out of scope: scheduling for later, saved templates, replies, two-language messages, a bell for staff, SMS.

### Acceptance criteria

- [x] An admin can send to each audience type; students get the bell row, a push when chosen and a device is on, an email when chosen and allowed; staff get the email (backend tests; the real send with a Clerk session is for the user to try).
- [x] A university admin can only target their own university's people, groups and courses; everyone-on-Kalami and cross-university audiences are refused (backend tests).
- [x] Opted-out people get no email unless the override is on; bounced or complained addresses never do; the recipient list says why (backend tests).
- [x] The history shows counts and recipients; the audit log shows the send; a second run of a batch sends nothing twice (backend tests; gallery views).
- [x] Backend tests cover authorization, every audience, dedupe, channels and the email rules; lint and type checks pass in both repos; the student API spec is regenerated.
- [ ] User tested and accepted the result.

### Implementation and verification notes

**Backend (kalami-stuff, Convex):**

- `convex/schema.ts`: `broadcasts` (sender, who it's from as people see it, title, body, link, the audience rule and its label, channels, the opt-out override, status, counts) and `broadcastDeliveries` (one row per person: the bell row, devices with push on, the email id or why no email went; indexed by broadcast and by broadcast + person). `notifications` gained the kind `announcement`; `courseId`, `assessmentId` and `assessmentKind` are optional now, `body` and `broadcastId` new. Deployed to the **dev** deployment only.
- `convex/model/broadcasts.ts` (new): an audience is turned into sources (`users`, memberships by role and university, `groupMembers`, active `enrollments`, or a list of ids); `checkAudience` applies the scope rules and writes the label (the platform admin only for everyone, a whole role across universities and people outside any; `covers` for the rest; picked people must have a membership the caller administers; at most 200 people); `previewAudience` counts up to 1000 with `take` (students, staff, with push on, emailable / opted out / bounced, whether email and push are set up); `createBroadcast` validates (title ≤ 120, message ≤ 2000, link a path or https address), rate-limits (`broadcast`, 30 an hour per admin), logs `broadcast.send` and schedules the fan-out; `fanOutBroadcast` handles 100 people per scheduled mutation with `paginate`, skips anyone who already has a delivery row, writes the bell row for students (from label in the student's language: "Kalami" or the university), hands rows for students with a device to `pushDelivery.deliver`, sends the email through `sendAnnouncementEmail`, adds to the counts, then schedules the next page, the next source, or marks it sent; `listBroadcasts` (all for the platform admin, own for a university admin), `listRecipients` (paginated, with the role and the marks), `searchPeople` (email prefix, students and staff within reach).
- `convex/broadcasts.ts` (new): the internal `fanOut`. `convex/platform.ts`: `findPeople`, `broadcastPreview`, `sendBroadcast`, `broadcasts`, `broadcastRecipients`.
- Email: `renderAnnouncementEmail` (+ `paragraphsOf`) in `lib/email/templates.ts`; `sendAnnouncementEmail` in `email.ts` (skips `not_configured` / `blocked` / `opted_out` unless the override, unsubscribe link and List-Unsubscribe headers, idempotency key per broadcast and person, logged in `emailLog` so bounces trace back); `deliverNotifications` leaves announcement rows alone. Push: `announcementPushMessage` + `pushUrl` in `lib/pushMessage.ts`, `push.payloadsFor` carries the text, `pushDelivery.deliver` picks the message by kind. `WorkNotificationKind` keeps the work-only code typed.
- `convex/broadcasts.test.ts` (new, 9 tests): students, lecturers and signed-out callers refused; a university admin refused for everyone, all students, outside-any, another university, another university's group and a person outside their reach; validation; everyone (counts, the bell row's content, no row for staff, the recipient list, the audit entry, a repeated batch sends nothing twice); group, course and picked people (dedupe, labels, the link as the bell row's href); the email rules (preview counts, opted out, bounced, the override, devices counted, each admin's own history, no access to another's recipients); nothing emailed without `RESEND_API_KEY`; finding people; the email and push texts.
- `OPERATIONS.md`: a section on the notification center. `components/dev/EmailPreviews.tsx`: two announcement samples (staff `/dev/ui?view=emails`).

**Staff app (kalami-stuff):**

- `/admin/notifications` (`app/(admin)/admin/notifications/page.tsx`): `components/admin/panel/NotificationsView.tsx` (audience tabs with the university select, the group list, the course search, the people search with chips; title, message and link; push and email cards with the override; the live "Reaches N people" box with the warnings when push or email isn't set up; a confirmation dialog; the history list with status and counts) and `BroadcastDetail.tsx` (the message, the counts, the recipients with Bell / Push · devices / Email · reason marks, paged). Sidebar item "Notifications" under People (new `Bell` and `Megaphone` icons). Gallery views `panel-notifications` and `panel-notification`.

**Student app (kalami):**

- `components/notifications/NotificationsPanel.tsx`: an announcement shows "From <sender>", the title, the text (three lines) and when; the dev gallery inbox has one. `convex-api/api.ts` regenerated.

**Checks run (2026-10-06):**

- kalami-stuff: `npx tsc --noEmit` clean, `npm run lint` clean, `npx vitest run` 26 files / 257 tests passed (9 new).
- kalami: `npx tsc --noEmit` clean, `npm run lint` clean.
- Staff gallery (`localhost:3101/dev/ui?view=panel-notifications`, `panel-notification`, `emails`) at 1440 px and 375 px: composer with every audience picker, preview box, history, the detail dialog with recipients; no horizontal overflow on phones. Student gallery `localhost:3100/dev/ui?view=notifications`: the announcement row renders in the bell.

**Limitations / follow-ups:**

- Not sent from a real signed-in admin session in the browser (the pane can't sign in to Clerk): the user's test is the real send on dev or prod. The dev deployment has no `RESEND_API_KEY`, so dev shows "email not set up" per recipient; prod has both email and push settings already and needs nothing new.
- The audience is a rule evaluated when it's sent: someone who joins the group or course later doesn't get earlier messages.
- "Push" counts people who had a device on when it was sent; without the VAPID settings nothing is actually pushed (the preview says so in red).
- Lecturers and admins get the email only: the staff app has no bell or push. No scheduling for later, no saved templates, no replies.

### User review

Pending.

## TASK-014 — Notification center: message any email addresses, with or without an account, and turn a message into personal group invitations

- **Status:** Ready for review (requested 2026-10-06, built 2026-10-06)
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-06

### Problem / reproduction

After TASK-013 the user asked to "send the notifications to any emails I want, in groups, like to send the invitations to my students before they authenticate on the application". The notification center reaches accounts only; a class list of addresses with no accounts yet can't be messaged, and inviting them to a group means the lecturer's group page.

### Agreed behavior and scope

- **A new audience, "Email addresses":** paste a list (commas, spaces or new lines; up to 200). An address with an account the admin can reach gets the usual treatment (bell, push, email); an address with no account, or whose account is outside a university admin's reach, gets the email only. Bad addresses are named and nothing is sent until they're fixed.
- **A message as an invitation:** for pasted addresses or picked people, "Turn this message into a group invitation" with a group picker. Each person gets a personal invite to that group, the email's button accepts it, the bell row opens it, and the recipient list marks them "Invited". People already in the group get the plain message; an invite already waiting is reused, not doubled. The invitation always goes by email and also reaches people who switched notification emails off (like one from the group's page); bounced or unsubscribed addresses never get it. The group's pending-invite count and the per-admin invite allowance apply.
- **Unsubscribe for addresses without an account:** the email's unsubscribe link puts the address on the list Kalami no longer emails (status `unsubscribed`, shown in System and clearable there); an account with that address is also switched off.
- **Preview** counts addresses without an account ("email only"). The history label says "N email addresses, invited to <group>".
- Out of scope: importing CSV files, replacing the group page's own invite list, inviting to courses.

### Acceptance criteria

- [x] Pasted addresses reach accounts in full and addresses without an account by email; bad addresses are refused by name; a university admin's paste can include an address from another university and that one gets the email only (backend tests).
- [x] With a group chosen, every recipient who isn't a member gets a personal invite; the email and the bell row carry the join link; sending again reuses the open invite; members get no invite (backend tests).
- [x] The unsubscribe link in an address-only email works (GET shows the page, POST lists the address), and later messages skip that address as blocked (backend tests, through the HTTP route).
- [x] Backend tests cover the audience, the invitation, the unsubscribe and the validation; lint and type checks pass in both repos.
- [ ] User tested and accepted the result.

### Implementation and verification notes

**Backend (kalami-stuff, Convex):**

- `convex/lib/validators.ts`: audience kind `emails` (a list of strings). `convex/schema.ts`: `broadcasts.groupId` (the message is an invitation to this group); `broadcastDeliveries.userId` optional, `email` and `inviteId` new, index `by_broadcastId_and_email`; `emailSuppressions.status` gains `unsubscribed`.
- `convex/model/broadcasts.ts`: recipients are now an account id or an address. `cleanEmails` splits a paste (commas, spaces, new lines), keeps each address once, names bad ones in the error, caps at 200. `resolve` turns an address into its account when one exists within the sender's reach (`reachOfScope` for the preview, `reachOfSender` in the fan-out), else into an address to email; dedupe by account or by address (`deliveryOf` uses either index). `createBroadcast` takes `groupId` (addresses or picked people only; the group must be open and within reach; the `groupInvite` allowance is charged for the count); the label becomes "N email addresses, invited to <group>"; the email channel is forced on. The fan-out asks `openInviteFor` for each recipient, puts the join link in the email (`invite`) and in the bell row's `href` (`/join/invite/<token>`), and emails an invitation even to people who switched notification emails off. The preview counts `noAccount`. Recipient rows carry `invited` and the role `none` for address-only recipients.
- `convex/model/groups.ts`: `isEmailAddress`, `openInviteFor` (the open invite for an address, or a new row with the group's pending count bumped; null for members, archived groups, or a full waiting list; never emailed by itself).
- `convex/email.ts`: `sendAnnouncementEmail` takes a target (an address with or without an account) and an optional invitation; an address without an account gets the unsubscribe link with `e=<address>` and an idempotency key by address. `lib/email/templates.ts`: `renderAnnouncementEmail` with an optional locale (unknown: Georgian, the reason in both languages) and `invite` (the group as a detail row, "Accept the invitation" button, a note to sign in with that address).
- Unsubscribe by address: `model/notifications.ts unsubscribeEmailByToken` (lists the address as `unsubscribed`, switches off any account with it), `notifications.unsubscribeEmail` (internal), `http.ts` accepts `e` next to `u` on GET and POST. `model/platform.ts` system validator and `SystemView` show "Unsubscribed"; "Allow again" clears it like a bounce.
- `convex/broadcastInvites.test.ts` (new, 6 tests): a dean's paste of accounts, a stranger and a student of another university (that one by email only; the platform admin reaches her account); bad addresses refused by name; the invitation (labels, forced email, the opted-out student still invited, members skipped, invite rows without `emailedAt`, the bell href, `pendingInvites`, a second send reuses the invites); the group rules (audience kind, reach, archived); the unsubscribe link end to end through the HTTP route and the later skip; the invitation email text.
- `OPERATIONS.md`: the notification center section covers addresses, invitations and `unsubscribed`. `EmailPreviews.tsx`: an invitation sample.

**Staff app (kalami-stuff):**

- `NotificationsView.tsx`: the "Email addresses" tab with a textarea (count, bad addresses named, the 200 cap); for addresses or picked people the card "Turn this message into a group invitation" with the group picker; the email card reads "Always on for an invitation"; the preview says how many have no account; the confirmation names the group. `BroadcastDetail.tsx`: "Invitation to <group>" pill, "Invited" marks, "Address" rows for people without an account in reach. Gallery samples updated (`panel-notification` shows an invitation).

**Checks run (2026-10-06):**

- kalami-stuff: `npx tsc --noEmit` clean, `npm run lint` clean, `npx vitest run` 28 files / 272 tests passed (6 new). Deployed to the dev Convex deployment only.
- kalami: `npx tsc --noEmit` clean, `npm run lint` clean, API spec regenerated (nothing student-facing changed).
- Staff gallery `panel-notifications` (the Email addresses tab and the invitation card), `panel-notification` (an invitation's recipients), `emails` (the invitation sample) render; no console errors.

**Limitations / follow-ups:**

- An address that belongs to an account outside a university admin's reach is treated as an address: it gets the email (and the invite), not the bell or push; the recipient list shows it as "Address".
- Invitations are not sent as a separate invite email: the message is the invitation. The group's page lists the invite as pending like any other and can resend or withdraw it.
- An address that unsubscribed is skipped by invites from the group's page too (same suppression list); "Allow again" in System lifts it.
- Not sent from a real signed-in admin session in the browser; dev has no `RESEND_API_KEY`.

### User review

Pending.

## Template for new tasks

Copy this section and add a queue row. Replace `TASK-NNN` with the next unused ID.

### TASK-NNN — Short title

- **Status:** Needs clarification
- **Owner:** Unassigned
- **Reported:** YYYY-MM-DD

#### Problem / reproduction

Record the user role, page, actions, actual result, and expected result. Include a screenshot reference if available.

#### Agreed behavior and scope

Describe what should change and any decisions still needed. Mark `Ready` only when the intended behavior is agreed.

#### Acceptance criteria

- [ ] Observable expected behavior.
- [ ] Relevant access and error cases checked.
- [ ] User tested and accepted the result.

#### Implementation and verification notes

Record changed files, actual checks and results, and remaining limitations.

#### User review

Pending.

## TASK-015 — Animated scenes in lessons: a `scene` block agents build from a validated vocabulary, played with GSAP

- **Status:** Ready for review (asked for 2026-10-07; design agreed in chat and implemented the same day)
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-07

### Problem

Lecturers want their AI assistant to build animated presentations, not only text slides. Letting the assistant write React (or any script) that the apps then run is not acceptable: it would be an XSS surface inside signed-in sessions, could not be validated before rendering, could not be exported to `.kalami`, and lecturers could not edit it.

### Decided by the user (2026-10-07)

- **A declarative scene, not code.** A scene is a list of typed elements on a fixed 1200 × 675 stage, plus ordered steps; each step applies named animations to elements by id (the "nodes linking to each other" idea expressed as data). The backend validates the whole thing; the renderer only knows the vocabulary.
- **GSAP is the animator** (free since the Webflow acquisition, plugins included): one timeline per scene, SplitText for text cascades, DrawSVG for arrows. The existing `motion` package stays for app chrome.
- **A scene is a lesson block** (`type: "scene"`), so the editor, the slide player, the MCP block tools, `.kalami` export/import and course deletion all pick it up. A presentation is a lesson made of scenes.
- An escape hatch for free-form HTML/CSS in the scriptless sandbox iframe is deferred until a real need shows up.

### Implementation notes (2026-10-07)

**The vocabulary** (`kalami-stuff/convex/lib/scene/index.ts`, copied to `kalami/lib/scene` by `sync:student`; `lib/scene` re-exports it in the staff app). A scene is `{ title?, theme?: "paper" | "ink", elements, steps }` on a 1200 × 675 stage.

- Elements (up to 24, lowercase unique ids, `x`/`y` required, `w`/`h` defaulted per kind): `heading`, `text` (Markdown), `list`, `code`, `image`, `shape` (rect/circle/pill/diamond, label), `arrow` (`from`/`to` element ids, `curve`, label; no box, it follows its ends), `number` (counts up), `note` (callout chip). Colours are the design tokens (`ink`, `paper`, `highlighter`, `red-pen`, `ok` …).
- Steps (up to 30, each `note?` + 1–12 actions with optional `at`/`duration`): `enter` (fade, rise, drop, slide-left/right, pop, cascade, wipe, draw, count, type; per-kind default), `exit` (fade, sink, shrink, slide), `emphasize` (pulse, shake, glow, flash, bounce), `focus` (dims the rest; `[]` lifts it), `move` (arrows follow), `camera` (frame an element or a point at a zoom; nothing = home).
- `sceneProblems()` lists every rule a type can't express (ids, dangling targets, positions on the stage, limits). The backend refuses blocks with problems (`convex/model/lessons.ts`), the zod schema runs it in `superRefine` (`convex/lib/contentSchemas.ts`, so the MCP tools, `check_kalami_file` and the JSON Schema all check it), the editor lists the same problems live.
- Also there: `arrowGeometry` (edge-to-edge path with a bow, head angle, label position) and `cameraFor`/`cameraAt` (zoom kept inside the stage), unit-tested in `scene.test.ts`.

**Block plumbing.** `type: "scene"` added to the Convex validators (`lessonBlockValidator` and the input one), the zod `lessonBlockSchema`, `normalizeBlock`, lesson search text (`study.ts`), the shared `LessonBlock` type, the `.kalami` guide (new section **Lessons: animated scenes** with a full example that the guide test parses), and the MCP instructions (when to use a scene; server version 0.7.0). Agents get it through the existing `create_lesson` / `add_lesson_blocks` / `replace_lesson_blocks` / `update_lesson_block` tools and `.kalami` import; no new tool was needed.

**The player** (`components/lessons/scene/`, shared by both apps):
- `SceneView.tsx`: the stage scaled to its width (ResizeObserver), Back / progress / Next under it with the step's note, tap on the stage to move on, a hint to rotate on narrow screens. Built with GSAP 3.15 (free, plugins included): `timeline.ts` turns the steps into one timeline with a label per step end; Next scrubs forward to the next label, Back scrubs backwards, so a step plays in reverse. Reduced motion seeks instantly. The editor changing a scene rebuilds the timeline and keeps the step.
- `elements.tsx`: each element kind in stage pixels; SplitText cascades for headings, line-by-line typing for code, DrawSVG for arrows (head and label laid out from `arrowGeometry`, re-laid on every move frame), counting numbers, focus dimming on an inner layer so it never fights an element's own opacity. Colours use the raw `:root` tokens (`var(--ok)`), not Tailwind's `--color-*` twins, which Tailwind 4 only emits for classes in use.
- GSAP loads through `next/dynamic` only on pages that show a scene; `codeWindow.tsx` holds the code-window pieces `LessonBlocks` and scenes share.
- `LessonSlides`: ← and → now go first to the active slide's `data-stepper` buttons (scene steps, and the Steps block's "Show next step"), and move slides once there is no step left. Slide eyebrow reads "Scene · <title>".

**Editor** (`kalami-stuff/components/lessons-editor`): "Animated scene" in the Add block menu; the block form is the scene's JSON (lecturers mostly get scenes from their assistant) with a Templates menu (4 starters in `scene/templates.ts`: title and points, diagram with arrows, code walkthrough, before and after), a parse error line, and the rule problems under the block; the side preview plays every valid change.

**Galleries:** staff `?view=lesson-editor` (block 10) and `lesson-preview`; student `?view=lesson` (slides 16–19, one per template).

**`create_presentation` MCP tool** (since replaced by TASK-016's deck tools; added the same day at the user's request, so the feature shows up in an assistant's tool list): takes `requestId`, `weekId`, `title` and 1–30 `scenes` (the scene schema itself, so the whole vocabulary is in the tool's input schema), creates a draft lesson of scene blocks through the existing `createLessonAsAgent` mutation and returns `lessonId`, `sceneBlockIds` and the `reviewUrl`. No backend change. The MCP instructions point to it for "a presentation". Test: `lib/mcp/server.test.ts` lists it and calls it with a scene whose step names a missing element; the tool refuses with `scenes.0: steps[0].actions[0].targets: no element with id "server".` before reaching Convex.

### Checks (2026-10-07)

- `kalami-stuff`: `npx tsc --noEmit` clean (app and `convex/`); `npx vitest run` 282 passed (29 files; `create_presentation` test in `server.test.ts`, new `scene.test.ts`, a scene case in `lessons.test.ts`, the guide's scene example parsed in `kalami.test.ts`); `eslint` clean on touched files. `npx convex dev --once` pushed the validators to the dev deployment, then `npm run sync:student`.
- `kalami`: `npx tsc --noEmit` and `eslint` clean on synced files.
- Browser (student dev gallery, lesson view): the four template scenes play on desktop: heading cascades, list stagger, shapes pop, arrows draw with labels and follow a moved box, camera zooms to the DNS node and back, focus dims, code types line by line, numbers count up, notes slide in. → steps through a scene, then moves to the next slide; ← plays a step backwards. 375 px: stage scales, controls wrap, rotate hint shows. Staff editor: the scene block form, the Templates menu, the compact preview following the selected block; invalid JSON shows "Not valid JSON yet."; a bad target id shows `steps[0].actions[0].targets: no element with id "ghost".` and the preview tracks the valid version.
- Not verified in motion: the fourth template was only watched in slow motion because the browser pane was hidden at that point (GSAP's ticker pauses without animation frames). Its end states and colours were checked in the DOM.

### Limitations and follow-ups

- Phones: a 1200-unit stage at 375 px makes body text small; the hint suggests landscape or full screen. A per-scene "stack elements on narrow screens" mode is a possible follow-up.
- No visual editor: lecturers edit JSON or ask their assistant. A drag-and-drop editor would be its own task.
- No free-form HTML/CSS element yet (the deferred escape hatch via the scriptless sandbox iframe).
- The player's own Next/Previous buttons move slides, not scene steps (only the arrow keys and the scene's buttons step).
- Console shows pre-existing "An unknown error occurred when fetching the script." errors on the student dev gallery (service worker in dev), unrelated to this task.

## TASK-016 — Presentations: their own item in a week, typed slides in curated themes, a GSAP player, an editor and agent tools

- **Status:** Ready for review (asked for 2026-10-07; built the same day)
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-07

### Problem

Presentations built from lesson scenes (TASK-015) came out dull: the agent placed boxes by coordinates and picked colour tokens, and the editor showed raw JSON. The user asked for a dedicated presentation feature with GSAP-homepage-level text animation, transitions and colour, and a clean setup.

### Decided by the user (2026-10-07)

- Build the proposal as described, in one go, and polish afterwards: presentations as their own content type in a week next to its lessons; typed slides, each with a designed layout and animation; curated themes; a full-screen player; a form-based editor; agent tools replacing the scene-based `create_presentation`.
- Not answered explicitly: own content type versus a kind of lesson. Built as its own content type (the recommendation).

### Implementation notes (2026-10-07)

**Vocabulary and rules** (`kalami-stuff/convex/lib/presentation/`, synced to `kalami/lib/presentation`, re-exported from staff `lib/presentation`):
- 11 slide types: title, section, statement, points, number, compare, quote, code, image, diagram (flow, cycle, stack, hub), closing. Every slide may have `tone` (`accent` fills it with the theme colour; sections are accent by default) and speaker `notes`.
- 5 themes: ink (default), paper, aurora, ember, chalk. Slide text marks words with `**accent**` and `` `code` ``; nothing is positioned or coloured by hand.
- `deckProblems` lists every problem with where it is; `tidySlide`, `slideSteps` (builds), `sectionNumbers`, `slideLabel`, `deckText`. `geometry.ts` lays out diagrams (edges per layout, node widths, placement, curved or straight connectors) as pure functions.

**Backend:**
- `presentations` table (`by_weekId_and_order`, `by_courseId`).
- `convex/model/presentations.ts`: create (a new one starts as one title slide), save the whole deck (title, theme, slides; every problem reported at once; ids kept), publish and unpublish (lecturer only), delete, and the student read (same visibility rules as lessons).
- `convex/presentations.ts` for the staff editor and the student player.
- The outline (staff and agents) lists presentations. Publishing a week publishes its draft presentations. Removing a week deletes them, and an agent is refused if one is published. The course purge drains them; a failed import discards them. Students' course weeks list the published ones.
- `.kalami` v1 gains `week.presentations` (export, check, import), with a guide section whose example a test parses. Old files still import.

**MCP (0.8.0):** `create_presentation` replaces TASK-015's scene-based tool; also new are `get_presentation`, `update_presentation` and `delete_presentation`. The deck rules run in the tool's input schema before Convex. The instructions send any slides or deck request to presentations; scene blocks stay for one custom animation inside a lesson.

**Player** (`components/presentations/`, synced):
- `DeckPlayer`: slides as layers. Next plays builds, then moves on; Back reverses. Between slides, the old slide rewinds its own entrance while the new one plays, the backdrop's glows travel, and an accent slide fills the stage with a growing circle.
- Keys (and the page takes them without a click), tap and swipe, full screen with a fixed-overlay fallback, controls that hide while presenting, speaker notes, an all-slides overview, replay, and reduced motion.
- `views.tsx`: the 11 layouts in container units. Long text gets a smaller size, and narrow (phone) stages stack.
- `choreo.ts` (GSAP 3.15, SplitText, DrawSVG, CustomEase): masked line reveals, words out of a blur, decoding kickers, counting numbers, typing code with a highlight band and notes, arrows and ticks that draw, accent marks drawn on after their words.
- `Backdrop.tsx`, `themes.ts` and `deck.module.css`: three mark styles (hand-drawn underline, highlighter, chalk loop), drawn with masks.
- `samples.ts`: a 15-slide showcase deck.

**Staff UI:**
- Course outline: a Presentations section per week (theme-chip rows, a New presentation dialog); the publish and remove week dialogs mention presentations.
- Editor at `/courses/[courseId]/presentations/[presentationId]`: a theme picker with live thumbnails; slide cards with a plain form per type, tone and notes; an add-slide menu that inserts placeholder words; a live preview that follows the selected slide; Present (full screen, from the unsaved draft); Save and Ctrl/Cmd+S; publish and delete; changes made elsewhere are picked up or flagged.
- `TitleEditor` and `SaveBar` are now exported from `LessonEditor` for reuse. The agents page copy and the admin activity filter mention presentations.

**Student UI:** a Presentations part in each course week (theme chip, Watch), and `/courses/[courseId]/presentations/[presentationId]` with the player and a not-available state.

**Galleries:** staff `deck-ink`, `deck-paper`, `deck-aurora`, `deck-ember`, `deck-chalk`, `presentation-editor`, `course`; student `course`, `presentation`, `presentation-aurora`, `presentation-paper`.

### Checks (2026-10-07)

- `kalami-stuff`: `npx tsc --noEmit` clean (app and `convex/`). `npx vitest run`: 295 passed (31 files), including `convex/lib/presentation/presentation.test.ts` (9), `convex/presentations.test.ts` (4), the MCP server test for the new tools, the `.kalami` round trip with a presentation, and the guide's example. `eslint` clean on touched files. `npx convex dev --once` pushed to the dev deployment, then `sync:student`.
- `kalami`: `npx tsc --noEmit` and `eslint` clean on touched files.
- Browser, dev galleries at 1280 × 860 and 375 × 812:
  - All 11 slide types in Ink; Paper, Aurora, Chalk and Ember on the title, statement and section slides.
  - Builds on the diagram, points and code slides; transitions leave no ghost layer behind.
  - Phone layouts: title, vertical flow diagram, code with its notes below, stacked compare.
  - Staff outline section and New presentation dialog.
  - Editor: add a slide, the preview follows the typing, the empty-text problem refuses the save, a theme switch, Present overlay and Esc.

### Limitations and follow-ups

- Not verified here:
  - The browser's own full screen: the pane refuses it, though the fallback overlay was verified.
  - Swipe on a real phone.
  - The Caveat and Noto Georgian web fonts: this dev server only served their fallbacks, so Chalk's handwritten headings showed in the fallback face.
- The browser pane pauses animation frames while it's hidden. Verification drove GSAP's ticker by hand through `window.__deckGsap`, which exists in development builds only.
- Presentations keep creation order within a week; there is no reorder or move-to-another-week yet. (Done in TASK-017.)
- The student MCP connector and the student lesson search don't include presentations yet. (Done in TASK-017.)
- The gallery sample's image is a `data:` link, so that sample can't be saved through the backend (images must be https).
- Speaker notes are visible to students behind the Notes toggle.

## TASK-017 — Presentations: reorder and move between weeks; the student study assistant can open and search them

- **Status:** Ready for review (asked for 2026-10-07, after TASK-016's known limits; built the same night)
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-07

### Requested behavior

- Lecturers and agents can reorder a week's presentations and move a presentation to another week of the course (the two TASK-016 limits).
- The student study assistant (the read-only MCP connector) can open a presentation, and its search covers presentations as well as lessons.

### Implementation notes (2026-10-07)

**Reorder and move** (`kalami-stuff/convex/model/presentations.ts`):
- `movePresentation`: up or down within the week (a swap), or to the end of another week of the same course. Another course's week is NOT_FOUND, and a full week (20) is a CONFLICT. Moves between weeks are logged (`presentation.move`).
- `reorderPresentations`: every presentation of the week exactly once.
- Agents only move drafts. They can't swap a draft with a published neighbour, and a reorder must keep the published ones in their order (`keepsPublishedOrder` now knows presentations).
- `presentationsOf` moved into `model/weeks.ts` next to `lessonsOf`, so the two model files don't import each other.
- Public `api.presentations.move`. Agent functions `movePresentationAsAgent` and `reorderPresentationsAsAgent`; MCP tools `move_presentation` and `reorder_presentations` (staff connector 0.9.0, listed in its outline-tidying instructions).

**Staff outline:** each presentation row has up/down buttons and a "Move to…" picker that lists only weeks (a presentation always lives in a week). `MoveToSelect` now takes the item's name, so assessments and presentations share it.

**Student study assistant:**
- `api.study.getPresentation`: published ones only, same rules as the player.
- Search now covers lessons and presentations (a presentation's title and slide words). Hits say which kind they are: `kind: "lesson"` with `lessonId`, or `kind: "presentation"` with `presentationId`. `api.study.findInLessons` became `findInCourses`, with one scan budget for both kinds.
- Student connector (`kalami/lib/mcp/server.ts`): new `get_presentation`, and `find_in_lessons` renamed to `find_in_courses`. The instructions and `get_course` mention presentations, and say speaker notes carry what the lecturer meant to say.
- The assistant page copy and STUDIO.md's tool table are updated.

### Checks (2026-10-07)

- `kalami-stuff`: `npx tsc --noEmit` clean (app and `convex/`). `npx vitest run`: 297 passed (31 files). New tests: move up/down, to another week, never into another course, and agent reorder or move refused around published ones (`convex/presentations.test.ts`); the study connector opening and searching presentations (`convex/study.test.ts`); the MCP tool list. `eslint` clean on touched files. `npx convex dev --once` pushed to dev, then `sync:student`.
- `kalami`: `npx tsc --noEmit` and `eslint` clean on touched files. The student app has no test runner; its connector is a thin wrapper over the tested `api.study` functions.
- Browser (staff gallery, course outline, Week 1): presentation rows show up/down buttons and a "Move to…" picker with weeks only; tasks and quizzes still offer Unplaced.

### Limitations

- Student assistants connected before this change see the old `find_in_lessons` until they reconnect.
- The presentation editor has no week picker; moving happens in the course outline (or through an agent).

## TASK-018 — Presentation files: export one presentation as a .kalami file and import it into any week, on any Kalami

- **Status:** Ready for review (asked for and built 2026-10-07)
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-07

### Requested behavior

Move a presentation "from one platform to another", like a course moves as a `.kalami` file: to another course, another lecturer or another Kalami site.

### Decided

- Read as a file, like course files: `.kalami` gains `"kind": "presentation"` (same envelope, a `presentation` instead of a `course`), version 1 unchanged.
- Export from the presentation's editor; import into a week the lecturer picks, always as a new draft at the end of the week. Kalami signs exported files like course files ("Verified by Kalami").
- Not done: export to other formats (PowerPoint, PDF, Google Slides). Separate work if wanted.

### Implementation notes (2026-10-07)

- **Format** (`kalami-stuff/convex/lib/kalami.ts`): `presentationKalamiFileSchema`, `parseKalamiPresentation`, `presentationSignedPart` (the signature covers the kind, so a course signature never passes for a presentation file), `summarizePresentation`, and a `fallback` for `kalamiFileName`. JSON reading is shared by both kinds. A presentation file given to the course import, or a course file to the presentation import, gets a sentence saying where it belongs. `anyKalamiFileSchema` (both kinds) feeds `/kalami.schema.json` and `get_kalami_format`.
- **Backend** (`convex/model/kalami.ts`): `exportPresentationFile` (anyone on the course's staff; ids stripped; signed), `checkPresentationFile` (the format, then the deck rules through `normalizeSlides`, then the signature on the file as written), `importPresentationFile` (`createPresentation` into the week).
- **Public functions** (`convex/kalami.ts`): `exportPresentation` and `inspectPresentation` (queries) and `importPresentation` (mutation), all staff only.
- **Agents:** `exportPresentationForAgent` and `importPresentationForAgent` (a retry with the same `requestId` returns the same presentation). MCP tools `export_presentation_file` and `import_presentation_file` (staff connector 0.10.0), and the instructions mention presentation files.
- **Staff UI:** Export .kalami in the presentation editor's header (exports the saved version; the button's tooltip says so while there are unsaved changes). Import in each week's Presentations (`components/presentations-editor/PresentationImport.tsx`): drop or choose a file, see its cover in its theme, its slide count and whether Kalami verified it, then import into the week (the editor opens), or read the list of problems (nothing created).
- **Docs:** guide section "Presentation files" with an example the tests parse; KALAMI-FORMAT.md.

### Checks (2026-10-07)

- `kalami-stuff`: `npx tsc --noEmit` clean (app and `convex/`). `npx vitest run`: 300 passed (31 files).
  - New in `convex/kalami.test.ts`: the export → import round trip into another course's week (same slides, draft, verified, no ids in the file); an edited file is unverified; a broken deck lists its problem; a course file refused by the presentation import and the other way round; a hand-written file imports with the default theme; students refused; an agent export and import with a retry; the guide's example parses.
  - `eslint` clean on touched files. `npx convex dev --once` pushed to dev, then `sync:student`.
- Browser (staff galleries): Import in a week's Presentations opens the dialog; a chosen file shows the summary card (cover in Aurora, 15 slides, Verified by Kalami); the error list shows when an import is refused. Export .kalami shows in the editor header.

### Limitations

- Moving between Kalami sites keeps "Verified by Kalami" only when both sites share the same signing secret (`MCP_SERVICE_SECRET`); otherwise the file imports as not verified, which is still fine.
- Pictures stay links: an image slide's picture must stay reachable at its https address.

## TASK-019 — Presentation share links: a public link anyone can watch a presentation with, no account needed

- **Status:** Ready for review (asked for and built 2026-10-07)
- **Owner:** Claude (Claude Code)
- **Reported:** 2026-10-07

### Requested behavior

"Build me a presentation link": lecturers share their presentations' links as they please.

### Decided

- One public link per presentation, like "anyone with the link" in Google Slides. Whoever has it watches the deck in Kalami's player on the student app (`/p/<token>`), signed in or not: the saved slides and who shared it, nothing else of the course.
- The lecturer turns it on with Share in the presentation's editor, chooses whether the speaker notes go along (off by default), can make a new link (the old one stops working at once) or stop sharing. Drafts and archived courses can be shared too: it's the lecturer's call, like publishing.
- Who: the course's owner, the university's admins and the super admin (`requireCourseEditor`). Assistants see the link to copy it but can't change it. Agents see the link (`get_presentation` → `shareLink`) but never turn it on or off.
- Links are unlisted (`noindex`) and live: changes the lecturer saves show up for viewers straight away; a stopped or replaced link says "This link doesn't work any more" and nothing about what it was.
- Not done (ask if wanted): view counts, embedding in other sites (the student app refuses framing), a QR code to show in class, links that expire.

### Implementation notes (2026-10-07)

- **Data** (`kalami-stuff/convex/schema.ts`): `presentations.share` = `{ token, notes, by, at }` while shared, index `by_shareToken` on `share.token`. Tokens are 120 random bits in 20 URL-safe characters (`generateLinkToken`, the same as group join links), checked unique.
- **Model** (`convex/model/presentations.ts`): `sharePresentation` (turn on, change the notes option, or `newLink`), `stopSharingPresentation`, `getSharedPresentation` (validates the token's shape before any lookup; strips speaker notes unless shared; the sharer's name as students see lecturers, never an email). Every change is in the activity log. The staff view of a presentation carries `canShare` and `share`; outline rows carry `shared`.
- **Public functions** (`convex/presentations.ts`): `share`, `stopSharing` (staff) and `shared` (anyone, no sign-in).
- **Staff UI:** Share in the editor's header opens `components/presentations-editor/SharePresentation.tsx`: create the link (with or without speaker notes), then a ticket with the deck's cover, the address, Copy link and Open; the notes option; New link and Stop sharing, each confirmed first. A "Shared by link" pill on the editor and on the outline's presentation rows. `DeckCover` (the cover in miniature) is shared with the import dialog. Gallery views `presentation-share`, `presentation-shared`, `presentation-shared-assistant`.
- **Player:** `DeckPlayer` takes `speakerNotes={false}` (no notes button, no N key).
- **Student app:** `app/p/[token]/page.tsx` (public in `proxy.ts`): the page in the deck's own colours and glows (the browser bar too), title, "Shared by", Copy link (the phone's share sheet on touch screens), Present, the player sized so a 16:9 slide and its controls fit a laptop window, and the address keeps the slide (`#5`). `generateMetadata` gives chats the title and a description; `opengraph-image.tsx` draws the preview card: the deck's cover in its theme (glows, accent mark, Watch), Georgian included (Noto Sans Georgian from Google Fonts), Chalk's title handwritten; a dead link gets a plain Kalami card. Component `components/presentations-reader/SharedPresentation.tsx`; gallery views `shared-presentation(-aurora|-paper|-chalk)` and `shared-link-off`.
- **Agents:** `get_presentation` returns `shareLink` (`url`, `speakerNotes`, `sharedBy`) or null; the instructions say only the lecturer shares. Staff connector 0.11.0. The `/agents` page lists sharing under "Can't".

### Checks (2026-10-07)

- `kalami-stuff`: `npx tsc --noEmit` clean. `npx vitest run`: 302 passed (31 files). New in `convex/presentations.test.ts`: sharing a draft; a viewer without an account gets the deck without notes, then with notes; New link kills the old one; Stop sharing kills it, sharing again makes another; malformed tokens; deleting the presentation kills the link; assistants and students refused; archived courses can share; an agent sees the link. `eslint .` clean. `npx convex dev --once` added the index on dev, then `sync:student`.
- `kalami`: `next typegen`, `npx tsc --noEmit` and `eslint .` clean.
- Browser:
  - Staff gallery: Create link → the ticket, notes toggle, New link (new address), Stop sharing (back to "make a link"), the assistant's view (Copy and Open only).
  - Student gallery: Aurora at 1280×720 (slide and controls 688px tall, title and logo in line with the slide), at 375px (portrait slide, no sideways scroll), no notes button without notes; Chalk's title.
  - Real route on the dev backend: a made-up token opens without sign-in and shows "This link doesn't work any more", with `noindex` and the preview image.
  - Preview images rendered and looked at for Aurora, Chalk, Ember (long title) and a Georgian title, then put back to reading only real links.
- Fixed on the way: Geist draws uneven gaps after long words in the preview renderer (the cards use Inter); capitals in the kicker need their own letters in the font subset; Chalk's page title was scaled from the wrong size.

### Limitations

- Not clicked through with a real link on the dev backend: the pane has no staff sign-in, so the live page with a real deck was checked in the gallery and the backend by tests.
- Link previews need the student app reachable from the internet (production): chats fetch the picture from it. Fonts for the picture come from Google Fonts at request time; without them it falls back to the bundled font (Latin only).
- Production needs the Convex deploy (new optional field and index) and both apps redeployed; reconnect the staff connector to get 0.11.0.
