# Kalami application review and materials repair

Date: 4 October 2026. This updates the earlier audit with current code and live
course evidence. It is a cross-application health review with a detailed trace of
materials, not a new exhaustive security audit or a substitute for student testing.

## Confirmed live cause

The production course **Basics of Web Technologies (ICT14708E2-LBK)** is published
and has one active enrollment. Weeks 1–3 and their six lessons are published;
weeks 4–13 and their 22 lessons are drafts. The three published weeks had Drive
folder IDs but no recorded sharing permission, no active job and no error.

`convex/model/weeks.ts:publishedWeeks` intentionally omits a Drive URL until its
permission exists. The student page renders those returned links correctly. The
legacy `materials` field is derived from the same weeks, so omitting that legacy
field from the new UI is not a bug.

The confirmed reproduction is: publish a week without a folder, then add its Drive
folder. Creation completed without scheduling sharing. An additional staff UI bug
described that folder as waiting for publication, even though the week was already
published, and offered no Retry button unless an explicit error existed.

## Changes

- Repaired sharing on the three existing production folders through the existing
  Drive action. All three now have recorded permissions and no Drive errors.
- Folder completion now schedules sharing if the current week is published. It
  uses the latest database status so a week hidden in the meantime remains private.
- Staff UI identifies a published-but-private folder as a problem and offers Retry.
- Added regression coverage for adding a folder after publication, duplicate retry,
  and a week hidden before folder creation completes. The first regression failed
  before the fix and passed afterwards.

## Prepared materials

Prepared and uploaded 13 Markdown reading files covering all 28 current lessons.
The three published files are in the existing shared week folders. Ten draft files
are in a separate private `Draft reading files` folder inside the private course
folder. Downloaded every uploaded file and compared its SHA-256 hash; checked
published file link-read permissions and absence of broad draft sharing.

Course folder: https://drive.google.com/drive/folders/15Fo-H673_5e3VJ52D83IDY46TLUnRhlV

Local files and upload receipts: `artifacts/course-reading/`. These generated files
are ignored by Git. Reusable admin script and instructions are in the staff repo:
`scripts/prepare-reading-files.mjs` and `OPERATIONS.md`.

These are exports of the existing teaching material, not newly researched lessons,
native Google Docs, PDFs or an automatic sync. The MCP drafting permissions remain
unchanged. An AI can prepare Kalami lessons; this admin script handles exports and
uploads. Publishing additional weeks is still a separate lecturer action.

## Application health checks

| Area | Evidence from this review |
| --- | --- |
| Student and staff apps | Both production builds succeed; both lint checks pass |
| Types | Both app checks and the separate Convex TypeScript check pass |
| Backend and MCP tests | 18 files, 176 tests pass |
| Dependencies | Both `npm audit --omit=dev` reports show zero known vulnerabilities |
| Enrollment and visibility | Active enrollment required; draft courses/weeks/lessons remain hidden; group and lesson tests pass |
| Exams | Existing tests now cover closing grace, server clock, stable option IDs, frozen question structure and failed grading limits |
| Autosave | Current source requeues failed batches, keeps tab drafts and checks the save result before quiz submission; browser fault testing still needed |
| AI connector | Tests cover draft-only changes, course access, import validation and idempotent import retries |
| Operations | CI, nightly backup workflow, rate limits and deploy guard exist; successful remote workflow runs and restore remain unverified |

The earlier STATUS and AUDIT documents describe several features as absent that
now exist: weeks, lessons, groups, email, import/export, CI and backup workflows.
Their historical findings should not be treated as current without rechecking.

## Remaining work and testing boundaries

1. Test tomorrow with an actual student browser: sign in, open the enrolled course,
   read all six published lessons, open weeks 1–3 Drive folders, and confirm draft
   weeks remain absent. A whole missing course is a separate enrollment/account
   issue; the observed production defect concerns missing Drive materials.
2. Exercise quiz autosave with a connection drop and reload, then submit. Backend
   tests do not establish real-browser reliability or mobile behavior.
3. Confirm remote backup jobs succeed and perform a restore drill; inspect actual
   deployment settings, monitoring and staff MFA separately.
4. The admin export is manual. Draft reading files are not moved into student
   folders on publication; rerun it after publishing. Changed content creates a
   new snapshot without deleting previous files.
5. Run a separate full security and load review before high-stakes deployment.

The production folder repair is verified and the backend fix is deployed to
`strong-lyrebird-617`. The deploy guard reported no active or imminently closing
exam; the deployment passed type and schema checks with no deleted indexes.
The staff warning/Retry UI changes remain local. No student browser session or
Vercel frontend deployment was performed as part of this review.
