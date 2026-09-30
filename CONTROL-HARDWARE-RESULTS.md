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


## Astera offline protocol-evidence tooling checkpoint - 2026-09-30

Verified functional tooling checkpoint:
- Branch: `feature/production-control-routing`
- HEAD: `7c14e0e0eb94e477a0d753102bf89d504cd1b566`
- Control Lab: #715 SUCCESS
- PR #408: OPEN / DRAFT
- MAIN: untouched

Control Lab #715 passed:
- WebView JavaScript syntax;
- full-app critical regression;
- production CONTROL routing;
- operator-desk safety;
- Astera btsnoop analyzer;
- Astera ATT differential analyzer;
- Astera ATT consensus analyzer;
- Astera connect-only session consensus;
- Astera verified session baseline filter;
- Astera ATT setpoint sweep analyzer;
- Android lint;
- Android changed-files lint gate;
- Android unit tests;
- debug APK build;
- packaged CONTROL APK verification;
- artifact upload.

Offline Astera evidence pipeline now available:
1. Android HCI/BTSnoop capture -> `backend/astera-btsnoop-analyzer.js`.
2. Three or more connect-only captures -> `backend/astera-att-session-consensus.js`.
3. Verified startup/auth prefix removal -> `backend/astera-att-session-filter.js`.
4. Filtered connect-only versus filtered parameter capture -> `backend/astera-att-diff.js`.
5. Three or more repeated diffs for the same isolated action -> `backend/astera-att-consensus.js`.
6. Multi-setpoint byte/encoding/framing analysis -> `backend/astera-att-sweep.js`.

Safety/evidence rules:
- raw BTSnoop logs are not committed;
- SMP key-bearing payloads are redacted in derived output;
- incomplete GATT mapping blocks parameter diff evidence;
- cached GATT profile seeding is explicit and assumes independently verified same fixture and firmware;
- fixture identity is fail-closed through diff -> consensus -> sweep;
- session startup filtering requires the same peer, the same endpoint sequence and all stable framing bytes to match;
- filtering stops before the first repeatable periodic/keepalive endpoint;
- startup WRITE -> NOTIFY/INDICATE correlation is only an ACK/response candidate and is bounded to 750 ms and before the next WRITE;
- numeric encoding candidates require at least four distinct setpoints and remain candidate-only;
- simple XOR8 / SUM8 / two's-complement SUM8 matches are checksum/framing candidates only;
- no captured or inferred packet is automatically replayed;
- LightingAI runtime Astera diagnostics still send zero proprietary characteristic WRITE commands.

Physical status:
- No new Titan HCI/BTSnoop capture has yet been analyzed with this pipeline.
- No Astera proprietary session/auth command has been declared verified.
- No DIM/CCT/BOJA/FX command has been declared verified.
- Quick controls remain locked.
- PR #408 must remain DRAFT and must not be merged into MAIN.


## Astera prepared-write confirmation safety checkpoint - 2026-09-30

Verified functional tooling checkpoint:
- Branch: `feature/production-control-routing`
- HEAD: `915ee39f4262cea410d0e75604c29da22953b1d4`
- Control Lab: #719 SUCCESS
- PR #408: OPEN / DRAFT
- MAIN: untouched

Control Lab #719 passed:
- full-app critical regression;
- production CONTROL routing;
- operator-desk safety;
- Astera btsnoop analyzer;
- Astera ATT differential / consensus / session / sweep analyzers;
- full fixture control catalog audit;
- control system driver-family validation;
- Android lint and changed-files lint gate;
- Android unit tests;
- debug APK build;
- packaged CONTROL APK verification;
- artifact upload.

Prepared Write evidence is now fail-closed:
- every Prepare Write fragment must receive the matching device Prepare Write Response;
- a rejected or unmatched Prepare Write invalidates the cycle;
- Execute Write Request is not evidence by itself;
- the final Execute Write must receive a device Execute Write Response;
- rejected or missing Execute confirmation never becomes an Astera candidate;
- only a complete, contiguous, device-confirmed prepared-write transaction may enter candidate protocol evidence.

Runtime safety remains unchanged:
- LightingAI Astera diagnostics do not call `writeCharacteristic()`;
- the only intentional GATT write in the passive inspector is the standard CCCD descriptor used to enable NOTIFY/INDICATE observation;
- DIM / CCT / BOJA / FX quick controls remain disabled;
- no Astera proprietary packet has been declared verified or replayed;
- the next required evidence is a fresh physical Titan HCI/BTSnoop capture.
