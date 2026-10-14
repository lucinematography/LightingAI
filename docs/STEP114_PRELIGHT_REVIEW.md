# Step 114 — revision-bound prelight review

The Android Scene Planner now offers three manual DoP checks: motivated light,
fill/shadow contrast, and subject/background separation. Each requires an explicit
choice: reviewed, needs adjustment, or not applicable. There is no automatic
overall approval and no claim of measured exposure or verified physical lighting.

Records are stored separately from immutable plans under
`lighting_scene_planner_prelight_reviews_v1`, with scene, revision, plan hash,
light-plot identity, timestamp and decisions. A later revision requires fresh
decisions even when it inherits lighting parameters. Earlier records remain in
history and JSON export. The most recent record for the current revision populates
the controls. Changing a selection requires saving another record. Corrupt or
unmatched stored review records block review writes without replacing that store;
normal plan handling remains available. Storage errors do not claim review success.

## Source basis

Original reviewed source: Boris Popović (priredio), *Svjetlo u TV studiju /
Primijenjena rasvjeta*, local `Downloads/tvrasvjeta.pdf`, 151 PDF pages.
SHA-256: `a0afabb630af7e9ec361635157f270065f8ced8470ea71d1d850afa7a8e96994`.
This matches the Popović source hash already recorded in K0.

- Printed/PDF page 93: motivation connects direction, quality, color and intensity
  with a source visible in the scene or plausibly outside the frame. The first
  check asks the cinematographer to assess those attributes.
- Printed/PDF page 32: backlight can separate a subject from the background; fill
  reveals shadow detail and regulates contrast while avoiding visible additional
  shadows. These support the second and third checks.
- Printed/PDF page 34, reviewed in text extraction: the basic lighting arrangement
  is not a rigid recipe for film scenes. Separation is a creative objective;
  the checklist does not require every scene to use a backlight.

Pages 32 and 93 were checked in both extracted text and rendered page images.
This is a scoped review of these pages, not certification of all K0 citations.
Landau and Brown originals were not located in the folders checked in step 114;
their K0 page references remain independently unverified. K0 and K1 are unchanged.
The APK contains only brief original questions and source metadata, no book PDFs
or reproduced book illustrations.

## Validation and limits

Regression coverage is in `backend/scene-planner-revisions-selftest.js`: exact
revision binding, plan immutability, incomplete/invalid choices, export and reload,
fresh review after plan change, preserved corrupt data, and failed local writes.
Run with `node backend/scene-planner-revisions-selftest.js`.

Local validation passed: 21 revision regression groups, Scene Planner base/wiring
checks, photometric checks, 10 K0 groups and 12 K1 groups; JavaScript syntax and
`git diff --check` also passed. K1's optional real video binding was not run.
The `npm run check` command was unavailable because this runtime has Node but no
npm command or bundled npm CLI. Subsequently, all scripts in the existing package
`check` chain were executed successfully through a temporary Node runner that
expands `npm run` references and runs the same Node commands in `backend`.
This included catalog, planner, temporal, ingestion, visual, calibration, knowledge,
mocked provider/storage video, staging-safety, syntax and source-audit checks.
Optional real-film/FFmpeg checks were not enabled. No dependency installation
was performed. This does not replace Android lint, unit tests or APK assembly.

APK readiness: Java, Gradle, adb and the usual local Android SDK/Android Studio
paths were not available in this runtime. GitHub build #7629 (run 38165628151)
is successful for the previous commit e954da5; draft PR #415 is open on
`feature/scene-planner-first-release` at that commit. The current feature remains
local and has not yet been included in an APK. A new CI build requires publishing
the reviewed feature changes to that branch first.

The feature helps a cinematographer assess an AI plan using concrete lighting
principles before shooting. It does not analyze pixels or add video processing,
fixture control, photometric certification or automated DoP acceptance. Phone
WebView interaction and APK installation require separate device validation.
