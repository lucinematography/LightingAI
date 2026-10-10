# Phase 3B.1: offline temporal video architecture

Local candidate based on `a8b14c7c3b05e90244d7df178e677da03fc30a4e`.
Branch `feature/ai-scene-planner-mvp`, PR #414 OPEN / DRAFT.
No source-branch commit/push, paid request, deployment, new installation or
physical fixture control is authorized for this phase.

## Operational contract

`backend/scene-planner-temporal.js` is an isolated ESM module using the existing
shared revision core. It is not imported by server routes or the Android UI.
It performs deterministic validation of supplied metadata, not video analysis.
It has no decoder, file access, provider call, database change or media writer.

`createTemporalPlan(raw, revision, previous, previousRevision)` creates a deeply
frozen JSON snapshot. Optional parent arguments are required together when
revising a temporal plan; the new lighting revision must be the direct child
of the old bound revision, in the same scene and for the same source video.
It validates the previous temporal model against its actual prior snapshot.
DoP changes first use Phase 3A `createRevision`, then construct the child temporal
plan. Old models, plans and light IDs are never edited. A caller starting a new
temporal chain may omit the parent arguments; this API does not persist history
or prevent that caller from omitting a history it should have supplied.

`verifyTemporalPlan(model, revision)` checks canonical SHA-256 content and the
exact revision via existing `videoRevisionBinding`. A changed scene, revision,
plot identity, plan hash, temporal version or forged body is rejected.
`parentTemporalHash` is an integrity link, not an authenticated signature;
verify the actual parent chain using retained snapshots when restoring history.
`resolveTemporalPlan` returns a deeply frozen copy of the validated revision's
complete plan. Technical cards and 2D plot consumers must use this same `plan`.
This is an offline resolver contract; the existing UI already uses its Phase 3A
revision and has not been wired to temporal schedules in this phase.

Every model contains `temporalModelVersion`, `sceneId`, `revisionId`,
`lightPlotRevisionId`, `planHash`, `sourceIdentity`, parent link and temporal hash.
The source identity is `sha256:<64 lowercase hex>` computed outside the module
from original bytes by a trusted future ingestion layer. No filename, path,
URL, token, image or video bytes are accepted. A content hash identifies bytes;
it does not prove authenticity and may permit correlation across records.

## Time and evidence

Optional `timing` contains positive integer `ticksPerSecond`, integer
`durationTicks`, `origin: original-pts`, and provenance. Frame records contain
presentation-order `index`, original `ptsTick` and `durationTicks`. The module
never synthesizes timestamps from FPS, browser seek times or six still images.
It accepts VFR and sparse lists, rejects duplicate/reversed/overlapping times,
duplicate/reversed indices, non-finite/fractional ticks and out-of-range data.
Intervals are half-open `[startTick, endTick)`, within duration.
Version 1 supports nonnegative, zero-origin timelines only. Negative/nonzero
container PTS origins, decode order/DTS and timestamp transforms require a future
explicit origin/mapping contract; do not silently normalize and call it original.
Frame indices need not be consecutive for partial input.

`complete-timing-only` requires consecutive indices and gap-free frame coverage
from zero to duration. It makes no claim about decoded pixels. Gaps yield
`partial-timing`; absent timing/frames yield `unknown`. No supplied metadata is
promoted to a measurement: status is `caller-asserted`, `synthetic` or `unknown`.
Trusted provenance is explicitly `decoded-video`, `manual-verified` or
`synthetic` on timing, shots and observations. These labels are assertions from
the caller, not verified by the validator. Production ingestion must authenticate
the source of those assertions; do not accept them directly from an untrusted
client as proof. Synthetic test data are always labeled synthetic.

Shot IDs/ranges are explicit supplied boundaries; they cannot overlap, repeat
identity or cut through an available frame. Missing shots remain an empty list,
not fabricated shot detection. Gaps in shot coverage are allowed and unknown.
Observations carry time range, opaque subject ID, value and provenance:

- Camera motion: static, pan, tilt, translation, rotation, mixed or unknown.
- Actor positions: normalized image x/y, explicitly not metric 3D positions.
- Visibility: visible, partial, occluded or unknown.
- Reference sources: sun, sky, practical, key, fill, moon-backlight or unknown.

Observations must be chronological within each kind/subject stream; overlapping
or reversed intervals in that stream are rejected.
There is no interpolation across missing observations or occlusions, identity
recognition, inferred trajectory, depth estimation or shadow reconstruction.
Camera/actor status remains unknown when no corresponding observations exist.
Reference source observations are separate from intended light-instance roles
stored in the bound revision.

## Creative lighting continuity

Time intervals specify target subject IDs, exposure offset in stops, white
balance, key direction/softness, intended moon/backlight and individual light
intensity/CCT/hex color. Fixture IDs must exist in the bound revision and cannot
be repeated. Full fixture model, geometry, modifiers and camera settings stay
in that single immutable plan. Target IDs are creative intent; their existence
does not imply a verified track. Null numeric/color values and `unknown` enum
values represent unknown intent. No photometric measurement is inferred.

`hold` intervals must retain identical intent from the previous interval;
changes require explicit `dop-edit` or `cut-exception`. Cut exceptions require
an explicit contiguous shot boundary at that exact tick. `lightingCoverage`
distinguishes complete intent, partial intent and unknown. Schedules define
piecewise intent only: they do not interpolate fades or execute relighting.
The temporal hash covers the schedule as well as binding and evidence. All
schedule edits must follow the child-revision contract in an application that
retains the prior model. Cryptographic integrity is not physical accuracy.

## Existing pipeline review and limits

The paid path in `scene-planner-video.js` accepts 2–30 seconds, 512 bytes–40 MiB.
Although MIME declarations/capabilities list MP4/MOV/WebM, actual binary
validation rejects WebM (unverified timing). MP4/MOV are accepted only within
the bounded non-fragmented ISO-BMFF parser subset. Fragmented files, edit lists,
compressed metadata and unsupported timing layouts fail closed. The parser
checks tables/sample ranges and duration; it does not decode frames, expose
original presentation timelines or measure optical continuity. Do not derive
temporal input from its returned duration alone.

The UI extracts six browser-seek JPEG references, for videos up to 120 seconds.
Those are neither original frame PTS nor proof of whole-video analysis. Paid
video has its separate 2–30-second guard. Existing storyboard/conceptual WebM
outputs remain conceptual and cannot be labeled actual AI video relighting.

Paid authorization, enable flag, kill switch and durable-store readiness gates
are unchanged. Request/upload uniqueness, shared transactional two-slot limit,
durable reservation before exactly one provider start attempt, no provider
retry and unresolved receipt tombstones remain intact. Database-only bounded
40001 retries do not repeat the provider POST. No paid route or production
PostgreSQL schema is changed by this architecture.

## Future processing and MP4 provenance

Phase 3B.2 should first define and approve a real decoded-frame ingestion
boundary: supported codecs/container subset, decoder/tool availability,
presentation timebase/origin mapping, input hash, audio synchronization,
frame count/order and shot evidence. Use approved offline real-video fixtures
and read-only originals. Preserve source bytes, frame timing, camera movement
and actor identity. Define uncertainty thresholds for motion, tracks, masks,
depth, optical flow, occlusions and cuts; failed measurements stay unknown.

Phase 3B.3 requires separate approval for a temporal Day-for-Night renderer or
provider integration. Plan shot-aware masks/depth/flow, controlled sun/sky
replacement, stable key/moon/backlight, contact/occlusion shadows, skin tone and
highlight protection, consistent grading/color space, and temporal regularization.
DoP camera/exposure/light changes resolve an immutable new snapshot, never
mutate a prior output. These are future requirements, not implemented effects.

Future MP4 receipts should capture source hash, exact binding, temporal hash and
version, provider/renderer version, output content hash, presentation mapping
and evaluation report before output publication. Retain immutable snapshots
durably and verify their hashes before pairing an MP4 with a light plot. Do not
store private media URLs or credentials in provenance. The current paid receipts
and database remain untouched; this module submits no job and produces no MP4.

## Evaluation criteria — NOT EXECUTED

Synthetic tests measure contract validation, hashing, immutability and binding.
All decoded-pixel and real-video checks below are **NOT EXECUTED**. Thresholds
must be agreed for approved fixtures before declaring a renderer ready:

- Flicker: motion-compensated per-region luminance/chroma changes in stable
  lighting intervals, alongside DoP review of intended changes and cuts.
- Ghosting: flow-warp residuals, temporal mask drift and occlusion/disocclusion
  edge review on moving actors/camera; distinguish estimator failure from render.
- Shadows: shot-aware direction/softness/contact consistency, visibility and
  occluder alignment; require calibrated evidence for physical accuracy claims.
- Faces/colors: tracked skin/neutral-patch color and exposure drift, clipping,
  facial identity/detail artifacts and viewing-transform consistency.
- Media integrity: original-byte hash unchanged, decoded frame PTS/count/order,
  duration/audio sync, cut continuity and output MP4/plot receipt match.

## Local verification

`npm run test:scene-planner-temporal` is included in `npm run check`.
Run existing revisions/video/Phase 2 suites, Project 5 safety/stable-base/release,
backup, `node --test ../scripts/ci-autofix-selftest.mjs`, PostgreSQL preflight,
JavaScript syntax and `git diff --check` with installed Node 22 dependencies.
Only three exact new paths enter the stable-base allowlist. Its independent
historical content guards and negative CI tests remain enforced. The CI fixture
copies the new candidate files into a disposable clone to verify future-commit
guards; it never commits this source branch.

Real PostgreSQL integration needs a disposable test server configuration;
Android lint/JUnit/build needs Java 17, Gradle 8.9 and SDK 35. Device WebView
execution needs an actual device/emulator. No missing tools are installed and
no new remote CI is triggered without commit/push approval.

Final local validation on 2026-10-10, existing portable Node 22.23.3:
all 13 new temporal regression groups, all 18 Phase 3A groups, full backend
`check` (including 47 Phase 2 tests and existing video regressions), all 23
CI Autofix checks including the future-candidate and negative protections,
Project 5 safety/stable-base/release, backup and all three PostgreSQL preflight
tests passed. Syntax checks passed for 54 Android JS assets and four candidate
JS/MJS files. `git diff --check` passed. No remaining local test failures.
The source HEAD is unchanged and nothing is staged. No private media/secrets
were added; the metadata rejection tests use synthetic sentinel strings only.
Android SDK/Java/Gradle/adb, a configured PostgreSQL test server and actual
decoded-video fixtures are unavailable locally. Real PostgreSQL integration,
Android checks, dependency registry audit and visual temporal evaluation were
not executed. Prior CI #7446 validates Phase 3A, not this uncommitted candidate.
