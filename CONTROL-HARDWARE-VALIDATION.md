# LightingAI CONTROL Hardware Validation

Status: Bluetooth-only physical validation plan for PR #408.

## Goal

Validate direct vendor Bluetooth control families without requiring DMX, Art-Net, sACN or CRMX in the primary operator workflow.

Primary operator path:

PRONAĐI -> POVEŽI -> DIM / CCT / BOJA / FX

## Gate rule

A vendor family is not marked ready because:

- the lamp appears in BLE scan;
- Android bonds successfully;
- GATT connects;
- services are discovered;
- a writable characteristic exists.

A family becomes production-ready only after real fixture response is repeatable and the session/command behavior is understood well enough to avoid guessed packets.

## Test A - Astera Titan Tube FP1-BTB

Current highest priority.

### Phase 1 - transport evidence

1. Put Titan Tube FP1-BTB in the documented Bluetooth/BTB connection state.
2. Run LightingAI BLE discovery.
3. Confirm ASTERA brand detection and fixture name.
4. Connect through the Astera LE/GATT diagnostic path.
5. Confirm the observed private BTB service fingerprint when present:
   `0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65`.
6. Record all characteristics and READ / WRITE / WRITE-NR / NOTIFY / INDICATE flags.
7. Subscribe only through standard CCCD operations to NOTIFY/INDICATE characteristics.
8. Record notifications and read values without sending proprietary characteristic writes.

PASS:
- connection is stable;
- service/characteristic inventory is captured;
- no guessed vendor packet is transmitted;
- any passive notification is captured with exact characteristic UUID, HEX and timing.

### Phase 2 - session identification

Use official documentation, SDK evidence, publicly verifiable implementation evidence or repeatable controlled comparison with AsteraApp to identify:

- session/authentication start;
- command framing;
- response/acknowledgement behavior;
- required keepalive or sequencing;
- safe disconnect behavior.

#### Android HCI reference capture

A controlled AsteraApp comparison is permitted only as a research/test step. It is not part of the final LightingAI operator workflow.

1. Enable Android Bluetooth HCI snoop logging in Developer options.
2. Disable or disconnect unrelated Bluetooth devices where practical so the capture contains the smallest possible amount of unrelated traffic.
3. Start a fresh capture before each test case.
4. Run these cases separately:
   - A: connect/bond the Titan BTB and wait without changing any light parameter;
   - B: reconnect an already bonded Titan BTB and wait without changing any light parameter;
   - C: with the official AsteraApp, change only DIM once;
   - D: in a fresh capture, change only CCT once;
   - E: only after those are understood, capture one isolated color change.
5. Export the Android `btsnoop_hci.log` or the equivalent Bluetooth snoop artifact from the bug report.
6. Do not commit the raw snoop log to the repository. Raw HCI logs can contain traffic from other Bluetooth devices.
7. Analyze locally with:
   `node backend/astera-btsnoop-analyzer.js btsnoop_hci.log --address AA:BB:CC:DD:EE:FF --json astera-att.json`
8. Preserve only the derived Astera-specific JSON needed for protocol analysis.
9. Treat derived JSON as sensitive until reviewed: proprietary ATT payloads may include session/authentication values even though SMP key material is redacted by the analyzer. Do not commit raw or unreviewed derived captures.
10. Repeat each changed-parameter case at least three times from fresh captures before assigning meaning to any byte pattern.

The analyzer extracts:
- LE connection handle and peer address;
- ATT MTU request/response and effective negotiated MTU when present;
- Bluetooth link-security metadata including Encryption Change v1/v2 and key size when exposed by HCI;
- LE Long Term Key Request occurrence with key material redacted;
- ATT Error Response details such as insufficient authentication, insufficient encryption and insufficient key size;
- safe SMP pairing metadata such as IO capability, AuthReq, Secure Connections request, maximum encryption key size and key-distribution flags while redacting key-bearing SMP payloads;
- primary service ranges;
- characteristic and descriptor ATT-handle-to-UUID mappings when visible in ATT discovery;
- explicit `analysisCoverage` and `unmappedHostWrites` when Android uses cached GATT handles and the capture lacks enough discovery traffic for strict UUID mapping;
- ATT Write Request / Write Command;
- notifications and indications;
- SMP packets;
- disconnect reasons;
- candidate proprietary writes that target the observed Astera private BTB service while excluding the standard CCCD subscription.

Bluetooth HCI encryption and SMP pairing metadata are only evidence about the phone-to-BTB Bluetooth security layer. They must not be interpreted as successful Astera Radio-PIN authentication; the official Astera pairing model separates the Bluetooth link from the Radio PIN / UHF control layer. ATT errors 0x05/0x0F/0x0C remain standard Bluetooth security evidence, not proof of proprietary Astera command semantics.

If `analysisCoverage.mappingWarning` is `gatt_mapping_incomplete_capture_may_use_cached_handles`, do not conclude that the Astera private service had no traffic. Repeat the mapping capture from a fresh connection/bond state where practical.

If Android continues to use cached handles, an earlier fully mapped derived capture from the same physical Titan Tube and the same verified firmware may be supplied explicitly:

`node backend/astera-btsnoop-analyzer.js cached-run.log --address AA:BB:CC:DD:EE:FF --profile mapped-reference.json --json cached-run-derived.json`

The analyzer accepts a profile only when that reference has no mapping warning, contains the verified Astera private service and contains an ATT handle-to-UUID map. The profile is applied only when the new connection has no captured service or characteristic mapping at all. A profile must never be reused across a different fixture or firmware without re-verification; derived output records `profileAssumption: same_fixture_and_firmware_must_be_verified`.

A packet becomes protocol evidence only after it is repeatable across captures and its meaning is isolated by changing one operator parameter at a time.

After producing the derived JSON captures, compare them with:

`node backend/astera-att-diff.js connect-only.json dim-change.json --reference-label connect-only --test-label dim-change --json dim-diff.json`

The diff analyzer refuses captures that carry `analysisCoverage.mappingWarning`. This is deliberate: an Android GATT-cache capture with unmapped writes must not be interpreted as a negative result. Repeat the capture with sufficient discovery traffic or establish the ATT handle-to-UUID mapping before differential analysis.

Repeat separately for CCT and color. The diff tool treats test-only writes and changed payloads as candidates, not as proven commands. Characteristic UUID is the preferred logical endpoint identity; the ATT attribute handle is used only as a fallback when UUID mapping is unavailable. The HCI connection handle is tracked separately as connection metadata and is never treated as the command endpoint identity.

For each isolated operator action, produce at least three separate diff JSON files and run:

`node backend/astera-att-consensus.js dim-run1-diff.json dim-run2-diff.json dim-run3-diff.json --json dim-consensus.json`

The consensus analyzer:
- requires at least three independent diff captures;
- groups by characteristic UUID when available, falling back to the ATT attribute handle; HCI connection handles remain connection metadata only;
- reports only endpoints present across every analyzed run as repeatable candidates;
- shows byte positions that are stable across payloads and positions that vary;
- never labels a repeatable candidate as a verified DIM/CCT/COLOR/FX command.

A candidate becomes protocol evidence only after the same endpoint/byte-level relationship repeats across at least three controlled captures of the same isolated operator action.

After repeatability is established, use at least three different setpoints for the same parameter, for example DIM 10 / 50 / 90. Create one consensus JSON per setpoint, then a sweep manifest:

```json
{
  "parameter": "DIM",
  "cases": [
    {"label":"DIM 10","value":10,"file":"dim10-consensus.json"},
    {"label":"DIM 50","value":50,"file":"dim50-consensus.json"},
    {"label":"DIM 90","value":90,"file":"dim90-consensus.json"}
  ]
}
```

Run:

`node backend/astera-att-sweep.js dim-sweep.json --json dim-sweep-result.json`

The sweep analyzer only identifies byte positions that are:
- stable across repeated captures within each setpoint;
- present on the same logical endpoint across all setpoints;
- different between the isolated setpoints.

Bytes that still vary within a setpoint are classified as unstable and must not be treated as direct control values. Constant bytes are treated as framing candidates. Changing bytes are parameter candidates only.

A candidate becomes a verified control command only after a later physical replay reproduces only the intended fixture change.

Do not combine DIM, CCT and color changes in the same reference capture because that destroys causal isolation.

No quick-control button may be enabled during this phase.

### Phase 3 - physical command proof

Only after Phase 2 has identified the real protocol:

1. DIM low level -> verify physical response.
2. DIM multiple values -> verify deterministic response.
3. CCT -> verify physical response.
4. BOJA -> verify physical response.
5. FX -> verify only after its command semantics are separately verified.
6. Disconnect/reconnect -> confirm no stale control session.
7. Background/resume -> confirm no unintended output.

PASS:
- requested control matches the fixture every time;
- unrelated parameters do not change;
- reconnect behavior is deterministic;
- no fabricated packet or inferred undocumented channel is used.

## Other required vendor families

Repeat the same three-phase gate for:

- Aputure / Sidus
- Godox
- Aladdin
- Nanlite / NANLINK
- ARRI / LiCo

The implementation may differ by family, but the safety and physical-proof requirements are identical.

## Evidence to record

For every physical run:

- branch HEAD;
- Control Lab run;
- phone model and Android version;
- fixture model and firmware;
- BLE advertisement snapshot;
- GATT service/characteristic inventory;
- notification/read capture;
- exact command evidence when command testing is eventually enabled;
- physical fixture result;
- PASS / FAIL;
- notes.

## Release gate

PR #408 stays DRAFT and MAIN stays untouched until the required direct Bluetooth control path is genuinely working.

No final APK is approved while the only proven behavior is discovery, bonding or diagnostics.
