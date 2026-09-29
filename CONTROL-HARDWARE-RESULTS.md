# LightingAI CONTROL Hardware Validation Results

Use this file only for the physical release-gate result for PR #408.

## Candidate identity

- PR: #408
- Branch: `feature/production-control-routing`
- Candidate HEAD:
- Control Lab run:
- APK artifact:
- APK SHA-256:
- Test date:
- Tester:

## Hardware identity

- Phone model:
- Android version:
- Wi-Fi/router/AP:
- VPN disabled: YES / NO
- Mobile-data route disabled or isolated: YES / NO
- Bridge model:
- Bridge firmware:
- Fixture model:
- Fixture firmware:
- Fixture DMX mode:
- Fixture DMX start address:
- Universe:

## Result legend

- PASS = observed behavior exactly matches the release gate.
- FAIL = observed behavior contradicts the release gate.
- N/A = hardware path not available; must include a reason.
- NOT RUN = test has not yet been executed.

A test with any critical FAIL blocks merge and final APK release.

## Production scope policy

- Production release scope is standards-based lighting control: Art-Net, sACN/E1.31, DMX512 and CRMX using verified fixture profiles.
- Proprietary vendor Bluetooth/app transports (AsteraApp/BTB/UHF, Sidus proprietary mesh, Godox app BLE, etc.) are LAB/diagnostic paths unless an official vendor SDK or documented third-party protocol is verified.
- A proprietary Bluetooth LAB path may be deferred and marked N/A without blocking the production CONTROL release gate.
- A failure in a standards-based DMX/CRMX/Art-Net/sACN path remains release-blocking.

## Test 0 - direct native Art-Net/sACN

Status: NOT RUN

Art-Net direct:
- ARM/preflight blocks output before ARM: PASS / FAIL / N/A / NOT RUN
- Verified dimmer behavior: PASS / FAIL / N/A / NOT RUN
- Additional verified semantic control: PASS / FAIL / N/A / NOT RUN

sACN direct:
- Fresh ARM required after protocol change: PASS / FAIL / N/A / NOT RUN
- Verified dimmer behavior: PASS / FAIL / N/A / NOT RUN
- Additional verified semantic control: PASS / FAIL / N/A / NOT RUN

Evidence:
- Operator-status screenshot:
- Fixture-response video/photo:
- Notes:

## Test A - Art-Net -> wired DMX

Status: NOT RUN

- No physical output before ARM: PASS / FAIL / NOT RUN
- ARM succeeds only on a valid route: PASS / FAIL / NOT RUN
- 10% dimmer: PASS / FAIL / NOT RUN
- 25% dimmer: PASS / FAIL / NOT RUN
- 50% dimmer: PASS / FAIL / NOT RUN
- 75% dimmer: PASS / FAIL / NOT RUN
- 100% dimmer: PASS / FAIL / NOT RUN
- MASTER DIMMER matches fixture control: PASS / FAIL / NOT RUN
- No unrelated channels change: PASS / FAIL / NOT RUN
- Operator status reports expected state: PASS / FAIL / NOT RUN

Evidence:
- Screenshot:
- Video:
- Notes:

## Test B - sACN -> wired DMX

Status: NOT RUN

- Sidus One/source reset performed before protocol change: PASS / FAIL / N/A / NOT RUN
- Fresh ARM required: PASS / FAIL / NOT RUN
- Same verified semantic mapping as Art-Net: PASS / FAIL / NOT RUN
- No stale Art-Net route remains armed: PASS / FAIL / NOT RUN

Evidence:
- Screenshot:
- Video:
- Notes:

## Test C - CRMX output

Status: NOT RUN

- Compatible CRMX hardware available: YES / NO
- Art-Net -> CRMX: PASS / FAIL / N/A / NOT RUN
- sACN -> CRMX: PASS / FAIL / N/A / NOT RUN
- Semantic mapping matches wired DMX: PASS / FAIL / N/A / NOT RUN
- PROFILE HOLD remains blocked: PASS / FAIL / N/A / NOT RUN

Evidence:
- Screenshot:
- Video:
- Notes:

## Test D - MASTER / group scope

Status: NOT RUN

- Two verified fixtures available: YES / NO
- Selected scope displayed correctly: PASS / FAIL / N/A / NOT RUN
- MASTER changes only selected fixture(s): PASS / FAIL / N/A / NOT RUN
- ALL restores full verified selection: PASS / FAIL / N/A / NOT RUN
- Hidden/stale selection never controls unexpected fixture: PASS / FAIL / N/A / NOT RUN

Evidence:
- Screenshot:
- Video:
- Notes:

## Test E - scene and cue

Status: NOT RUN

- Scene A recall: PASS / FAIL / NOT RUN
- Scene B recall: PASS / FAIL / NOT RUN
- GO order deterministic: PASS / FAIL / NOT RUN
- PREV order deterministic: PASS / FAIL / NOT RUN
- CURRENT/NEXT cue display correct: PASS / FAIL / NOT RUN
- Active fade rejects conflicting GO: PASS / FAIL / NOT RUN
- Patch mismatch blocks stale recall: PASS / FAIL / NOT RUN

Evidence:
- Screenshot:
- Video:
- Notes:

## Test F - GLOBAL BLACKOUT / RESTORE

Status: NOT RUN

- GLOBAL BLACKOUT zeros all LightingAI-known universes: PASS / FAIL / NOT RUN
- RESTORE returns exact known pre-blackout state: PASS / FAIL / NOT RUN
- Patch change blocks stale RESTORE: PASS / FAIL / NOT RUN

Evidence:
- Screenshot:
- Video:
- Notes:

## Test G - app background / resume

Status: NOT RUN

- LIVE output active before backgrounding: PASS / FAIL / NOT RUN
- Backgrounding stops live output: PASS / FAIL / NOT RUN
- ARM clears on background: PASS / FAIL / NOT RUN
- Return does not auto-rearm: PASS / FAIL / NOT RUN
- Return does not auto-resume stale LIVE output: PASS / FAIL / NOT RUN
- Fresh preflight/ARM required: PASS / FAIL / NOT RUN

Evidence:
- Screenshot:
- Video:
- Notes:

## Test H - network-change fail-safe

Status: NOT RUN

- Wi-Fi/network change invalidates armed route: PASS / FAIL / NOT RUN
- LIVE output stops: PASS / FAIL / NOT RUN
- Operator status reports re-arm requirement: PASS / FAIL / NOT RUN
- Reconnection does not auto-rearm: PASS / FAIL / NOT RUN
- Fresh ARM succeeds only after route is valid again: PASS / FAIL / NOT RUN

Evidence:
- Screenshot:
- Video:
- Notes:

## Test I - invalid route checks

Status: NOT RUN

- VPN/ambiguous second route stays locked: PASS / FAIL / NOT RUN
- Invalid Art-Net target stays locked: PASS / FAIL / NOT RUN
- Art-Net AUTO without subscriber stays locked: PASS / FAIL / NOT RUN
- sACN without usable multicast route stays locked: PASS / FAIL / NOT RUN
- Universe outside bridge limits stays locked: PASS / FAIL / NOT RUN
- PROFILE HOLD fixture stays blocked from semantic control: PASS / FAIL / NOT RUN

Evidence:
- Screenshot:
- Notes:

## Final physical verdict

- Direct Art-Net: PASS / FAIL / N/A / NOT RUN
- Direct sACN: PASS / FAIL / N/A / NOT RUN
- Wired DMX via bridge: PASS / FAIL / NOT RUN
- CRMX via bridge: PASS / FAIL / N/A / NOT RUN
- ARM/preflight fail-safe: PASS / FAIL / NOT RUN
- MASTER/group scope: PASS / FAIL / N/A / NOT RUN
- Scene/cue: PASS / FAIL / NOT RUN
- GLOBAL BLACKOUT/RESTORE: PASS / FAIL / NOT RUN
- Background/resume fail-safe: PASS / FAIL / NOT RUN
- Network-change fail-safe: PASS / FAIL / NOT RUN
- PROFILE HOLD blocking: PASS / FAIL / NOT RUN

Release gate:
- APPROVED FOR MERGE: YES / NO
- APPROVED FOR FINAL APK: YES / NO
- Blocking failures:
- Deferred paths and reasons:
- Proprietary vendor Bluetooth LAB diagnostics do not block production release unless explicitly promoted to a verified production driver.


## Astera Titan BTB diagnostic bench - 2026-09-29

- Fixture: Astera Titan Tube FP1-BTB, serial 01021365
- LightingAI BLE discovery: PASS
- Fixture identity match: PASS
- AsteraNext BTB discovery: PASS
- AsteraNext Bluetooth connection: PASS
- LightingAI read-only GATT inspection: FAIL
- Observed UI regression: GATT in-progress text could remain stale after lifecycle cancellation
- Current hypothesis: LightingAI generic Android GATT/session path is not sufficient for Astera proprietary BTB session; fixture Bluetooth hardware itself is functioning
- Next step: collect exact Android GATT failure code with Control Lab diagnostic build before any vendor BLE control implementation
- MAIN: untouched
- PR #408: keep draft / do not merge
