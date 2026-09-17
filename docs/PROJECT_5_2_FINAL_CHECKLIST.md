# LightingAI Project 5.2 - Final checklist

Stable starting reference for this phase: main build 606, SHA `d96a92e` (historical baseline; always verify current main before new work).

## Automated gate

A release candidate is not ready for phone testing until all of these are green:

- complete equipment catalog validation and existing compatibility self-tests;
- Android WebView JavaScript syntax checks;
- Project 5 safety/base tests;
- Project 5.2 release gate (AI timeout, guarded request path, Planner bridge, preview path, client secret scan);
- project-backup self-test;
- Android debug APK build;
- packaged APK asset verification and build identity verification.

## Project 5.2 functional acceptance

- AI Visual Scene Plan opens from Equipment without navigation regression.
- Scene photo can be selected from gallery and captured from camera.
- Saved Planner actor/background measurements are shown and can be included in the AI request.
- AI plan leaves the working state with either a result or a clear bounded timeout/error.
- AI plan uses only selected/available fixtures unless optional advice is clearly identified.
- Setup map and plan text render correctly.
- AI photo-preview completes or fails cleanly; it must not leave a permanent spinner.
- Before/after preview is usable on the phone.
- Temporary test/diagnostic UI is removed or intentionally hidden from normal user mode before final release.

## Regression smoke test

After the golden-scene test, verify:

- equipment catalog and brand folders;
- Planner and saved measurements;
- gallery import and scene camera;
- SUNCE;
- project backup/export;
- DMX, DOF, Flicker, Continuity, Shot List, Cue, Beam Coverage, Camera Setup A/B/C, ratio, power and CCT/gel entry points;
- Serbian/English switching for the touched Project 5.2 UI.

## Release identity

Record the final successful `main` workflow run number and short SHA. The installed APK must expose enough build identity to distinguish it from older/demo builds.

## Final rule

During release-candidate freeze, add no unrelated features. Fix only items required to pass this checklist. Queue new ideas for the next project phase.
