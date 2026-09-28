# LightingAI CONTROL Hardware Validation

Status: final physical validation plan for PR #408.

This document does not change production behavior. It defines the minimum bench test needed after the automated CONTROL audit is green.

## Goal

Validate protocol families, not every physical fixture.

A single representative bench can validate:

1. LightingAI -> Art-Net -> bridge -> wired DMX -> fixture
2. LightingAI -> sACN -> bridge -> wired DMX -> fixture
3. LightingAI -> Art-Net/sACN -> bridge -> CRMX -> fixture (when CRMX hardware is available)
4. ARM/preflight fail-closed behavior
5. MASTER / fixture control / scene / cue / GLOBAL BLACKOUT
6. lifecycle and network-change fail-safe behavior

## Preferred reference bridge

Aputure Sidus One.

Official Aputure documentation states that Sidus One:
- accepts Art-Net or sACN over Wi-Fi;
- listens on Universes 1-4;
- outputs one selected universe through wired DMX or CRMX;
- locks to the first Art-Net/sACN protocol detected until the network/source is reset or removed.

Official references:
- https://help.aputure.com/en/sidus-one/art-net/sacn-over-wi-fi-in
- https://help.aputure.com/en/sidus-one/product-and-technical-specification
- https://help.aputure.com/en/sidus-one/faq

## Minimum bench

- Android phone running the CONTROL candidate build.
- Dedicated Wi-Fi network with VPN/mobile network routing disabled during the test.
- Sidus One with current firmware.
- One fixture with a verified LightingAI DMX profile.
- Preferred single-fixture reference: Aputure LS 600c Pro II, because the current verified catalog exposes wired DMX/RDM, CRMX, direct Art-Net/sACN and a verified Mode 4 RGB 8-bit 5ch profile in one device.
- If LS 600c Pro II is unavailable, use any fixture whose LightingAI card shows a verified profile; do not substitute a PROFILE HOLD fixture.
- Prefer wired DMX first because it removes CRMX pairing as a variable.
- Add CRMX as a second pass when a compatible receiver/fixture is available.
- Use Universe 1 unless a different universe is required by the fixture setup.

## Preconditions

1. Bridge firmware is current.
2. Phone and bridge are on the same dedicated lighting network.
3. No second console or DMX source is active on the same universe.
4. Fixture DMX address and mode exactly match the LightingAI patch.
5. LightingAI shows a verified profile, not PROFILE HOLD.
6. Start with output LOCKED.
7. Use one universe for the first pass.

## Test 0 - direct native Art-Net/sACN

Run this test when the selected fixture itself exposes a verified native Art-Net/sACN route (the preferred LS 600c Pro II does).

1. Connect the fixture and phone to the same dedicated lighting network.
2. Patch the fixture with the exact verified DMX mode and address.
3. Test direct Art-Net first.
4. Disarm/reset the source and test direct sACN.
5. Verify dimmer and at least one additional verified semantic control when available (RGB on LS 600c Pro II).

PASS:
- No bridge is needed for the native route.
- ARM/preflight still gates physical output.
- Art-Net and sACN produce the same verified semantic mapping.
- Protocol change requires fresh ARM and does not reuse stale route state.

## Test A - Art-Net -> wired DMX

1. Select Art-Net.
2. Select Sidus One bridge profile.
3. Patch the verified fixture on Universe 1.
4. Confirm LightingAI reports the fixture as profile verified.
5. Press ARM OUTPUT.
6. Confirm network preflight succeeds.
7. Send a low dimmer value first, for example 10%.
8. Confirm fixture response matches the requested control.
9. Test 25%, 50%, 75%, 100%, then return to a safe working level.
10. Verify MASTER DIMMER and fixture-specific control agree.
11. Confirm operator status reports successful control state.

PASS:
- No output before ARM.
- ARM succeeds only with a valid route.
- Fixture response matches the verified DMX profile.
- No unrelated channels change.

FAIL:
- Output before ARM.
- Wrong channel/parameter response.
- Broadcast/unresolved target accepted.
- Fixture with PROFILE HOLD receives semantic control.

## Test B - sACN -> wired DMX

1. Reset/remove the previous Art-Net source before changing protocol because Sidus One locks to the first Art-Net/sACN source it detects.
2. Select sACN.
3. Keep the same universe, address and fixture profile.
4. ARM again.
5. Repeat the same dimmer/verified-control sequence.

PASS:
- Fresh ARM is required after protocol change.
- sACN produces the same semantic fixture response as Art-Net.
- No stale Art-Net route remains armed.

## Test C - CRMX output

Run only when a compatible CRMX receiver/fixture is available.

1. Link the receiver/fixture to Sidus One CRMX TX.
2. Keep the same verified DMX profile and universe.
3. Run Art-Net -> CRMX first.
4. Reset/re-arm and run sACN -> CRMX.

PASS:
- LightingAI semantics remain identical to wired DMX.
- CRMX pairing is treated as bridge transport only; LightingAI does not bypass verified DMX profile gating.

## Test D - MASTER / group scope

1. Patch at least two verified fixtures if available.
2. Select only one fixture in MASTER/GROUP.
3. Confirm the top desk shows MASTER SCOPE 1/2.
4. Apply MASTER DIMMER.
5. Confirm only the selected fixture changes.
6. Press ALL.
7. Confirm scope becomes 2/2.
8. Apply MASTER again and confirm both change.

PASS:
- UI scope matches real controlled fixtures.
- ALL restores the full verified selection.
- Hidden/stale group selection never controls an unexpected fixture.

## Test E - scene and cue

1. Establish known full-universe state.
2. Save Scene A.
3. Change values and save Scene B.
4. Create Cue 1 -> Scene A and Cue 2 -> Scene B.
5. Run GO, PREV and GO again.
6. Confirm CURRENT CUE / NEXT display.
7. Start a fade and verify a second GO cannot corrupt the active fade.
8. Change the patch and confirm old scene recall is blocked.

PASS:
- Cue order is deterministic.
- Patch mismatch blocks recall.
- No partial scene is applied to an unknown frame.

## Test F - GLOBAL BLACKOUT / RESTORE

1. Establish known LightingAI state.
2. Press GLOBAL BLACKOUT.
3. Confirm all LightingAI-known universes go to zero.
4. Press RESTORE.
5. Confirm the exact known pre-blackout state returns.
6. Repeat after changing the patch and confirm RESTORE is blocked.

PASS:
- Blackout affects all LightingAI-owned known universes.
- Restore only works when the saved state and patch are still valid.

## Test G - app background / resume

1. ARM output and enable LIVE DMX.
2. Confirm packet/live counters increase.
3. Send the app to background.
4. Confirm LightingAI stops live output and clears ARM state.
5. Return to the app.
6. Do not expect the fixture itself to turn off automatically; a DMX receiver may hold the last level.
7. Confirm control cannot resume until a fresh ARM/preflight succeeds.
8. Confirm live counters do not resume until explicitly re-enabled.

PASS:
- No automatic re-arm.
- No automatic resume of stale LIVE output.
- Fresh network/preflight validation is mandatory.

## Test H - network-change fail-safe

1. ARM on the dedicated lighting network.
2. While armed, disconnect Wi-Fi or move to a different network.
3. Confirm live output stops and LightingAI reports re-arm required.
4. Reconnect to the original network.
5. Confirm output remains locked until fresh ARM.

PASS:
- Route change invalidates the armed route.
- No automatic continuation on a different network.

## Test I - invalid route checks

Verify each case stays locked:
- VPN/second ambiguous network route active.
- invalid Art-Net target IP.
- Art-Net AUTO with no matching subscriber.
- sACN without usable multicast route.
- universe outside bridge limits.
- PROFILE HOLD fixture with no verified DMX personality.

## Evidence to record

For each test capture:
- candidate build/run number;
- phone model / Android version;
- bridge model / firmware;
- fixture model / DMX mode / address;
- protocol;
- universe;
- result PASS/FAIL;
- screenshot of LightingAI operator status;
- short video only when a fixture response needs visual proof.

## Release gate

PR #408 must remain draft and MAIN must remain untouched until:

- automated Control Lab is fully green;
- this physical bench has at least one successful Art-Net path and one successful sACN path;
- wired DMX is confirmed;
- CRMX is confirmed when suitable hardware is available, otherwise CRMX remains explicitly unverified in the physical release record;
- ARM, background/resume, network-change, GLOBAL BLACKOUT and scene/cue fail-safe tests pass.

No proprietary BLE/Sidus/AsteraApp/Godox/Aladdin app protocol is promoted to production merely by passing this standards-based bench.
