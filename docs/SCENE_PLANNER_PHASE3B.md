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

## Phase 3B.2: local original-video ingestion

Local development based on `d7cbc3b081a0a057f18ee4e05ecd01f28c9e8332`.
The preceding sections describe the historical 3B.1 candidate. Phase 3B.1 was
subsequently committed and passed CI #7448. This 3B.2 work has no commit/push
authorization and does not trigger new CI, provision infrastructure or enable
paid video processing. The temporal v1 module, UI, paid routes, production
PostgreSQL schema and physical lighting controls are unchanged.

### Existing decoder and actual proof

FFmpeg is not on PATH and ffprobe was not found in PATH, normal FFmpeg/WinGet
locations, Program Files or the local Temp directory. A bundled executable was
found at `C:\Program Files\BlueStacks_nxt\ffmpeg.exe`, version
`n4.4.4-6-gd5fa6e3a91`, with libavcodec 58.134.100 and libavformat 58.76.100.
Its `-decoders` output includes H.264/HEVC/VP8/VP9/AV1/MPEG-4 and PCM s16le;
its demuxers include ISO-BMFF and Matroska/WebM. The version/configuration string
alone is misleading about disabled decoders; actual capabilities and real
decoding were checked. This is an existing application-bundled tool, not a
downloaded/installed project dependency. No system setting was changed.
Only H.264 in the conservative ISO subset below is enabled by this adapter.
Other listed codecs are capabilities, not verified project support.

`backend/scene-planner-video-ingestion.js` exposes isolated local APIs:

- `inspectOriginalVideo`: read-only bytes, SHA-256 identity, bounded container
  validation, declared container/codec tags, dimensions and sample timing.
  The sample count is not a decoded frame count.
- `decoderCapabilities`: checks a trusted local executable's version, H.264
  decoder and ISO demuxer before processing. Its path is trusted operator
  configuration, never an HTTP/client parameter. No server route exposes it.
- `ingestOriginalVideo`: optionally runs the selected existing FFmpeg on a
  private byte-identical temporary input snapshot, validates every decoded
  frame hash/count/PTS against the original sample timeline, rehashes the
  original and returns a deeply frozen revision-bound receipt.
- `validateSuppliedTimeline`: verifies only an untrusted metadata contract,
  returning `unverified-metadata` and `not-executed`. It cannot grant decoder
  provenance and does not feed an untrusted timeline into the live decoder API.
  When original sample timing is available, rational PTS/durations/DTS must
  match it exactly; an otherwise valid but different timeline is rejected.
- `verifyVideoIngestion`: checks ingestion/temporal/plan hashes, source identity
  and exact revision binding. A decoded receipt additionally needs a private
  in-process capability issued by the controlled decoder boundary. A JSON copy
  supplied by a client is rejected even after rehashing it. Durable authenticated
  receipt restoration is future work; imported decoded receipts need re-decoding.

The ingestion receipt contains `sceneId`, `revisionId`, `lightPlotRevisionId`,
`planHash`, `sourceIdentity`, the full frozen temporal model with `temporalHash`,
decoder/method version, source timing and decoded pixel hashes. It contains no
source filename/path, raw media, pixel buffer, URL or secret. Per-frame hashes
describe FFmpeg's explicitly selected `yuv420p` pixel representation, not
original bit-depth/color fidelity, photometry or image-quality measurements.
Hashes may enable content correlation and should remain access-controlled.

### Formats, timing and audio

This adapter reuses the unchanged existing `analyzeIsoVideo` fail-closed parser;
it does not broaden the paid parser. Initial support is non-fragmented MP4/MOV
ISO-BMFF, one `avc1` H.264 video stream, at most one optional `mp4a`/`sowt` audio
stream, no edit lists, external references or compressed metadata, and no
nonzero composition offsets. `mp4a` is identified as AAC-declared and `sowt` as
PCM s16le-declared. Audio bytes are not decoded or independently authenticated
as that codec. WebM, HEVC, additional streams, nonzero composition offsets,
edited/rebased timelines and B-frame presentation reordering are unsupported
in real ingestion, even if the installed FFmpeg can read them. The paid parser
may support other video tags; the local adapter deliberately narrows its subset.

The original sample-table timebase is preserved as the exact rational `1/N`.
`stts` durations preserve VFR; no average FPS or browser seek time creates PTS.
For the accepted subset, DTS and PTS are explicitly equal and start at zero.
The decoder output is forced to that exact timebase with `copyts`, no frame
duplication and no FPS conversion. Each decoded PTS must match the source.
Rawvideo encoder packet duration is retained separately; original display
duration comes from the validated container sample table. Counts must match;
gaps, missing frames, dimension changes and timestamp mismatch reject the result.
No cut boundary is invented from the decode list.

The separate supplied-timeline contract can preserve reordered packet PTS with
strictly ordered DTS (including negative DTS) and ordered presentation frames.
That contract is tested synthetically and is not real B-frame support. Negative
or nonzero video start PTS is rejected, never silently normalized. General
rational `numerator/denominator` input retains its original values and an
explicit version-1 integer-tick scaling transform with zero offset. All scaled
integer values must remain safe integers. Live decoding currently uses `1/N`
and needs no transform. Existing temporal model v1 is unchanged.

Audio has its own codec declaration, rational timebase, start tick and duration.
The accepted no-edit-list container subset has zero-based track timing; audio
duration must satisfy the existing parser's 50 ms track/movie consistency limit.
Actual audio decoding, waveform synchronization and nonzero-origin container
alignment are NOT EXECUTED. The metadata-only contract preserves an explicit
audio offset up to +/-5 seconds and supports unknown audio (`null`); tests do
not promote those supplied offsets into verified media alignment.

### Resource, privacy and cleanup boundary

Limits: 512 bytes–40 MiB compressed input, 2–30 seconds, visible resolution at
most 1920x1080, at most 1800 frames, and a conservative 512 MiB total decoded
budget based on three bytes per visible pixel per frame. Every actual frame
size is checked again. FFmpeg has one thread per decoder/encoder/filter stage,
software decode only, a bounded pixel allocation with documented H.264
stride/edge padding, and a 64 MiB maximum individual allocation. Child stdout
and stderr share a 2 MiB cap; no raw stderr is returned or logged. Each process
has a maximum 15-second wall time, then is killed and awaited. Capability probes
run sequentially before decoding, each with that limit. Only one child process
and one full ingestion can run at a time in this module; concurrent starts fail
closed. Standalone inspection calls are intended for a trusted local caller,
not an unbounded public request endpoint.

Node input buffers are bounded to two compressed copies during final integrity
verification (up to 80 MiB), plus bounded metadata/output. These are engineering
budgets, not an OS-enforced total RSS quota. FFmpeg's `max_alloc` caps one
allocation, not aggregate native memory. The bundled older decoder is not a
production sandbox; broader hostile-media support requires a separately
approved sandbox/toolchain review. No new tool or OS policy is installed here.

Only regular local files inside an explicitly selected local input root are
accepted; URLs, UNC paths, source symlinks and resolved external paths fail.
The original is opened read-only and never written. `spawn` uses fixed argument
arrays, `shell:false`, `windowsHide:true`, ignored stdin and `file,pipe` protocol
allowlisting. A private temporary directory holds only a compressed input
snapshot; decoded pixel frames are never saved. Normal completion, decoder
failure, timeout, cancellation and source-integrity failure all await child
completion and remove that exact checked directory. Source bytes are rehashed
after decoding; concurrent edits reject the receipt. This does not lock other
applications or promise immunity to an adversary editing and restoring bytes
between checks. Abrupt host termination cannot guarantee `finally` cleanup;
there is no broad startup deletion or scan of unrelated private files.

No private video is uploaded, committed, copied into CI artifacts or printed.
Temporary files use the current user's Temp directory and OS permissions; this
phase does not change Windows ACLs. The optional real test creates procedural
video entirely locally, removes it afterward and never reads private footage.

### Analysis status and validation

Real frame boundaries, presentation order, decoded frame count, source timing,
pixel hashes and original-byte integrity are operational for the supported
subset. Automatic cut detection, exposure/color/WB statistics, camera motion,
actor tracking, occlusions, light visibility, optical flow/depth and shadow
continuity remain explicitly UNKNOWN. No Day-for-Night relighting is produced.
The temporal plan has no invented shots/observations. Without a selected
compatible decoder it contains source binding only, unknown timing and
`not-executed` decode status, even when container timing is available separately.

The new `test:scene-planner-ingestion` is part of backend `check`. Twelve
synthetic contract groups cover source bytes/hash, PTS versus DTS, VFR/exact
rational scaling, nonzero/negative origins, missing/duplicate timestamps,
audio offset, corruption/truncation, format/resource limits, locality/abort,
immutability, revision/hash/source mismatch and untrusted provenance rejection.
Those tests make no claim of codec decoding. An optional, separate real-process
section runs only when `SCENE_PLANNER_TEST_FFMPEG` explicitly selects an existing
executable. It creates local 32x32, two-second procedural H.264 fixtures: 50 CFR
frames and 49 VFR frames with original 80/40 ms intervals. It checks actual
decoding, exact PTS/count, original bytes, frozen binding, failed decoding,
timeout/abort after the snapshot boundary, source edits and temp cleanup.
No FFmpeg is discovered/downloaded automatically by CI; absent configuration
prints REAL LOCAL DECODE: NOT EXECUTED. Visual scene-quality evaluation remains
NOT EXECUTED even when that real-process test passes.

Only the two exact new ingestion paths are added to stable-base protection;
the CI Autofix disposable candidate includes them without weakening historical
content guards. No source-branch commit or remote CI is part of this work.

The next separately approved phase should add approved real-scene fixtures,
authenticated durable receipts, explicit edited/B-frame/offset timing support
where needed, and measured pixel/shot/motion analysis with confidence and
failure criteria. Day-for-Night rendering and physical shadow evaluation remain
future work and require separate authorization; Phase 3B.3 is not started.

Final 3B.2 local results (2026-10-10, existing Node 22.23.3): all 12 ingestion
contract groups passed, plus four separate real-process checks (CFR decoding,
VFR decoding, failure/timeout/cancellation cleanup, and source-change rejection).
Full backend `check` passed with the selected existing FFmpeg, including all
13 Phase 3B.1 groups, 18 Phase 3A groups and 47 Phase 2 tests. All 23 CI Autofix
tests, Project 5 safety/stable-base/release, backup and three PostgreSQL preflight
checks passed. Syntax checks passed for 60 JS/MJS files and tracked/new-file
whitespace checks passed. Final real-process checks also passed after tightening
the exact cleanup target guard. No remaining local test failure.

During development, a test initially expected the wrong rejection code for a
non-FFmpeg executable; the assertion was corrected to accept safe start failure.
A too-tight visible-pixel allocation cap blocked valid H.264 stride padding;
the bounded padded-allocation cap fixed it without relaxing visible dimensions.
One duplicate-PTS test was corrected after its baseline packet order changed.
The initial exploratory PowerShell cleanup failed on the user's short Temp path;
that exact probe directory was removed using its checked full path. Production
and regression cleanup use Node real paths and pass. No source media or frame
files remain in the repository.

Android SDK/Java/Gradle/adb and a configured disposable PostgreSQL server remain
unavailable locally. Android/device checks, real PostgreSQL-server integration,
registry dependency audit, decoded audio and approved real-scene visual analysis
were NOT EXECUTED for this candidate. No remote CI is started. No source-branch
commit, staging or push is performed; HEAD stays at the confirmed 3B.1 commit.

## Phase 3B.2V: measured offline decoded pixels

This section supersedes the historical development-state statements above.
3B.2 was committed as `dd2dd41ff8e2b6a44a46374cf2390f60629b09d8` and CI #7450
completed successfully. Its real decoder test was NOT EXECUTED on CI because
no existing FFmpeg was explicitly selected. The 3B.2V candidate is local only:
no commit, push, installation, remote CI, provider call or renderer is authorized.

### Data and trust boundary

`scene-planner-video-visual.js` adds `analyzeOriginalVideo` and
`verifyVisualAnalysis`. It first obtains a genuine 3B.2 decoded ingestion receipt,
then calls `streamVerifiedVideoPixels` for a controlled second decode pass.
The second pass decodes the same byte-identical private source snapshot into
`yuv420p` rawvideo on a pipe. Each complete frame is hashed and compared with
the first pass's decoded pixel hash before measurement. Frame order, count and
original PTS/durations therefore come from the verified first pass; rawvideo
does not independently carry timestamps. No timing is invented from FPS.
The original source is rehashed before and after the pixel pass. Corruption,
changed source, different decoder version, missing/extra/truncated frames or
pixel hash disagreement reject the whole result. Partial measurements are
never returned as a successful analysis.

Analysis preserves sceneId, revisionId, lightPlotRevisionId, planHash,
sourceIdentity, ingestionHash, temporalHash, rational timebase, each frame's
original PTS/duration/index and decodedPixelHash. It has a deterministic SHA-256
visualHash and is deeply frozen. Old ingestion/temporal/lighting revisions remain
unchanged. Verification also needs private in-process authority: external JSON,
even with a recalculated hash, cannot claim verified pixels. Durable authenticated
restoration remains future work. There is no new HTTP endpoint or UI workflow.

### Measurements and event estimates

Method `yuv420p-code-statistics-v1` computes every frame's Y/U/V mean, extrema
and population standard deviation from actual decoded bytes. Y additionally
has a 16-bin normalized histogram, dark fraction (codes below 64), bright
fraction (codes at least 192) and a 4x4 spatial mean grid. Fractions describe
pixel distributions, not semantic regions. Contrast means code-value standard
deviation, not physical dynamic range. Numerical confidence is
HIGH_FOR_DECODED_CODE_VALUES; physical interpretation confidence is UNKNOWN.

Adjacent-frame records carry the latter frame's original PTS, both frame indices
and pixel hashes, signed Y mean change, normalized U/V mean distance, histogram
distance and spatial residual after subtracting the global Y shift. Candidate
thresholds are heuristic and versioned: absolute mean Y change >20% of 255,
histogram distance >0.45, chroma mean distance >0.12 or spatial residual >0.12.
Residual <0.035 and chroma distance <0.06 marks a large uniform shift as
ILLUMINATION_CHANGE_OR_FLASH. A one-frame change followed by return to the
preceding statistics is TRANSIENT_FLASH_OR_OTHER_CHANGE. Other candidates are
CUT_OR_MOTION_OR_LIGHTING. Every candidate has LOW_UNCALIBRATED_HEURISTIC
confidence and REQUIRES_HUMAN_CONFIRMATION; confirmedCut is always false.
No large change gives UNKNOWN for cut status, not proof that no cut occurred.
VFR lookahead is one frame, not an assumed fixed time interval.

These features can miss cuts between statistically similar scenes and can flag
camera movement, lighting changes and object movement. Neither flash filtering
nor editorial-cut detection is calibrated on real film scenes. The tests use
procedural known changes and do not establish real-scene precision/recall.

Matrix coefficients, signal range, transfer function and primaries deliberately
remain UNKNOWN: this version does not parse or verify source colorimetry.
Statistics describe the decoder's selected 8-bit YUV representation, not original
bit depth or calibrated physical color. Y values are not exposure in stops;
U/V values are not white balance. ExposureStops, whiteBalanceK and physicalScene
remain UNKNOWN. Actor identification/tracking, optical flow, depth, geometry,
shadow directions and Day-for-Night rendering are NOT IMPLEMENTED. DoP creative
requests remain in the separate immutable lighting revision, never presented
as measured pixel facts.

### Process, privacy and memory limits

The operator selects an existing trusted local decoder through options;
SCENE_PLANNER_TEST_FFMPEG selects it only for tests. No executable path is
hardcoded, searched automatically on CI, downloaded or installed. All existing
3B.2 format/timing/input/resource restrictions remain. Both passes use controlled
argument arrays, shell:false, ignored stdin, software decode, one thread per
stage, file/pipe-only protocols, bounded dimensions/allocation and 15-second
maximum per child. The raw stdout budget is 512 MiB total across frames;
stderr remains capped at 2 MiB. Metadata stdout remains capped at 2 MiB.

Raw pixels are processed synchronously with one reusable frame buffer capped
at 8 MiB (supported 1920x1080 YUV420p requires about 3 MiB), plus bounded pipe
chunks. No full decoded video is accumulated in memory. Only frame statistics
and hashes are retained (at most 1800 frames). Consumers of the internal trusted
stream interface must not retain its reusable buffer or perform asynchronous
work. Compressed source buffers remain bounded as in 3B.2. These are engineering
limits, not an OS-enforced RSS sandbox; the existing older bundled FFmpeg is
not approved here as an internet-facing hostile-media decoder.

No decoded frame files are written. The private compressed snapshot is removed
after success, child failure, rejected measurements, abort or timeout, after
child completion and exact directory containment checks. Host termination can
still prevent finally cleanup. Originals are read-only; test-induced source
edits are confined to generated temporary fixtures and restored. No private
footage, paths, raw pixels or raw decoder stderr are emitted in reports, Git or
CI artifacts. No paid route, PostgreSQL schema, job safety or lamp control changed.

### Tests and next step

`test:scene-planner-visual` is included in backend check. Synthetic pixel tests
have no trusted decoded provenance. Separate actual process tests generate
32x32 two-second H.264 procedural clips locally and check decoded dark/bright
values, contrast, gradual Y/chroma changes, flash-like changes, editorial cuts,
camera-like spatial changes, CFR/VFR timestamps, wrong source/revision,
untrusted JSON, freezing, timeout/abort/consumer failure, corrupt inputs,
original preservation, concurrent source changes and temporary cleanup.
Absent an explicitly selected existing decoder, actual visual tests print
REAL VISUAL PIXEL ANALYSIS: NOT EXECUTED. Mandatory synthetic tests still run.
No private film material is used. Stable-base adds only the two exact visual
module/test paths; CI Autofix validates a complete candidate without weakening
historical protected content.

Next separately approved work should establish an approved real-scene validation
set, colorimetry-aware measurement, calibrated cut confidence and authenticated
durable receipts. Only after that should motion/geometry/shadow continuity and
the Day-for-Night renderer be designed and evaluated. Phase 3B.3 is not started.

Local validation on 2026-10-10 with existing Node 22.23.3 and the previously
operator-approved FFmpeg version succeeded: seven synthetic pixel groups and
eight actual procedural visual decode groups, including repeated deterministic
visual hashing. The full backend check passed with real decoding selected:
12 ingestion contract groups plus four actual ingestion checks, 13 temporal
groups, 18 revision groups and 47 Phase 2 video tests. CI Autofix passed all
23 tests; Project 5 safety/stable-base/release, backup and three PostgreSQL
preflight tests passed. Syntax checks cover 62 JS/MJS files; tracked and new-file
whitespace checks passed. A separate no-decoder invocation correctly printed
NOT EXECUTED while running all seven mandatory synthetic visual groups.

Android SDK/Java/Gradle/adb, a configured disposable PostgreSQL server and
ffprobe remain unavailable locally. Android tests, actual PostgreSQL-server
integration, registry dependency audit and remote CI were NOT EXECUTED for
this candidate. Real-scene validation, audio decoding and calibrated color or
physical-light measurements were NOT EXECUTED. Source HEAD remains the confirmed
3B.2 commit; no source-branch staging, commit or push was performed.

## Phase 3B.2C: offline event evaluation and calibration infrastructure

This candidate starts from `1eacb12ef5772b589e7a08ab55966688922ffe7d` (3B.2V,
successful CI #7452). Local development and offline tests only are authorized.
No staging, commit, push, new tool, provider call or workflow edit is performed.
Existing visual, ingestion, temporal and lighting-revision modules are unchanged.

`scene-planner-video-calibration.js` adds a fixed, deeply frozen profile
`offline-event-baseline-v1`, a pure feature/event evaluator, per-kind event
scoring, source-bound calibration reports and a split-safe dataset aggregator.
It consumes the existing YUV code-value measurements. It does not alter earlier
visual candidates, calibrate photometry/colorimetry or train an AI model.
Profile fitting is NOT EXECUTED; the two tuning scenarios are reserved development
data, not evidence of an optimized profile. No caller input changes thresholds.

### Fixed method, estimations and labels

Version 1 retains the preceding heuristic jump thresholds: absolute mean-Y
change >51 codes, histogram distance >0.45, normalized U/V distance >0.12,
spatial residual >0.12. Uniform means residual <0.035 and chroma distance <0.06.
Uniform Y jumps yield illumination-change candidates; significant chroma shifts
yield color-change; spatial residual yields image-change. Nonuniform histogram,
spatial, or combined chroma/luma jumps yield cut-candidate. The preceding
visual module's one-frame-return estimate yields one flash-like candidate,
not both edges as separate flashes. These labels remain low-confidence estimates
with confirmed:false. A monotonic run of at least three Y steps, each 2..24
codes inclusive, yields gradual-change at its first changed frame. It does not
distinguish lighting fades from editorial dissolves. Color changes are YUV
proxies, not measured color temperature or white balance.

No camera or actor tracker is added. The existing 4x4 luma grid residual after
global shift removal is only spatial image-change evidence. Camera pan, object
motion, editing and other changes can produce the same evidence. Camera-versus-
object motion, actor identity, optical flow, depth, scene geometry, physical
shadow directions, exposure stops and Kelvin remain UNKNOWN.

The regression file defines 13 independently labelled procedural scenarios:
static camera/constant light and rising-light ramp are tuning only; decreasing
light, single flash, lighting step, editorial cut, similar-statistics cut,
cross-dissolve between flat and striped images, camera-pan-like pattern change,
object-position change, chroma/color-temperature proxy, dark high-contrast image
and VFR cut are validation only. Labels and timestamps are explicitly written
in the scenario definitions before evaluation, never copied from predictions.
They are procedural-script assertions, not independently annotated film footage.
The motion scenarios are simple abrupt pattern/object translations, not proof
of general camera/actor motion estimation. Thresholds are not searched or
adjusted after observing these cases. The suite intentionally retains failures.

### Quality scoring and independent splits

Reference and predicted events have kind and original PTS tick. Matching is
one-to-one within kind and within video; class disagreements create FP and FN.
Tolerance is explicit and inclusive. Procedural tests use 100 ticks at 1/1000
second, i.e. +/-100 ms (not a frame-index tolerance). VFR uses the original
presentation timestamps. Dynamic programming maximizes true positives, then
minimizes total absolute timing error with deterministic ties. It cannot assign
multiple predictions to one truth event. Signed localization errors and mean
absolute error are reported only for matched events; misses are counted as FN.
Precision=TP/(TP+FP), recall=TP/(TP+FN); absent denominators are null. F1 is null
if either component is undefined, otherwise the harmonic mean (zero when both
defined components are zero). Micro metrics sum counts across scenarios, not
the mean of scenario percentages. Negative or absent-class metrics are not
silently converted into perfect scores.

Reports carry method/profile version and profileHash, sourceIdentity, sceneId,
revisionId, lightPlotRevisionId, planHash, temporalHash, ingestionHash, visualHash,
timebase and every decoded frame's index/PTS/duration/pixel hash. Reference labels
have their own hash and declared procedural origin. Source/timebase mismatch
rejects a report. `createCalibrationReport` verifies a genuine in-process visual
receipt; arbitrary external JSON cannot obtain decoded trust. The deeply frozen
report has calibrationHash; imported copies require trusted re-analysis rather
than being authenticated by a plain SHA. Existing analyses and revisions are
not mutated. The pure scoring/feature helpers never assert decoded provenance.

`evaluateCalibrationSet` accepts only genuine reports, rejects duplicate scenario
IDs or identical source bytes even across different splits, and refuses mixed
timebases. It scores videos separately and aggregates tuning and validation
separately, with a deterministic datasetHash. No threshold-fitting feedback path
exists. References must come from a trusted test author; the adapter cannot
independently prove that an author's labels correctly describe a scene.

### Observed procedural results and limitations

Synthetic source-pixel evaluation and actual H.264-decoded procedural evaluation
both gave the following results with the fixed profile:

| Split | Scenarios | TP | FP | FN | Precision | Recall | F1 | Matched MAE |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Tuning | 2 | 1 | 0 | 0 | 1.000 | 1.000 | 1.000 | 0 ms |
| Validation | 11 | 11 | 2 | 1 | 0.846 | 0.917 | 0.880 | 0 ms |

The similar-statistics editorial cut is missed (one cut FN). Fast-pan-like image
translation and moving-object translation each create a false cut candidate
(two cut FP), while their image-change labels are detected. Across validation
cut labels alone: TP=2, FP=2, FN=1, precision=0.5, recall=2/3, F1=4/7.
Perfect timing for the matched procedural events is not a claim of film timing
accuracy. Aggregate multi-label F1 hides the worse cut-only result, so both are
documented. No candidate becomes a confirmed editorial cut.

REAL FILM CALIBRATION: NOT EXECUTED. There are no approved real films with
independent reference annotations. Actual procedural decoding is a separate
proof of execution, not evidence of representative cinema accuracy. This small
holdout shares the procedural generator family with tuning data; it does not
establish cross-camera, codec, scene or production-domain generalization.

### Safety, tests and future CI plan

The calibration module performs no decoding or I/O itself. Actual tests use
the already-approved local decoder via SCENE_PLANNER_TEST_FFMPEG and generate
only 32x32 two-second local H.264 clips. All 3B.2/3B.2V read-only source, bounded
format/duration/resolution/input bytes, frame count, streaming memory, process
timeout and concurrency restrictions remain unchanged. No private source video
or frame pixels appear in Git/logs. Source hashes and scalar quality reports
may permit correlation and should remain access-controlled. Child failure,
timeout, abort and cleanup remain verified. Pure scorer budgets are at most
256 predicted/reference events and 257x257 DP cells per class; a dataset has
at most 128 scenarios. Event-dense clips above that scorer budget fail closed
and require separately approved segmentation. There is still no OS RSS sandbox.

`test:scene-planner-calibration` joins backend check. Mandatory synthetic contract
groups cover exact metrics, undefined denominators, optimal matching/tolerance,
malformed/duplicate/oversized input, timestamps, frozen profile and expected
misclassifications. The separate actual section covers all 13 scenarios, original
CFR/VFR timestamps, unchanged sources/revisions/analyses, deterministic hashes,
wrong source/timebase/revision, forged JSON, split leakage, timeout/abort and
temporary cleanup. No selected decoder prints REAL PROCEDURAL CALIBRATION:
NOT EXECUTED. Stable-base and CI Autofix gain only the two precise new paths.

The GitHub Actions workflow remains unchanged. For a future separately approved
CI change: select a reviewed pre-existing FFmpeg binary on the runner, validate
its version, H.264 decoder, ISO demuxer and procedural encoder/filter capabilities,
then set SCENE_PLANNER_TEST_FFMPEG for a separate explicitly required real-process
job with existing resource/time limits. No automatic download/fallback should
occur; absent capabilities must be reported or fail the required real job,
never substituted by synthetic success. Pin the approved runner/toolchain,
retain only scalar sanitized reports, and continue mandatory backend/PostgreSQL/
Android/security gates. This candidate neither modifies CI nor claims its real
decoder tests ran remotely.

Next: obtain separately approved film fixtures with independent human annotations,
freeze disjoint tuning/holdout identities and scoring tolerance before evaluation,
record colorimetry and scene/camera strata, and test motion/flash/dissolve failures.
Only then consider a new explicitly versioned profile and confidence calibration.
Day-for-Night rendering remains future work; Phase 3B.3 is not started.

Final local 3B.2C validation (2026-10-10, existing Node 22.23.3): six mandatory
calibration contract groups passed, covering all 13 synthetic scenarios; all
13 actual decoded procedural scenarios passed execution/integrity checks,
plus failure/abort cleanup and split-safe dataset aggregation checks. Expected
classification FP/FN above remain present; passing regressions do not mean
perfect event detection. No-decoder execution correctly prints NOT EXECUTED
for actual processing while retaining mandatory contract checks.

The complete backend check passed with the existing operator-selected FFmpeg,
including 7 synthetic/8 actual visual groups, 12 ingestion groups/4 actual
ingestion checks, 13 temporal groups, 18 revision groups and 47 Phase 2 tests.
All 23 CI Autofix tests, Project 5 safety/stable-base/release, backup and three
PostgreSQL preflight tests passed. Syntax/whitespace checks passed for the
64 relevant JS/MJS files and both new-file/tracked diffs. Android SDK/Java/
Gradle/adb and a configured disposable PostgreSQL server remain unavailable
locally; real PostgreSQL-server integration, Android execution, registry audit
and new GitHub CI were NOT EXECUTED. No media files or secrets were added.

## 3B key/fill measurement interpretation and guarded camera exposure (2026-10-11)

The Scene Planner now compares **only** separately isolated, user-reported incident-lux
contributions when both fixtures are owned/available with key and fill roles, have
matching attested on-set distance, V2 metadata, positive lux, identical reported
meter model and point, camera-axis receptor orientation and times at most 15 minutes
apart. Meter model is not proof of a unique physical instrument; local times and
calibration are not independently verified. Revisions remain SHA-256 integrity-checked.

For comparable readings: `ratio=keyLux/fillLux` and signed
`relativeStops=log2(keyLux/fillLux)`. For instance, 400 vs 100 lx means
4:1 and **+2 stops in isolated contributions**, not a measured contrast of
the image. Both zero denominators and incomplete/inconsistent records fail
closed with `relativeStops=null`. Negative stops mean isolated fill contribution
is greater; no ratio is presumed universally desirable.

Only relevant curated cards **actually attached to the active plan** (SET-002,
SET-005 and EXP-001, when present) supply the returned principle, suggested
application, practical check and limitations. These are conditional, paraphrased
book principles, not independently verified full books or photometric certificates.
Check motivation, multiple shadows, blocking and the waveform with the DoP.

`analyzeMeteredExposureContext` reports a nominal settings-only camera EV100 index:

```text
shutterSeconds = shutterAngle / (360 * fps)
nominalSettingsEv100 = log2((fNumber^2/shutterSeconds)*(100/ISO)) + NDstops
```

It depends only on validated f-number, shutter angle, fps, ISO and reported
ND setting. **It is NOT measured scene EV or calibrated exposure.** Neither
manufacturer-table lux, imagery nor isolated key/fill lux are used to compute
the camera setting. The same revision-bound record leaves
`derivedSceneLux`, `measuredSceneEv100`, `recommendedAperture` and
`recommendedIso` null, and all scene/camera/meter verification flags false.
When readings are not comparable the meter results are null even though the
settings-only index can still be computed. This is a foundation for a *future*
calibrated workflow requiring identifiable meter and calibration, scene/ambient
measurements, time provenance, lens transmission/camera EI and gray-card/waveform
validation—not an automatic correct exposure recommendation.

The existing `test:scene-planner-photometry` suite covers positive/negative/zero
stop differences, book-card binding, blocked comparisons, camera-only math,
no fabricated lux or camera settings and tampered revision rejection. No
fixture-control, paid AI job, publish/release, K0 or K1 changes are involved.


### V3 instrument identity and UTC-offset evidence (2026-10-11)

The user can optionally enter a **specific physical light-meter inventory identifier** and
the **actual local UTC offset** (for example `+02:00`) at each reading. Both fields,
plus the local measurement time, are mandatory together for protocol V3. A missing
or malformed identifier or offset is rejected; neither can be inferred from city,
timezone name, device time, or photograph. Historical V2 readings remain readable
and keep their original comparability behavior and warning about unverified
wall-clock times. Comparing a V2 reading with a V3 reading is blocked.

V3 reports compare equal *user-declared* meter identifiers as well as models,
measurement points, and camera-facing receptor orientations, then calculate
elapsed minutes from each local time minus its own reported UTC offset. This
handles the ambiguous wall-clock hour around daylight-saving changes without
silently treating local times as UTC. The original maximum gap of 15 minutes
remains unchanged. Invalid offsets and instrument mismatches fail closed; blocked
comparisons have no numeric ratio or relative stops. Captured UTC offset and ID
are revision-bound and tamper-evident, but **neither clock accuracy nor meter
identity/calibration is independently verified**. No scene exposure, calibrated
EV, lux, aperture or ISO is computed from this comparison.

Regression fixtures cover the DST fall-back hour, 15/16-minute boundary,
partial/invalid offset records, V2/V3 mismatch, immutable history, tampering,
and in-app entry/display of V3 provenance. This remains an optional evidence
upgrade; no physical fixture control, paid AI, publication or K0/K1 change.


### Whole-setup on-set incident lux, single measured point (2026-10-11)

The operator can report a **separate real incident-meter observation at one subject
mark** with the intended owned, available lights switched on **and ambient
illumination included**. This is independent of isolated fixture key/fill readings
and of published fixture lux data. The operator must explicitly attest both the
physical meter observation (receptor facing camera) and the lighting state. The
mandatory record has lux (0..1,000,000; up to 0.001 precision), meter model and
physical-device identifier, named subject measurement point, valid local time and
an explicit per-reading UTC offset. The reading is *user reported* and its
instrument calibration, actual installed fixture state and correctness are not
independently verified.

The new `sceneIncidentLuxReading` record is limited to an owned-light plan,
versioned, immutable within the SHA-256 revision history, and includes a
deterministic fingerprint of the currently planned available lights plus
user-attested optics and distances. This fingerprint is a **binding to the plan
context**, *not* a proof that AI-proposed positions, dimmer percentages and color
actually matched the set. A new/reconfirmed fixture distance or mounted optic
invalidates the combined reading **only in the child revision**; the original
validated revision retains the original reading. Fresh AI-generated plan
revisions do not inherit this physical observation. Further isolated lamp
readings do not themselves change the recorded intended all-on setup.

`analyzeMeteredExposureContext` returns
`sceneIncidentEvidence.userReportedLux` when such a reading exists, with
its user-declared meter/time provenance and no independent validation. The
separate `derivedSceneLux`, `measuredSceneEv100`, `recommendedAperture`,
`recommendedIso` stay `null`; exposure/scene-calibration flags stay
`false`. A single meter point is **not** the illuminance of the entire image,
does not establish subject reflectance, waveform IRE, camera EI, transfer
function, T-stop or an optimal contrast ratio. It is not summed with or
subtracted from separately isolated fixture readings: the ambient contribution,
repeatability, interaction, and intervening physical setup changes are unknown.

The UI captures and prints the real observation distinctly from proposed
camera/fixture values. The offline regression suite rejects forged readings,
missing confirmation, bad timestamps/offsets, stale fingerprints, tampering
and use in non-owned plans, while checking historical revision preservation and
non-calibrated exposure status. No paid AI, direct device control, APK
installation, release/publish, `main`, K0 or K1 change.


### Three-reading scene metering protocol alignment (2026-10-11)

The Scene Planner now separately checks the **metadata compatibility** of three
user-reported incident-meter readings at the subject mark:

1. Key contribution, fixture isolated (V3 with physical meter ID and UTC offset).
2. Fill contribution, fixture isolated (also V3).
3. Full intended owned-light arrangement, all available sources active and ambient
   present (separate whole-setup incident-meter evidence).

The deterministic `assessSceneMeterAlignment(revision, keyId, fillId)` first verifies
the immutable revision and the key/fill fixture roles. It then requires all three
readings, V3 identity/time metadata for both isolated readings, exactly equal
reported meter models and physical-device identifiers, the same named subject
measurement point, each receptor facing the camera and an **overall** elapsed
span of at most 15 minutes across the three user-declared UTC-offset timestamps.
This is NOT three independent pairwise windows and it correctly handles
daylight-saving offset transitions. Missing/mismatched evidence fails closed
with an explicit blocker and null three-reading values. Zero lux is a valid
record and does not make the session alignment disappear.

The success state is deliberately named
`ALIGNED_BY_USER_REPORTED_METADATA_ONLY`. It does **not** verify that the
meter/device was really the same, that the physical lamp levels and modifiers
matched the plan, that ambient spill was stable or that light contributions
sum algebraically between different switch states. The report **does not**
calculate a residual `sceneLux-keyLux-fillLux`, attribute excess lux to
ambient, infer exposure, derive T-stop, adjust aperture/ISO, assert image
contrast or request any actual fixture control. Blocked session results expose
neither a guessed ratio nor inferred key/fill/scene lux values.

`analyzeMeteredExposureContext` now includes this separate, revision-bound
three-state alignment report alongside its pre-existing scene-lux observation,
isolated key/fill comparison and nominal settings-only EV100 math. All previous
scene/camera verification booleans remain false, with aperture/ISO and measured
scene EV still null. The user-facing camera panel and text report explain a
matched session, or the exact reason it is blocked, and display the applicable
curated **EXP-001 / SET-005 / PHY-005** principles attached to that active
revision, with practical validation steps and limitations rather than invented
source citations. This is advisory evidence organization, not camera calibration.

Regression cases include daylight-saving crossover, the inclusive 15-minute
boundary, too-distant readings, instrument/model/point mismatches, receptor
orientation, V2 compatibility (readable but not eligible for aligned V3 session),
zero readings, invalid light roles, invalidated physical setup, tamper-evident
history, no numeric data on a blocked comparison and no fabrication of camera
or ambient calculations. Neither K0, K1, `main`, direct fixture control,
paid AI, release/publish nor APK installation is changed.


### Human-reported camera gray-card waveform evidence (2026-10-11)

The Scene Planner can now capture an **actual operator-transcribed waveform level**
from a physical neutral gray card in the same named subject mark used for the
already stored **whole-scene incident lux** reading. Neither meter reading nor
camera waveform is acquired by the app. This is an optional workflow available
only when a SHA-256-bound, owned-fixture whole-scene meter reading already exists.
It does not require key/fill V3 pair alignment; the waveform is tied to the
*whole-scene* state, not to isolated lamp contributions.

The operator must explicitly attest: (1) card placement and an observed
camera/monitor waveform, (2) actual in-camera ISO, aperture, shutter, fps and
ND matching the current plan, and (3) all planned available lights plus ambient
remaining on. The record includes an operator-named camera model, shooting/gamma
profile, actual card identifier, whether the waveform was observed internally
or on an external monitor, and the operator-declared measurement signal path
(recording signal, monitoring/display LUT, or unknown). It records the actual
numeric waveform level in **0..109 IRE, at most one decimal place**, the local
clock and explicit UTC offset. It must use the **same subject mark** and fall
within **15 elapsed minutes** of the whole-scene incident meter timestamp.
The camera setting fingerprint and SHA-256 of the actual whole-scene meter
reading are bound to the record. This is evidence traceability, not calibration,
not cryptographic authentication of a human observation, and not proof that
the camera really matched the AI-proposed plan.

A reference IRE is **never prefilled, recommended, retrieved from a generic
gray-card table or inferred from the user image**. If the operator wants to
compare, they must manually enter both their specific reference IRE and its
named camera/profile/LUT basis, with the waveform signal path known. The only
comparison is the signed arithmetic difference in **IRE percentage points**;
it is *not* f-stops, waveform linear scene brightness, luma from image pixels,
a neutral-card reflectance measurement, a safe target across camera gamma
curves, confirmation of correct exposure, or a suggested ISO/aperture.

On re-attesting a fixture distance, changing/reconfirming an optic or replacing
the whole-scene meter reading, the camera gray-card observation is cleared
**only in the child revision**. The parent measurement survives immutably
in the revision history. A fresh AI-generated plan never inherits it. An
isolated key/fill lux rereading does not independently change the whole-scene
meter/camera configuration.

The camera panel and exported text report label the waveform with its reported
camera, gamma, source and signal path, any user-specified IRE reference, and
the precise limitations. Explanations can use only expert cards actually
attached to the active revision: EXP-001 (metering), EXP-002 (highlights and
shadows) and EXP-003 (waveform/false-color and profile checks). The cards are
curated, non-page-verified principles and **not camera-specific manufacturer
specifications**. `analyzeMeteredExposureContext` returns a separate
`cameraWaveformEvidence` object with exposure, calibration, signal path and
gray-card reflectance verification flags still false; its derived exposure
stops are null. Original scene EV, lens T-stop, recommended aperture/ISO and
scene-contrast outputs remain null/unverified.

Offline regression checks cover absent meter context; three mandatory
attestations; zero/109 IRE and invalid decimal/negative/overflow values;
invalid camera/profile/signal path; missing, spurious or forged reference;
time/offset and the inclusive 15-minute boundary; immutable revision
history, tampered waveform/camera/meter fingerprints, setup invalidation;
book-card provenance; and UI capture and reporting. No K0/K1/main changes,
paid inference, physical lamp control, release, publish or APK installation.


### Camera waveform signal-context V2 and manual IRE reference gate (2026-10-11)

A user-reported gray-card waveform has a new optional **V2 evidence protocol**,
implemented in the current Scene Planner entry form. Earlier immutable
protocol V1 histories **remain readable unchanged**, including their
historical arithmetic IRE comparison; their reference status is explicitly
`LEGACY_V1_REFERENCE_SIGNAL_CHAIN_INCOMPLETE`. V1 entries never inherit V2
provenance or gain a claimed profile verification.

V2 requires the operator to document, separately from the **recording profile**,
the **observed waveform transfer/output label**, and the **signal code range**
as either `FULL_DATA`, `VIDEO_LEGAL` or `UNKNOWN`. The user separately
declares whether the waveform is of `RECORDING_SIGNAL`,
`DISPLAY_LUT_SIGNAL` or `UNKNOWN`, and whether the waveform instrument
was inside the camera or on an external monitor. On a display-transform
signal the user may report its exact monitoring LUT/transform identifier;
for a recording signal the monitoring-transform field must be empty.
These are human descriptions, NOT inferred EOTFs, a LUT lookup, a validated
camera manufacturer profile, an automatically calibrated waveform, or an
in-app image/video analysis.

An operator may record an IRE value **even when the chain is unknown**, but
V2 will not accept a manual *comparison reference* until all of these hold:
the user explicitly enters the reference number and its named source, a known
signal path, a known reported code range, an identified monitoring transform
if a display LUT signal is being observed, and an explicit declaration that
the reference applies to **that exact camera, recording profile, waveform
source, observed transfer, code range, and transform**. This extra
attestation is recorded as `referenceContextConfirmed=true`. Each V2
reading stores a deterministic SHA-256 of the exact *declared* signal
context, including current plan camera-setting fingerprint. A reference
must bind to that identical hash. Neither SHA-256 nor an operator checkbox
authenticates a camera or validates manufacturer specifications.

Outputs distinguish `NO_USER_REFERENCE`,
`V2_USER_ATTESTED_SIGNAL_CONTEXT_NOT_VERIFIED`, and
`LEGACY_V1_REFERENCE_SIGNAL_CHAIN_INCOMPLETE`. The signed numeric
difference is **IRE percentage points only**. It is never corrected for
log encoding, HDR transfer, limited/full code mapping, monitoring LUT,
camera white balance or card reflectance, and is not interchangeable with
exposure stops, incident lux, luminance or recommended ISO/aperture.
Profile-specific reference values are never supplied by AI from book
paraphrases or from the product's manufacturer lux database.

The live app shows recording-vs-displayed signal provenance, V2 limitations
and a separate reference-context attestation. Text export includes the
measured IRE, reference comparison status, user-specified signal context
and the actionable EXP-001, EXP-002 and EXP-003 principles, practical
checks and limits **only when attached to the active revision**.
Independent camera settings, reference standard, monitor signal path,
transfer curve and gray-card reflectance verification flags remain false.

Regression tests cover archived V1 integrity, V2 recording and display-LUT
contexts, missing/unknown code range, unknown monitoring transform, invalid
text, absent attestation, forged/different SHA bindings, no-reference
observation, revision restoration/invalidation and no fabricated calibrated
exposure or universal IRE target. No `main`, K0, K1, merging, release,
installation, paid AI, physical fixture control or safety relaxation.


### DoP before-and-after gray-card waveform revision comparison (2026-10-11)

LightingAI now supports a **pure, offline comparison of two separately
documented on-set gray-card waveform observations** captured in one immutable
Scene Planner revision chain. The comparison is exposed both in the camera
panel and the text export, using the **two most recent waveform-bearing
revisions, only when the active revision has a waveform observation**.
The comparison identifies both SHA-256-bound revision IDs, so the DoP can
trace which observations were compared without resetting or overwriting the
previous take. Historical V1 readings remain readable but are **not eligible**
for a V2-vs-V2 comparison.

`compareGrayCardWaveformRevisions(history, earlierId, laterId)` first
verifies the **entire contiguous revision history** with `restoreRevisions`,
rejects unknown IDs or reversed sequences, and requires camera waveform V2
in both revisions. It compares only if the user-declared camera model and
recording profile match, camera-settings fingerprints match, and the declared
waveform source, recording-vs-display signal path, full/legal code range,
observed transfer description, monitoring LUT identity (where applicable)
and exact SHA-256 signal-context binding all match. Unknown code range or
signal path is **not** comparable. The **same physical gray-card identifier**
and **same named measurement point** are mandatory, as are distinct
chronologically ordered timestamps calculated using each UTC offset.
Elapsed minutes are shown for context, but the window is deliberately
not used to **assert stable daylight or steady fixture output** between
separate physical setups.

If all metadata checks pass, the function returns only:
`beforeIre`, `afterIre` and signed
`deltaIrePoints = round(afterIre-beforeIre, 1)`.
The result is explicitly `USER_REPORTED_IRE_LEVEL_DIFFERENCE_ONLY`.
A second field indicates whether the **planned** rig fingerprint matches,
but this cannot independently verify actual lamp locations, optical
attachments, user dimmer levels, ambient consistency, card calibration,
monitor/camera profile, color workflow or whether any difference is actually
caused by the lighting change. A reference IRE is **not required nor used**
for this before/after comparison, and no universal reference is supplied.

Mismatches are `NOT_COMPARABLE` with an explicit machine-readable blocker
and null before/after IRE and delta. No waveform IRE is converted to lux,
camera EV, exposure stops, scene contrast, suggested aperture or ISO.
No paid AI, auto-rig, direct fixture control or preview rendering is
triggered. The user-visible result advises comparing shadows, waveform,
lighting motivation and camera angles with the cinematographer. It shows
practical checks and limitations solely from **EXP-002, EXP-003, SET-007**
cards *actually attached to the current revision*; the library has not
independently verified every page of the original source books.

Regressions exercise same-context increased, decreased, and equal
observations; monitoring LUT changes; unknown signal chain; different
camera profile, physical card and measuring mark; V1 history; reversed or
missing revision IDs; non-monotonic time; missing intermediate history;
tampered SHA-256 records; immutable original observations and absence
of automatic exposure calculations. K0, K1 and `main` stay unchanged;
PR #415 remains Draft and no merge/release/publish/APK installation occurs.


### Capture provenance: inherited waveform revisions are not new measurements (2026-10-11)

A material safety fix now distinguishes a **new camera/gray-card observation**
from a later immutable Scene Planner revision that merely carries forward the
**same existing waveform record**. An isolated key/fill lux update can create
a child revision with an unchanged gray-card reading, but that new revision
**does not mean the camera was measured again**. The previous camera-panel
selection counted every waveform-bearing revision, potentially choosing two
snapshots of one observation instead of two independent measurements.

The deterministic helper `listGrayCardWaveformCaptures(history)` first
checks the **full contiguous SHA-256 revision chain**, including each plan's
meter/waveform evidence validation. It indexes only the revisions where a
gray-card waveform record appears for the first time or differs from the
**immediately previous** revision's record. Records carried forward verbatim,
including a re-entry with exactly the same observation metadata and timestamp,
are not new observations. The helper returns the IDs of the actual capture
revisions and the source revision for a currently inherited waveform. It
does **not** independently prove that an operator really measured a camera,
and preserves compatibility with archived V1 and V2 evidence.

The previous two-reading comparison remains available for genuine, distinct
V2 observations, even when subsequent revisions copied forward the last
waveform unchanged. Its standalone API now explicitly rejects attempts to
compare either an inherited earlier endpoint or inherited later endpoint:
`NOT_COMPARABLE / INHERITED_WAVEFORM_NOT_A_NEW_OBSERVATION` with null
numeric output. Independent differences in camera signal path, profile,
code range, monitoring LUT, physical card, named mark and chronological
timestamps continue to fail closed exactly as before.

The DoP camera panel and exported report use the **last two genuine capture
revision IDs**, not the last two revisions that happen to contain waveform
data. When the active revision contains an inherited reading, the app
explicitly identifies the older source revision and warns the operator
that no new camera observation was recorded. If fewer than two distinct
waveform observations exist, no before/after comparison is presented.
This makes a +0 IRE result meaningful only when it corresponds to two
documented measurements with distinct timestamps and compatible signal
context, not an unchanged archived record.

The change is an **evidence-provenance safeguard**, not camera metrology or
an exposure calibration. A record hash means its contents match; it cannot
authenticate the meter, monitor, original camera signal, card or lighting.
No IRE-to-stop, lux, camera ISO/aperture or color-transform conversion is
introduced. Regression tests cover inherited snapshots, identical re-entry,
true two-capture sequences with intervening and later revisions, empty active
waveform state, missing history, tampering and the UI selector contract.
No K0/K1, `main`, paid AI, fixture control, merge, release or APK install.


### DoP comparison of two whole-scene incident-lux observations (2026-10-11)

The DoP can now compare **two genuinely distinct on-set incident-lux observations**
of the **entire intended owned-light arrangement with ambient included**,
reported at a single named subject mark. The pure offline
`listSceneIncidentLuxCaptures(history)` helper validates the whole immutable
SHA-256 revision chain and identifies only revisions where the reported
whole-scene reading appears for the first time or changes. A later revision
inheriting an unchanged record, or an exact manual re-entry with the same
observation and timestamp, is **not** another actual measurement. The app
labels the true origin of a currently inherited report. The two most recent
capture events, not the two most recent waveform/lux-bearing *revisions*,
are selected for comparison in the DoP camera panel and exported report.

`compareSceneIncidentLuxRevisions(history, beforeId, afterId)` requires two
actual captured readings in the same valid contiguous history, chronological
revision order and **strictly increasing user-declared UTC-offset-adjusted
measurement instants**, with at most **15 elapsed minutes** separating the
observations. It also requires the same declared meter model and physical
identifier, the same named subject measurement point, receptor orientation,
and an unchanged whole-setup metering protocol (all planned available
sources active plus ambient). These are declarations and NOT independent
instrument identification or laboratory traceability. Different fixture
counts and planned-position fingerprints are *reported*, not silently
treated as evidence of physical lamp levels or a known causal lighting
change. A daylight-saving wall-clock transition is handled using each
record's explicit UTC offset.

An accepted comparison reports the two actual **user-entered lux values**,
their signed absolute difference in lux, and the elapsed minutes. If both
observations are strictly positive, it additionally reports the ratio of
second-to-first incident illuminance and signed
`log2(laterLux/earlierLux)` **relative illuminance stops**. This is a
relative photometric representation of the *reported meter values* only,
**NOT a camera exposure correction, lens T-stop, scene EV, key/fill ratio,
image contrast, or automatic ISO/aperture recommendation**. If either
reading is zero, the absolute signed lux change is valid but the finite
ratio and stop difference stay `null` with an explicit zero-reading reason.
Missing, mismatched, stale, tampered, inherited or out-of-window readings
fail closed as `NOT_COMPARABLE`, returning null lux, ratio and stop fields
instead of invented numbers.

The comparison emits curated practical guidance only from relevant
EXP-001, SET-007 and PHY-005 book-principle cards *attached to the current
validated plan*, including real-world checks and limitations; these
paraphrases are not a claim that the complete copyrighted books have been
independently reviewed or that the user's device is calibrated. In all
outcomes the flags for physical rig, ambient stability, independent
meter identity/calibration and camera exposure validation remain false.
The feature makes no paid AI request, performs no physical fixture command,
does not sum isolated key/fill contributions, and never publishes or installs
a new APK.

The deterministic regression suite covers positive/negative/equal changes,
zero denominator, instrument/point mismatches, the inclusive 15-minute
boundary, DST fall-back, strictly ordered timestamps, changed reported
setup, immutable history, copied/identical readings, unknown revisions,
malformed or tampered records, book-card binding and UI provenance notices.
This change touches only approved Scene Planner files on
`feature/scene-planner-first-release`; `main`, K0, K1 and Draft PR #415
are not modified outside that branch.


### Offline DoP creative lighting and camera variants (2026-10-11)

The Android Scene Planner now has a **manual DoP variant editor** directly
beneath the light plan. This closes a practical gap: changing one proposed
fixture or camera parameter no longer requires sending another prompt to the
AI server or rebuilding a generic local plan. Users can enter a meaningful
DoP instruction and edit **explicit planned values** for existing light IDs:
normalized 2D X/Y position (5..95%), height (0.1..25 m), proposed source-
to-subject distance (0.1..100 m), output percentage (0..100%), and requested
color temperature (1000..20000 K). They can independently change camera
aperture, ISO, FPS, shutter angle, white balance and ND. No UI or core path
for this feature can buy AI inference, generate a video, send BLE/DMX commands,
replace an inventory fixture or silently create a new lamp. All edits are
**creative intention, not a report of physical rig state**.

The new `createDopLightingVariantRevision(parent, report)` operates
locally on the verified immutable plan, fails closed on unapproved fields,
out-of-range numbers, exponent/nonfinite input, unknown or duplicate lamp
IDs, missing explicit consent, empty instruction and no-op edits. Numeric
input is never clamped to an apparently plausible setting. Explicit catalog
ranges for Aputure LS 60d (5600 K) and LS 60x (2700–6500 K) reject unsupported
CCT targets. Other model capabilities and the physical output/dimmer
behavior are NOT presumed verified. Changing the requested Kelvin, position
or intensity is not proof that a selected physical fixture can produce it.

Each accepted edit creates a new SHA-256-bound child plan and light plot
with the same scene identity, stable fixture IDs and preserved parent
history. `dopLocalVariant` records the last user-confirmed instruction,
which planned lamps and camera fields changed, provenance
`DOP_CONFIRMED_PLANNED_EDIT_NOT_PHYSICALLY_VERIFIED`, and explicit false
flags for measured light, calibrated camera exposure, real fixture control
and generated AI video. The last DoP variant label survives subsequent
on-set measurement revisions; it does not falsely report those measurements
as additional creative changes.

Evidence invalidation is deliberately asymmetric. **Any edit to the
planned lights** invalidates isolated on-set lux readings, combined scene
incident lux and gray-card waveform evidence in the **child** plan, since
they belong to the old rig. Changes to normalized position, estimated
distance or planned fixture height also remove that lamp's now-stale
user-attested physical distance; unchanged lamp distances and independently
attested optical attachments remain. **Camera-only** plan changes preserve
actual incident/scene lux and measured physical distances but remove the
gray-card waveform reading bound to the old camera settings. The complete
original parent remains unmodified and readable. Manufacturer photometric
references are recalculated only against their **exact documented 100%
output, optic, Kelvin, beam and measured distance**; the full-output lux
sample is revoked if the new creative setting no longer matches. An edited
percentage is never interpolated into a fabricated lux figure.

The UI immediately rerenders the shared 2D light plot, local conceptual
photo and all parameter cards from the child revision. It discards stale
AI still previews, storyboard and exported conceptual video instead of
displaying them as though they reflected the edited rig. It never changes
an existing paid-video receipt: such receipts remain tied to their original
revision, and the new editor issues no paid calls. Both the plan export and
UI explain the last manual DoP request and, if present in the current
revision's already curated expert base, practical principles/validations
from PHY-001, PHY-002, PHY-005, SET-005, SET-007, EXP-001,
EXP-002 and EXP-003. No book card or book page is invented.

The Android plot and photo stay **illustrative**, not a real relighted
still/video or a metrically reconstructed scene. The revised camera values
are **unverified proposed camera settings**, not on-set ISO/T-stop
calibration, and no measured scene EV or lens/sensor exposure is inferred.
Regression tests cover valid combined and camera-only creative revisions,
fixed-CCT fixture rejection, invalid range/field/fixture submissions,
strict no-op rejection, preserved revision history, invalidated old
meter/waveform data, retained physical optics, stale manufacturer lux
references, attached book-card provenance, hash tampering, and a UI
contract without network calls, video payment or physical-light commands.
The changes are restricted to the Scene Planner feature branch; K0/K1,
`main`, Draft PR #415, release, APK installation and publication remain
untouched.


### DoP before/after: verified planned-value comparison (2026-10-11)

The offline DoP editor displays the last actual direct parent/child creative
revision as a numeric before/after list. Existing light IDs, fixture identity
and their source remain unchanged. Each changed proposed X/Y, height,
distance, output percentage or Kelvin appears alongside its prior value;
camera FPS, shutter angle, f-number, ISO, WB and ND appear as planned values.
Fields previously unknown (null) are displayed as not yet entered, rather
than causing the comparison to disappear or being treated as measured zero.
The SHA-256-verified core function compareDopPlannedRevisions(before, after)
requires direct lineage and exact numeric correspondence with the saved
changed-field ledger. Later physical-meter revisions inheriting a prior DoP
label cannot masquerade as new creative edits. Reversed, skipped, tampered,
and unchanged pairs are rejected rather than fabricating a plan comparison.

All four provenance flags for actual fixture commands, measured light,
calibrated camera exposure and video relighting are false. No measured lux,
camera scene EV, equipment capability, rendered frame or clip is claimed.
Regression coverage checks combined and camera-only edits, immutable
comparison results, lineage rejection, inherited measurement revisions,
and the visible UI contract. Only four approved Scene Planner files on
feature/scene-planner-first-release change. Draft PR #415 remains open;
main, K0, K1, release, publishing and APK installation are not touched.


### Full DoP change history in Android UI, JSON, and text handoff (2026-10-11)

The verified offline creative-edit history now shows **all actual DoP
parent/child plan changes**, rather than only the last revision's copied
label. Each entry displays chronological revision sequence/IDs, the precise
DoP instruction and old/new numeric planned fixture and camera values.
The most recent entry is expanded by default; older entries are collapsible.
All relevant original immutable revisions remain intact. The full timeline
is included in the Android share-text report and in JSON as the optional
derived `dopPlannedEditHistory` field. Existing export version and revision
schema are unchanged. Photo/video source bytes are not included.

`listDopPlannedEditEvents(history)` first validates the complete SHA-256
revision chain, examines actual changes to the six permitted light and six
camera parameters, and calls the strict existing direct-revision comparison
only when planned numeric parameters genuinely changed. Measurement, optic
and camera-signal records may carry an inherited DoP label, but those do NOT
count as new creative edits. Conversely, two consecutive authentic DoP edits
with identical wording and changed-field labels but different numeric values
both count: simple metadata string comparison would have dropped the second.
Any claimed creative event whose actual values contradict its recorded
change ledger fails closed. History and all nested comparisons are immutable.

Regression coverage includes two separated creative revisions with an
intervening real meter entry, repeated identical DoP metadata with different
values, camera-only edits, no-edit histories, forged/skipped lineage, frozen
results and the UI/export handoff. All outputs retain explicit false flags
for real lamp control, lux verification, measured camera exposure and AI
video relighting. This feature neither requests an AI generation nor
modifies `main`, K0/K1, releases, or installed Android applications.


### Revision-bound sampled-frame DoP lighting cue sheet (2026-10-11)

The Android Scene Planner now prepares a read-only, chronological DoP lighting
cue sheet for **one to six browser-seek JPEG reference timestamps**. It lists
the proposed role, light ID, X/Y, fixture, planned intensity/CCT, height and
distance at each unambiguously time-matched estimated actor-path stage, plus
the current proposed camera settings. It identifies planned key/ambient
coverage gaps without claiming that physical lighting is dark or adequate.
No actor stage is invented if the model lacks a matching timestamp, or if
more than one stage ambiguously matches a sample. Only plan-provided
estimated coordinates are displayed. There is no pixel-level temporal
tracking, mask, rendered preview, true video relighting or exposure solution.

The offline core accepts only ascending finite numeric timestamps (0–120 s,
at most two decimal places), exactly one `timeSec` key per sample and at most
six samples. It verifies the revision hash before use and returns a frozen
receipt with `revisionId`, `planHash`, `lightPlotRevisionId` and explicit false
flags for original source identity, true frame PTS, actor identification,
physical lamp state, camera calibration and generated AI video. WebView seeks
are **approximate**, not the complete decoded video timeline from Phase 3B.2.
Source images, file paths, video bytes and hashes are not copied into the
receipt. Full temporal relight continuity is not claimed.

The Scene Planner ties its transient sampled JPEG set to the video session
used for the last successfully created plan revision. Selecting another
video or photograph makes cue display explicitly stale until a new plan is
generated, preventing silent pairing of the old light plot with new footage.
Manual offline DoP child revisions of the SAME source session immediately
update the proposed cue values and preserve the previous immutable plan.
Only a session-matched, revision-validated cue sheet is included in the
optional JSON export and textual DoP handoff; media bytes are still omitted.
After reopening the app there are no persisted source frames, so cues must
be re-established from an imported video and a new plan, never inferred
from historical JSON alone. Tests cover matched, unmatched and gap stages,
out-of-order/invalid/oversized samples, immutable results, revised light
and camera proposals, forged plan hashes, and UI/export session guards.
This work stays inside four Scene Planner files on its feature branch:
no `main`, K0/K1, paid AI route, physical fixture control, release, or
installation change.


### Media/plan mismatch gates before paid video and WebM (2026-10-11)

Plan-to-selected-video session binding now gates all media-dependent actions:
offline preview, storyboard, conceptual WebM export and **paid video start**.
A newly selected clip or photo cannot silently reuse the earlier revision.
An in-flight storyboard holds the planning busy lock; paid start and WebM
export hold the video busy lock through their asynchronous operations, so a
new selected clip cannot replace source bytes between validation and output.
Existing unresolved paid-video request receipts and status reconciliation
remain available and are not discarded or reissued automatically. The source
byte hash remains unverified; this is only an in-memory mismatch guard.
Newly computed sampled timecodes that are duplicated/nonmonotonic do not
silently gain confidence or prevent unrelated plan JSON export. After DoP
light edits, the movement preview says earlier coverage claims are stale.
Regression checks enforce source binding before paid start, upload lock,
storyboard lock, local WebM lock, safe exports and coverage warnings. No paid
service call was issued during implementation; control, K0/K1, `main`, merge,
release, installation and publication remain unchanged.


### Offline sampled-frame comparison: original / creative look (2026-10-11)

The Android Scene Planner now displays a selectable visual comparison beside
the revision-bound six-frame DoP cue sheet. A single locally extracted JPEG
sample is shown twice: unfiltered on the left and with a deterministic CSS
look filter on the right (Night/Day-for-Night, Moody, or neutral). The six
reference timecodes remain approximate WebView seek positions, not source
frame presentation timestamps. Source bytes and decoded pixels are not
independently attested. Both images are from the same existing in-memory
sample; no still/video is generated, written to JSON, uploaded, billed or
exported by this comparison. Strict data:image/jpeg;base64 validation and a
bounded URI length prevent HTML injection from an arbitrary frame string.

Rendering requires the same in-memory media session and a verified immutable
lighting-plan revision; selecting new photo/video or restoring old revisions
blocks the view until a new plan is made. The slider rechecks current plan
identity, cue index and approximate sample timestamp. If the actor-path
stage is ambiguous/missing, no source is assigned to the selected frame.
After a DoP light edit, outdated per-stage coverage is explicitly suppressed.
The overall planned fixtures, Kelvin, output, positions, distance and camera
settings are shown as NOT measured per-frame; CSS filter does NOT respond to
individual light changes, camera exposure or geometry. The view also shows
at most two already attached expert knowledge cards with validation and
limitations; it does not invent book page references or lighting readings.

Added guard/regression assertions for same-image use, revision/time matching,
strict source data URIs, unchanged/no trusted per-frame light claims, no
media persistence/network calls, and safe Android UI inclusion. The work is
limited to the existing Scene Planner UI/test/document files on the draft
branch. Phase 3B.3 real temporal Day-for-Night video relighting remains
unimplemented and requires separately validated renderer and real footage.


### WebView original-frame code-value audit (2026-10-11)

Each of the existing at-most-six original video seek samples can now collect
one tiny 32x32 canvas observation locally before any creative CSS look. The
pure offline `summarizeWebViewFrameCodeValues` computes a BT.709-*weighted
8-bit code* proxy (NOT photometric luma): mean, P10/P90, and fractions of
pixels in near-black <=16 or near-white >=235 code bins. This is not linear
scene luminance: source transfer, colorimetry, codec rounding, camera sensor,
scene lux and real exposure are unverified. If readback is unavailable, its
sample remains unknown, never filled with invented numbers.

`createOfflineCodeValueAudit` checks a SHA-256-verified immutable plan revision,
strictly increasing WebView sample times through the existing DoP cue-sheet
contract, exact bounded scalar schemas and explicit unknown sample states.
Only the six bounded scalar records and their plan/plot binding can be added
to the optional `webViewCodeValueAudit` JSON export and textual DoP handoff;
never export raw canvas RGB buffers, local JPEG bytes, private paths or URLs.
A delta between two *sampled mean code values* is descriptive only: spaced
seek frames are not consecutive original PTS samples, so this is NOT evidence
of flicker, temporally stable lighting or shot continuity. DoP plan changes
must not mutate the original image statistics. Original full video remains
on the device; readback uses the already selected local source.

The in-app original/illustrative CSS look comparison now shows source-only
code values (or an explicit unavailable reason). Missing samples break
numerical delta continuity. Existing expert book cards, camera/lighting plan,
paid video locks, and physical on-set measurement provenance are preserved.
Pure regressions exercise black/white/mid/half-frame results, invalid alpha,
bad dimensions, missing/forged statistics, timestamp order, immutable output,
revision tampering and preservation of source measurements across DoP edits.
Feature is **not** full-frame video analysis, Day-for-Night relighting, motion
tracking, a color-managed preview, or a verified continuity metric. No AI
provider, fixture command, app publication, K0/K1 or `main` mutation occurs.


### Source-bound all-decoded-frame code continuity audit (2026-10-11)

An offline read-only QC function now summarizes **every adjacent decoded
presentation-frame pair**, not six widely spaced Android samples. It reuses
the pre-existing `ingestOriginalVideo` + `analyzeOriginalVideo` bounded H.264
decoder pipeline and does not call any AI endpoint. Frame source-byte hash,
YUV pixel hashes, immutable DoP revision, PTS/timebase, and duration continue
to be verified by that pipeline before provenance is granted. Existing
max-30-second/max-1800-frame, input-size, time, memory and concurrency
guards stay in force; originals remain unchanged.

`summarizeDecodedCodeContinuity` is a **pure UNTRUSTED-input** metric grouper.
It verifies contiguous CFR/VFR presentation timing and re-derives existing
per-frame comparison fields and single-frame transient heuristics, rejecting
forged or inconsistent transition records. Adjacent transitions are grouped
into candidate and unflagged code-value intervals, using original PTS ticks
without rounding away variable frame durations. The timeline covers all
adjacent frame transitions. Each interval includes bounded luma/histogram
summary scalars and explicit false flags for physical or cinematic facts.
A flagged interval means DoP review is warranted; an unflagged interval does
NOT prove flicker-free imagery, a correct cut, lighting stability or correct
Day-for-Night treatment. Motion/camera movement, edits and physical light
changes are not disentangled. No optical flow, depth, masks or video is made.

`createVerifiedDecodedContinuityAudit(bundle, revision)` uses the existing
private in-process `verifyVisualAnalysis` trust boundary, then creates an
immutable content-hashed, original-source/plan/plot/temporal/visual-bound
diagnostic receipt. Untrusted JSON, synthetic buffers, cloned receipts and
mismatched source/revisions cannot gain that status. A separate verifier
checks the trusted instance and parent identities. Reports contain no pixel
bytes, media paths, links, tokens or newly rendered video. These reports are
**offline backend diagnostics only**, not yet integrated into Android UI,
the paid provider route, or an automatic export/publishing pipeline.

Synthetic mandatory tests cover VFR interval boundaries, exact candidate/
transient interval grouping, quiet frames, immutable outputs, raw-data leaks,
forged summaries, duplicate/nonmonotonic PTS and rejection of untrusted
provenance. Optional tests on explicitly selected existing FFmpeg fixtures
cover an actual decoded illumination jump, one-frame flash-like pattern,
VFR full-frame coverage, original-byte preservation and wrong source/revision
rejection. CI without an approved existing FFmpeg binary must report actual
decoded-frame tests **NOT EXECUTED**; mandatory synthetic tests alone do
not validate performance on real footage or verify practical visual quality.


### Offline Day-for-Night pixel-grade pilot (2026-10-11)

The existing `backend/scene-planner-video-visual.js` now implements a genuine
bounded transformation of decoded YUV420p pixels rather than merely a CSS
filter. A source/plan-hash-bound immutable recipe requires a user-specified
Day for Night look with daytime capture and two strictly validated creative
controls. One identical luma-code attenuation and chroma-code cooling operation
is reused on every frame. Original source bytes are never modified.

This is explicitly a **non-color-managed illustrative video pixel grade**,
not light-field rendering: YUV transfer/range/primaries are unverified;
fixture positions, physical illumination, optical flow, shadows, masks and
camera exposure are not simulated. No automatic framewise adjustment is made.
The isolated pilot does not encode, mux or export MP4, transmit original
video, invoke any paid provider or enable an Android UI/release feature.

`gradeVerifiedDayForNightFrames` only accepts a trusted local existing
decoded visual-ingestion bundle and matching immutable DoP recipe. It rechecks
the chosen local original and every original decoded pixel SHA-256 through
the existing bounded decoder before streaming ephemeral transformed raw
frames to a synchronous consumer. Its source/visual/revision-bound receipt
contains original PTS and duration, original/graded frame hashes and luma-code
statistics, with all physical and MP4 output claims explicitly false.
Test coverage includes deterministic pixel transformations, invalid controls
and buffer formats, unchanged input, recipe trust, and optional real procedural
H.264 CFR/VFR video decoding, complete frame processing and forged receipt
rejection. Without a configured existing FFmpeg binary, CI tests only the pure
code transformations and reports actual decoded processing NOT EXECUTED.
Next prerequisites: explicit color-managed validation, bounded PTS-preserving
encoder/muxer and operator-reviewed actual footage, before presenting a real
Day-for-Night export or suggesting photometric accuracy.


The offline YUV pixel-grade pilot is hosted inside the already-tracked
`backend/scene-planner-video-visual.js`, without modifying the pre-existing
Project 5 stable-base protection rules or adding a separate backend module.


### Day-for-Night all-frame code-consistency quality gate (2026-10-11)

`summarizeDayForNightGradeCodeConsistency` is a pure, explicitly UNTRUSTED
offline scalar checker for up to 1,800 frames. It validates exact source and
graded code statistic field schemas (no private pixel arrays or JPEG data),
contiguous original integer PTS and VFR durations, matching dimensions,
immutable SHA-256-formatted source/graded pixel hashes and a single requested
global darkening coefficient. A fixed 8-bit round-to-nearest Y-code LUT must
produce each output mean within 0.5003 code value of that coefficient times
the source mean; adjacent changes must agree within 1.0006 code values.
Violations block the QC report. This is strictly a proof of deterministic
scalar code consistency, **not** a colorimetry/exposure/scene-light proof.

Absolute graded-frame mean Y changes of 24/255 code units or more are marked
for DoP review with original PTS ticks; the threshold is an engineering
review heuristic, not a validated motion, cut or flicker detector. The code
never calls a flat timeline flicker-free, even when no jumps are flagged.
`createVerifiedDayForNightGradeQc` requires the in-process original-source
decoder/visual receipt and the matching trusted grade frame receipt, recipe,
plan revision and hashes; it references the original continuity audit and
retains source-side candidate transitions. Reports are immutable, SHA-256
content-bound, contain no media URLs, raw pixel data, paths or secrets, and
explicitly deny MP4 export authorization, visual approval and real relighting.
The paired verifier rejects cloned JSON, wrong original/revision/receipt and
forged provenance. Only existing Scene Planner video, test and documentation
files are changed; the Project 5 protective allowlist is untouched.

Mandatory regression tests cover code-gain rounding tolerance, variable-frame
timing, multiple exposure-like jumps, quiet timelines, mutated scalar and
PTS fields, fake SHA strings, privacy/pixel-field rejection, immutability and
untrusted receipt denial. Optional configured-FFmpeg procedural decode tests
cover real in-process YUV frame grade, fixed-gain QA, source candidate links,
VFR end time and live receipt verification. The latter remain NOT EXECUTED
when a suitable explicitly selected decoder is unavailable in CI. The grade
pilot remains backend-only, with no MP4 file, provider call, on-device action,
fixture command, merge, APK installation or release.


### Fail-closed MP4 frame-timing handoff for graded Day-for-Night (2026-10-11)

The offline video module now provides an **untrusted, unencoded source-timeline
proposal** and a separately trusted in-process MP4 handoff. Neither function
runs FFmpeg encoding, creates output files, transmits media nor enables Android
exports. The exact original zero-origin sample-table PTS and durations (CFR
or VFR) are represented in integer ticks at the original `1/timescale` clock;
no average FPS, guesswork, frame dropping or constant-rate approximation is
permitted. The source and graded raw YUV420p frame SHA-256 values are included
per frame for later correlation, without raw pixel buffers, private file paths,
tokens or media URLs. Supported input is deliberately narrow: 2-30 seconds,
up to 1,800 frames, zero-origin gap-free non-B-frame H.264 at up to 1920x1080,
even dimensions, PTS=DTS and exact original sample durations. The pure
proposal is **not** a verified source/decoder receipt.

`createVerifiedDayForNightMp4Handoff` requires the live, in-process verified
original decoding bundle, immutable DoP revision, private grade recipe, full
graded-frame receipt and verified grade QC. It cryptographically binds source
identity, temporal and visual hashes, planned fixture/light-plot revision,
grade receipt and QC. The result is permanently `BLOCKED_NO_MP4_FILE_AND_
UNRESOLVED_PROOFS`, with explicit unresolved requirements for source transfer
and color range, a PTS-aware H.264 encoder/MP4 muxer, re-decoded MP4 frame and
timestamp validation, and human DoP image approval. If the source has an audio
track, it additionally blocks silent audio removal pending actual audio
decoding, sync and preservation verification. Original or graded visual jumps
add a separate human-review blocker. This is a production-safety prerequisite,
**not export authorization**; no MP4, physical relighting, calibrated camera
exposure, audio rendering or color-managed result has been produced.

Tests include mandatory pure CFR/VFR frame schedule preservation, audio policy,
invalid timebases/durations/dimensions/PTS/DTS, source and graded SHA format,
privacy-field rejection, immutability, and rejection of forged trust. Optional
configured-FFmpeg tests use original procedural MP4 source, trusted graded
frame and QC receipts, exact CFR/VFR mapping and live handoff verification.
Configured decoder tests must report NOT EXECUTED when FFmpeg is absent;
the existing main/K0/K1 and fixture-control protections are untouched.
