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
