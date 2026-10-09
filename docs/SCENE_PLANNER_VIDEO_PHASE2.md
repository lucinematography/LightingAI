# Scene Planner video phase 2 — local candidate

## PostgreSQL CI correction after commit 7291c312

PR run `37983989543` failed the unchanged three-request/two-slot test: two mocked
provider calls occurred, but only one HTTP 200 receipt returned. PostgreSQL logged
a serialization failure at commit. The reservation was explicitly READ COMMITTED,
but `submitted`, `unknown`, `updateTask` and upload inserts used pool autocommit
queries, inheriting the fixture's deliberately SERIALIZABLE default. Concurrent
receipt writes could therefore abort after provider acceptance. The CI log does
not record the complete SSI dependency graph or the exact statement canceled.

All adapter mutations now use short READ COMMITTED transactions, synchronous
commits and the existing singleton gate. The original atomic reservation, two-slot
limit and protected terminal-state predicates remain. Provider network operations
stay entirely outside transactions and retry loops. `submitted` first reads the
durable receipt: an identical task is idempotent; a different task or incompatible
state is rejected without overwriting it.

Only PostgreSQL SQLSTATE `40001` with a successful rollback permits a DB-only
transaction retry: at most three attempts, with 25/50 ms delays after releasing
the client. Each attempt rereads current data. Connection loss, ambiguous COMMIT,
failed rollback, unique violations and other errors are not retried. Exhausted
receipt writes retain the reservation/review state, never repeat a provider POST.

Eight additional local regression checks cover SQL-engine-generated 40001,
bounded persistent failure, restart/reconciliation, lost COMMIT acknowledgement,
reservation retries, conditional status/unknown updates, duplicate task identity,
failed rollback and explicit mutation isolation. Existing 39 tests remain.
The real-server suite retains its original HTTP 200/200/429 expectations and
SERIALIZABLE defaults. It adds a deterministic genuine SSI conflict with overlapping
read sets, plus server-generated 40001 recovery/exhaustion scenarios. These new
real-server cases still require an approved GitHub Actions run; local PostgreSQL
and Docker are unavailable. No additional allowlist paths or workflow changes are
required. No commit, push or paid provider call is performed for this correction.

No production service/database is provisioned or enabled by this change. All
provider tests are offline mocks. PR #414 must remain draft until explicitly approved.

## Durable paid-job boundary

`scene-planner-job-store.js` exports the explicit PostgreSQL schema and adapter.
An operator must apply `VIDEO_JOB_SCHEMA` to a dedicated, access-controlled database
before enabling video. Runtime verifies the schema and never creates infrastructure.
Set `SCENE_PLANNER_VIDEO_DATABASE_URL` through backend secret configuration only;
never put connection URLs, Runway credentials or the video access token in Git,
client storage or CI artifacts. Use a restricted application database role after
the schema is applied. External connections validate TLS certificates. Only set
`SCENE_PLANNER_VIDEO_DATABASE_TLS=internal` for a verified Render private connection
in the same workspace/region. No TLS bypass is used for external connections.

The existing video-enabled flag, paid-AI kill switch and bearer authorization
remain mandatory. Missing/unhealthy durable storage blocks uploads and paid starts.
Pool limits: four connections, 3-second connection timeout, 5-second statement
timeout, 6-second query timeout and 5-second idle transaction timeout.

A singleton database row is locked in an explicitly READ COMMITTED transaction. That transaction checks
request/upload uniqueness and the global two-job limit, then durably commits the
SUBMITTING receipt with `synchronous_commit=on` **before** the provider POST.
The pool also enforces synchronous commits for upload/task/status writes.
There is exactly one provider start attempt. Concurrent replicas use the same
database gate; a second request for an upload cannot fund another job. Runway
status GETs have a 10-second timeout, starts 90 seconds, transfers 120 seconds,
and no automatic provider retries.

Known task IDs survive restart and are recovered through authenticated
`GET /request/:requestId` and `/status/:taskId`. Before reserving new work, known
active task statuses are refreshed. Failed/unknown polls block new paid starts;
SUCCEEDED/FAILED/CANCELED release slots. Terminal states cannot be overwritten by
a stale poll. SUBMITTING/UNKNOWN without a task ID retain their slot, including
after restart or expiry. They need operator reconciliation against the provider's
records. There is no automatic resubmission, deletion or refund assumption.
If provider success cannot be saved, the durable reservation remains blocked.

All upload records/URIs expire after one hour, including consumed uploads. Their
identifiers remain reserved in request tombstones. Terminal media URLs/status metadata expire after seven days. Minimal
request/upload/task identifier tombstones remain indefinitely to prevent expired
idempotency keys causing another charge. Unresolved requests never expire into
free slots. Pruning is demand-driven; an operator may schedule the same cleanup
SQL later, without deleting tombstones or unresolved work. Storage sizing and an
operator reconciliation procedure must be reviewed before production activation.
The current access model is one administrator bearer token; this is not tenant
isolation or end-user billing. Task and upload records are intentionally global.

## Server-side media proof and current format limits

`scene-planner-media.js` runs with Node 22 alone, including on Render; it does not
assume `ffprobe`, invoke a shell, load remote media, or persist private clip files.
The 40 MiB limit applies before bounded parsing. The duration comes from actual
ISO-BMFF track sample timing and sample locations, cross-checked against track and
movie duration. Video/audio timelines must agree; samples must reside inside
non-overlapping mdat ranges. MIME/signature checks remain. The client duration
header is ignored. Corrupt/truncated tables, external data references, multiple
video tracks, impossible sample counts/offsets and durations outside 2–30 seconds
fail closed before upload to Runway.

Supported subset: non-fragmented MP4/MOV, one avc1/hvc1/hev1/mp4v video track,
optional sound tracks, version-0 movie/track headers, no edit lists and no nonzero
composition offsets. WebM, fragmented recordings, edit lists and common B-frame
composition timelines currently require re-export. The UI continues to allow
local planning of other videos; paid upload gives an explicit format error.
This analyzer validates container timing/structure, **not codec decoding** or
visual authenticity. Synthetic tests prove tables/ranges, not production camera
compatibility. Before wider format support, add reviewed, pinned media tooling
with real camera fixtures, bounded decoder execution and Linux Render validation.

## Android and reopen

Save calls the existing native SAF streaming bridge first and returns without
fetch/blob. Preview is a separate, explicit action. No storage permissions change.
Legacy Android 8–9 app-owned camera captures are retained while in use; replacement
releases older captures, close/destroy releases tracked captures, and startup removes
owned captures older than 24 hours after an interrupted session. Cleanup checks
canonical parent and strict capture filename; gallery and MediaStore outputs are
not deleted. Real-device capture/SAF lifecycle testing is still required.

The browser receipt contains only random request/upload/task IDs and known status.
It is saved synchronously before submitting paid work. Storage failure prevents
that submission. It stores no token, prompt, frame, plan, URL or private provider
response. Reopening requires re-entering the access token; status/reconciliation
uses GET only. Unresolved or malformed receipts block another paid start.
Each new generation still needs a fresh checked paid confirmation. Clearing app
data loses local receipt discovery; it cannot erase database idempotency protection.

## Verification and remaining production gates

`npm run test:scene-planner-video-phase2` executes the genuine schema and adapter
SQL in disk-backed PGlite with only mocked provider calls, plus browser VM behavior.
It tests reopen/restart, concurrent routers, shared limits, ambiguous outcomes,
expiry/tombstones, stale polls, private error suppression and media corruption.
PGlite has one serialized connection. A separate real PostgreSQL integration suite
is now mandatory in the debug GitHub Actions workflow, using an ephemeral
`postgres:16` service container. It has not been executed locally because PostgreSQL
and Docker are absent. It is not a production failover or Render deployment test.

`npm run test:scene-planner-postgres` launches two independent Node child processes
with separate real `pg.Pool` instances, a dedicated `lightingai_ci_test` database
and a random validated schema. The pool's default isolation is SERIALIZABLE to
exercise the adapter's explicit READ COMMITTED reservation transaction. It tests
concurrent reservation/idempotency, one upload/one charge, global two-slot capacity,
upload/task recovery after application restart, actual `pg_terminate_backend`
connection interruption during reservation, loss of the client pool after provider
acceptance, hard process death during an ambiguous paid call, timeout/invalid
provider answers, expiry, terminal slot release and unknown provider statuses.
All AI responses are fixtures; no worker has a network-fetch fallback. Missing
PostgreSQL or an unsafe URL is a failure, never a skipped/passing integration test.
Only a loopback host with the dedicated database and role is accepted. Cleanup
drops only that suite's validated random schema. No Render resources are created.

The service is job-scoped, health-checked and has no persistent volume. Its fixed
password is public, disposable test configuration, not a production credential.
The integration step has a five-minute timeout, no `continue-on-error` and no
conditional skip. Existing lint gate, all JUnit tests (including the three capture
cleanup tests), debug APK, dependency audit and sanitized report uploads remain.
`npm run test:scene-planner-postgres-preflight` can run without PostgreSQL: it
checks three groups of URL/schema safety, mandatory workflow/Android wiring and
absence of a real-provider fallback. These checks do not claim real-server success.

The stable-base allowlist adds only the named adapter/parser/test/document paths;
the isolated candidate test commits all phase-2 files in a temporary clone, then
runs the unchanged historical, protected-file, permission and catalog guards.
Unknown paths, protected content and unauthorized permissions must still fail.

No commit/push/deploy or production activation is authorized for this phase.
Android CI uses Temurin 17, Gradle 8.9 and compile SDK 35; local missing tools are
reported, not installed. Full Android lint/build/unit results need a subsequently
approved GitHub Actions run.

Local verification: 39 phase-2 Node tests and 23 CI-autofix tests passed; `npm run
check`, existing Scene Planner suites, Project 5 safety/base, release gate, backup,
65 JavaScript syntax checks and `git diff --check` passed. The three PostgreSQL
preflight groups also passed; the real-server suite remains pending GitHub CI. The isolated candidate
and all three negative guard fixtures passed their expected outcomes. Dependency
install audits and cached offline audit reported zero vulnerabilities. The known
credential/private-key pattern scan covered all 19 candidate files with no matches;
browser tests prove the access token is absent from the saved receipt. Existing CI
artifacts remain restricted to APK output and numeric sanitized report summaries.
No raw private logs/media are added to artifact upload paths.

Temurin/JDK, Gradle 8.9 cache and SDK 35 were absent locally. Three new JUnit
cleanup tests are written for the existing `testDebugUnitTest` CI step but have
not been executed locally. Android compilation/lint/device behavior, true
multi-process PostgreSQL contention/failover and actual Render runtime deployment
are not verified by these local tests. Two ambiguous requests intentionally block
all paid capacity until an operator resolves them; tombstone retention needs a
storage policy that preserves the no-recharge guarantee.

Changed files (19; all original 16 preserved, with one existing workflow and two new integration fixtures):

- `app/src/main/assets/scene-planner.js`
- `app/src/main/java/com/lightingai/app/MainActivity.java`
- `app/src/main/java/com/lightingai/app/ScenePlannerCaptureCleanup.java` (new)
- `app/src/test/java/com/lightingai/app/ScenePlannerCaptureCleanupTest.java` (new)
- `backend/package.json`
- `backend/package-lock.json`
- `backend/project5-stable-base-selftest.js`
- `backend/scene-planner-video.js`
- `backend/scene-planner-video-selftest.js`
- `backend/staging-safety-selftest.js`
- `backend/scene-planner-job-store.js` (new)
- `backend/scene-planner-media.js` (new)
- `backend/scene-planner-video-test-support.js` (new)
- `backend/scene-planner-video-phase2-selftest.js` (new)
- `scripts/ci-autofix-selftest.mjs`
- `docs/SCENE_PLANNER_VIDEO_PHASE2.md` (new)
- `.github/workflows/build-apk.yml`
- `backend/scene-planner-postgres-selftest.js` (new)
- `backend/scene-planner-postgres-worker.js` (new)

Implementation references: [node-postgres transactions](https://node-postgres.com/features/transactions),
[TLS](https://node-postgres.com/features/ssl),
[Runway API](https://docs.dev.runwayml.com/api/),
[GitHub PostgreSQL services](https://docs.github.com/en/actions/tutorials/use-containerized-services/create-postgresql-service-containers). The PostgreSQL adapter uses a
single checked-out client per transaction and never uses pooled queries inside
that transaction.

## Technical plan for the next phase (no paid activation)

1. **Proof gates first.** Run the real PostgreSQL suite and existing Android
   lint/JUnit/debug build after an approved push. Record the exact commit/run IDs.
   Add real camera MP4/MOV fixtures covering edit lists, B-frame composition,
   rotation, variable frame rate and damaged codec payloads. Validate bounded
   decoding on Linux before expanding the current parser's accepted formats.
2. **Versioned DoP intent.** Give each scene, plan revision and immutable light plot
   an ID. Store camera exposure (fps, shutter, ISO, aperture, ND, WB), motivated
   key/fill/rim direction, CCT/color, intended contrast and director's textual
   revision as a versioned structured object. Hash a canonical snapshot. Freeze
   that snapshot before any confirmed paid job; a revision creates new intent,
   never mutates an existing charged request or automatically resubmits it.
3. **Temporal Day-for-Night contract.** Normalize a proven clip timebase and track
   scene cuts, camera motion and occlusions. Specify stable exposure/color/shadow
   targets across the complete timeline, with explicit exceptions at motivated
   cuts. Preserve actors, faces, performances and geometry. Evaluate against
   controlled reference clips; do not infer physical accuracy from model output.
4. **Measurable acceptance.** With mocked provider MP4 results, test adjacent-frame
   luminance/chroma drift, exposure pumping, shadow-direction changes, face/texture
   artifacts, output frame count/duration and cut boundaries. Define thresholds
   together with a cinematographer. Keep deterministic numerical checks separate
   from the required human side-by-side review; both can reject a result.
5. **MP4/light-plot provenance.** Add a migration linking request/task and immutable
   plan/light-plot revision IDs, input/output content digests, verified duration,
   model/config version and review outcome. Generate an export manifest beside
   the final MP4 containing only approved plan/plot metadata, never signed provider
   URLs or tokens. Test mismatched revision/hash rejection and reopen/download
   preserving the same binding. Expiration must not break the minimal provenance
   receipt or idempotency tombstone.
6. **Controlled rollout.** Build mocked end-to-end tests and Android SAF manifest
   export first. Only later, after a separate explicit approval, select a paid
   model and run a bounded pilot with cost confirmation and a kill switch. Do not
   enable retries on unknown paid outcomes or change physical lighting controls.

Readiness here means **ready for the first GitHub CI execution**, not proof that
the real-server or Android tests have already passed. Production activation still
requires those results, reviewed media support, operator reconciliation, database
access/retention policy, and a separately approved deployment.
