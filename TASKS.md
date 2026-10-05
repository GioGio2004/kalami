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
