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
