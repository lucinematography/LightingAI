# LightingAI CONTROL Hardware Validation Results

Use this file only for physical Bluetooth validation of PR #408.

## Candidate identity

- PR: #408
- Branch: `feature/production-control-routing`
- Candidate HEAD:
- Control Lab run:
- APK artifact:
- APK SHA-256:
- Test date:
- Tester:

## Primary CONTROL policy

LightingAI CONTROL is Bluetooth-first and Bluetooth-only in its normal operator workflow.

Required vendor families:

- Astera
- Aputure / Sidus
- Godox
- Aladdin
- Nanlite / NANLINK
- ARRI / LiCo

DMX / Art-Net / sACN / CRMX are not release prerequisites for the primary CONTROL workflow.

No vendor family is marked functional until direct Bluetooth control is physically proven.

## Result legend

- PASS = observed behavior exactly matches the release gate.
- FAIL = observed behavior contradicts the release gate.
- N/A = hardware path not available; include a reason.
- NOT RUN = not yet executed.

Any critical FAIL blocks merge and final APK release.

## Astera Titan Tube FP1-BTB

### Phase 1 - discovery and transport

Status: NOT RUN

- BLE discovery: PASS / FAIL / NOT RUN
- Brand detection ASTERA: PASS / FAIL / NOT RUN
- Fixture name detection: PASS / FAIL / NOT RUN
- LE/GATT connection: PASS / FAIL / NOT RUN
- Private BTB service fingerprint present: PASS / FAIL / NOT RUN
- Expected service fingerprint:
  `0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65`
- Service/characteristic inventory captured: PASS / FAIL / NOT RUN
- Passive CCCD subscription attempted: PASS / FAIL / NOT RUN
- Notifications captured: PASS / FAIL / N/A / NOT RUN
- Proprietary characteristic WRITE count remains zero: PASS / FAIL / NOT RUN

Evidence:
- Advertisement:
- Manufacturer data:
- Service data:
- GATT services:
- Notification HEX:
- Notes:

### Phase 2 - Astera session identification

Status: NOT RUN

- Authentication/session start identified: PASS / FAIL / NOT RUN
- Framing identified: PASS / FAIL / NOT RUN
- ACK/response behavior identified: PASS / FAIL / NOT RUN
- Keepalive/sequencing identified: PASS / FAIL / N/A / NOT RUN
- Evidence source is official, publicly verifiable, or repeatably measured: PASS / FAIL / NOT RUN

No DIM/CCT/BOJA/FX output is allowed before this phase passes.

### Phase 3 - real fixture control

Status: NOT RUN

- DIM low level: PASS / FAIL / NOT RUN
- DIM repeated values: PASS / FAIL / NOT RUN
- CCT: PASS / FAIL / NOT RUN
- BOJA: PASS / FAIL / NOT RUN
- FX: PASS / FAIL / NOT RUN
- Reconnect deterministic: PASS / FAIL / NOT RUN
- Background/resume safe: PASS / FAIL / NOT RUN
- No unrelated parameter changes: PASS / FAIL / NOT RUN

## Vendor-family release matrix

### Astera
Status: REQUIRED / UNVERIFIED

### Aputure / Sidus
Status: REQUIRED / UNVERIFIED

### Godox
Status: REQUIRED / UNVERIFIED

### Aladdin
Status: REQUIRED / UNVERIFIED

### Nanlite / NANLINK
Status: REQUIRED / UNVERIFIED

### ARRI / LiCo
Status: REQUIRED / UNVERIFIED

## Final physical verdict

- Astera direct Bluetooth: PASS / FAIL / NOT RUN
- Aputure / Sidus direct Bluetooth: PASS / FAIL / NOT RUN
- Godox direct Bluetooth: PASS / FAIL / NOT RUN
- Aladdin direct Bluetooth: PASS / FAIL / NOT RUN
- Nanlite / NANLINK direct Bluetooth: PASS / FAIL / NOT RUN
- ARRI / LiCo direct Bluetooth: PASS / FAIL / NOT RUN

Release gate:
- APPROVED FOR MERGE: YES / NO
- APPROVED FOR FINAL APK: YES / NO
- Blocking failures:
- Deferred paths and reasons:

## Astera Titan BTB diagnostic bench - 2026-09-29

- Fixture: Astera Titan Tube FP1-BTB
- LightingAI BLE discovery: PASS
- Fixture identity match: PASS
- Astera Bluetooth hardware/path previously confirmed functional
- LightingAI generic GATT path: insufficient for proving proprietary session/control
- Private LE service fingerprint captured and now used only as passive diagnostic evidence
- Primary Astera connect flow: LE/GATT
- Automatic Classic/SPP routing: removed from primary flow
- Passive NOTIFY/INDICATE observation: implemented
- Proprietary characteristic WRITEs in observer: zero by design
- DIM/CCT/BOJA/FX: still locked pending verified Astera session/command protocol
- MAIN: untouched
- PR #408: keep draft / do not merge
