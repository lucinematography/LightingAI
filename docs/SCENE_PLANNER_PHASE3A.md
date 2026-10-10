# Scene Planner Phase 3A — local approval candidate

Based on `1f3fdc07be9f96a8050e67e6edadfc7dbb482598` on
`feature/ai-scene-planner-mvp`. PR #414 remains OPEN / DRAFT.
No commit, push, deployment, physical fixture command or paid provider request
is part of this work.

## Revision contract

The existing shared `scene-planner-core.js` runs as an Android asset and as a
CommonJS module loaded by the ESM backend. `createRevision(raw, input, source,
parent, sceneId)` validates through the existing inventory/range sanitizer and
returns a deeply frozen snapshot, without changing the parent or caller input.

Each snapshot contains `schemaVersion`, `sceneId`, `revisionId`,
`parentRevisionId` (null for the root), `lightPlotRevisionId`, `sequence`,
`nextLightId`, `planHash`, and the complete validated `plan`. The plan includes
every supported light setting, camera settings and position, actor blocking,
scene geometry/location, DoP request, constraints and structured `dataStatus`.
Camera overrides are `dop-specified`, not measured exposure. Dimensions and
coordinates are `confirmed-by-user` only when the corresponding user check and
values exist. Light positions/output, blocking and exposure remain estimates;
owned inventory is user declared, not an independent on-set measurement.

Canonical JSON v1 sorts object keys recursively, preserves array order and
uses JSON number/string serialization with UTF-8 SHA-256. Undefined, cycles,
non-finite numbers and non-JSON objects are rejected. The entire validated plan,
including provenance, is hashed; IDs and sequence live outside that plan.
`revisionId` hashes the scene, parent, sequence, identity allocator, schema and
plan hash. `lightPlotRevisionId` identifies the plot for that exact revision.
Repeating an identical root input and scene gives the same identity; a new
revision always advances sequence and parent identity, even if its plan is
identical. Hashes check content integrity; they are not signatures or proof of
physical accuracy. Photos/video bytes and save timestamps are outside the hash.

Light IDs identify instances, while `fixtureId` identifies the fixture model.
Explicit prior IDs are retained only for the same fixture. Without explicit
IDs, a unique fixture/role match can retain identity. Ambiguous duplicates get
new IDs. Reordering and explicit role changes preserve identity; replacement
fixtures get new IDs. The allocator is monotonic across revisions, including
revisions that remove every light, so retired IDs are not reused.

## Application and compatibility

### Blocking light-identity correction before commit approval

Final review reproduced an ISO-only revision changing L13–L16 to L17–L20.
`request()` kept only 12 previous lights while the plan sanitizer accepted 16.
Identity matching therefore could not find the last four fixtures and allocated
new IDs from the parent's monotonic `nextLightId`. The previous-light projection
also shortened fixture IDs to 120 and names to 150 characters, versus 150/180
in the validated plan; long identities could fail matching even within 12 lights.

A shared internal `MAX_LIGHTS = 16` now bounds previous-plan context, candidate
sanitization and revision validation. Previous fixture ID/name limits match the
validated plan. Identity allocation and inventory/capacity checks are unchanged.
The limit stays 16. Repeated ISO revisions of 12-, 13- and 16-light plans in both
owned and proposed modes compare every validated light field, camera values,
hashes, parent links and prior snapshot bytes. Full-capacity edit/removal/addition,
reordering/replacement and overflow tests protect against identity theft and
limit changes. A mocked-provider UI regression checks all 16 fixture IDs,
models and positions in the technical cards and plot, along with exact plot/hash
binding and updated ISO. No real provider is called.

The current revision's frozen `plan` is the sole input to the SVG light plot,
technical light cards, camera cards and previews. The UI displays revision/plot
identity and SHA-256. JSON export retains the existing top-level `plan` and
format marker for compatibility and adds the complete revision history.
`lighting_scene_planner_revisions_v1` stores the history separately from the
legacy last-export key. On reopen, every snapshot and parent chain is checked
and refrozen. Corrupt/unreadable history blocks generation and overwriting.
Storage quota/write failures are visible; the in-memory history remains
available for JSON export. There is no automatic history pruning.

This foundation stores one active scene history per WebView storage context.
It does not add a multi-scene browser, server revision database, authentication,
cross-device synchronization or automatic migration of old unversioned exports.
Save JSON as the durable, user-controlled copy; localStorage can be cleared by
the platform and can fill up with long histories. A new scene can be constructed
through the shared API with a new sceneId; a UI scene library is future work.

The hash implementation uses synchronous JavaScript, without `crypto.subtle`,
secure contexts, `TextEncoder`, fetch or native bridges. It therefore has no
browser-crypto dependency in Android `file:///android_asset/`. Offline VM tests
run the browser branch without any of those APIs and compare the exact result
to the backend/Node implementation. Actual device WebView execution, Android
lint/unit tests and APK packaging still require the Android toolchain/device.

The existing plan endpoint and paid video routes/receipts/database schema are
unchanged. The model prompt asks to preserve light IDs. Shared code and the
existing backend model-contract tests exercise compatibility. The new offline
test is part of `npm run check`, which the existing CI backend gate already runs.
The stable-base guard admits exactly the new revision self-test and this document.
All other path restrictions, historical comparisons and workflow protections remain.

## Future MP4 boundary and Phase 3B

`videoRevisionBinding(revision)` returns a frozen, validated reference containing
`sceneId`, `revisionId`, `lightPlotRevisionId` and `planHash`. It is intentionally
not wired into the paid workflow yet. Future jobs must capture this binding
before submission and persist it with the input-video identity, provider/model
version and output MP4 receipt. Later plan changes must never rebind an earlier
output. Resolve the referenced snapshot and check its hash before displaying a
video with a plot. The exact source snapshot must remain available in durable
storage before enabling this integration.

The next step is temporally consistent Day-for-Night relighting of the original
video, preserving frame timestamps, camera motion, actor identity and blocking.
Use shot-aware motion/depth/mask tracking and temporal constraints to maintain
shadow direction, softness, occlusion and contact shadows, with consistent skin
tones, white balance, highlights and color across frames and cuts. Test for
flicker, drifting masks, ghosting and frame discontinuities on approved fixtures.
These are requirements for future work, not claims about the current preview.

A DoP change must create a new immutable plan revision, with stable light
instance IDs and explicit camera/light overrides. A subsequent video job binds
to that new revision; earlier MP4s remain attached to their original plot.
Evaluate the resulting MP4 against the original footage and exact revision,
including documented compromises and unconfirmed measurements. Enable paid
execution only after separate approval and verification of the existing safety
gates. Local conceptual previews remain labeled as conceptual previews.

## Local validation

Use Node 22 and the already-installed backend dependencies. No network or API
keys are needed for the regression suites:

```text
npm run test:scene-planner-revisions
npm run check
npm run test:project5-safety
npm run test:project5-base
npm run test:project52-release
node project-backup-selftest.js
node --test ../scripts/ci-autofix-selftest.mjs
npm run test:scene-planner-postgres-preflight
git diff --check
```

Actual PostgreSQL integration requires a disposable test server and
`SCENE_PLANNER_POSTGRES_TEST_URL`; preflight alone is not that integration.
Android checks require Java 17, Gradle 8.9, SDK 35 and an Android device/emulator
for the runtime smoke test. No toolchain/server installation is authorized here.

Initial validation on 2026-10-10 with existing portable Node 22.23.3: all 13 revision
regression groups passed, full `npm run check` passed (including 47 phase-2
video tests with mocked providers), all 23 CI-autofix regression tests passed,
including the complete candidate's isolated future-commit guard. Project 5
safety, stable-base, release, backup and the three PostgreSQL preflight checks
passed. Syntax checks passed for all 54 Android JavaScript assets, and
`git diff --check` passed. An intermediate UI test compared unsorted JSON text;
it was corrected to compare canonical JSON, and the final suite passed.

Android SDK/Gradle/adb and a configured disposable PostgreSQL server were not
available. Device execution, Android lint/unit tests/APK build and real-server
PostgreSQL integration were not executed locally. Remote CI and the registry
dependency audit were not triggered. GitHub read-only verification confirmed
PR #414 OPEN / DRAFT at the expected branch and base commit. The source
repository HEAD remained unchanged throughout; isolated CI test fixture commits
do not commit the user's branch.

After the blocking identity correction, all 18 revision regression groups pass
(the original 13 plus five capacity/edit/UI groups). The new tests failed before
the fix and pass with the shared 16-light limit and aligned identity lengths.
Full backend `check`, the existing video regressions including all 47 phase-2
tests, all 23 CI-autofix tests, Project 5 safety/stable-base/release, backup,
three PostgreSQL preflight tests, syntax checks for 54 Android assets and
`git diff --check` pass again. No remaining local test failures. Android
SDK/Gradle/adb and the disposable PostgreSQL test-server configuration remain
unavailable. PR #414 is confirmed OPEN / DRAFT with the original HEAD. This
correction changes only the core, revision self-test and this document within
the eight pending Phase 3A files. No source-branch commit or push is performed.
