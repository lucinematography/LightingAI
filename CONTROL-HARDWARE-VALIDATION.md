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

Before analyzing DIM/CCT/color changes, compare at least three independent **connect-only** derived captures:

`node backend/astera-att-session-consensus.js connect1.json connect2.json connect3.json --json session-consensus.json`

The connect-only session analyzer:
- requires at least three fully mapped captures from the same peer address;
- compares the ordered Astera private-service WRITE sequence;
- reports the common endpoint prefix shared across all runs;
- shows stable and variable payload byte positions at each repeated startup position;
- detects repeatable periodic endpoint candidates when three or more writes occur at a stable interval within every run;
- correlates a repeated startup WRITE with the first private-service NOTIFY/INDICATE only when it arrives within 750 ms **and before the next WRITE**; this is an ACK/response candidate, not proof;
- labels startup/auth/response/keepalive findings only as `candidate_only`. Variable bytes may be session/auth values, counters, random data or checksums and must not be replayed.

This session baseline is used to separate normal startup/auth traffic from later parameter captures. It does not prove that the Astera Radio PIN session has been authenticated.

Before parameter diffing, apply the verified startup baseline to both a fresh connect-only reference capture and the changed-parameter capture:

`node backend/astera-att-session-filter.js connect-reference.json session-consensus.json --json connect-filtered.json`

`node backend/astera-att-session-filter.js dim-change.json session-consensus.json --json dim-filtered.json`

The filter is deliberately conservative:
- the session consensus must have verified the same peer across its runs;
- the capture peer must match the session peer;
- every startup endpoint must match the verified common prefix;
- all stable framing bytes must match; only bytes already proven variable across connect-only runs may vary;
- filtering stops before the first repeatable periodic/keepalive endpoint, so periodic traffic remains visible to the later diff;
- a prefix mismatch aborts the analysis instead of silently removing traffic.

Use the filtered captures for the parameter comparison:

`node backend/astera-att-diff.js connect-filtered.json dim-filtered.json --reference-label connect-only --test-label dim-change --json dim-diff.json`

Once a verified session baseline exists, **do not bypass the session filter for parameter evidence**. Raw connect-only versus raw parameter diffing remains exploratory only because changing session/auth values can look like false parameter writes.

The diff analyzer refuses captures that carry `analysisCoverage.mappingWarning`. This is deliberate: an Android GATT-cache capture with unmapped writes must not be interpreted as a negative result. Repeat the capture with sufficient discovery traffic or establish the ATT handle-to-UUID mapping before differential analysis.

Fixture identity is fail-closed through the analysis chain:
- reference and changed-parameter captures must resolve to the same Bluetooth peer address;
- diff output records `captureIdentity.verifiedMatch`;
- consensus accepts physical diff inputs only when every diff verified its reference/test identity and all runs resolve to the same peer;
- setpoint sweep accepts physical consensus inputs only when every setpoint verified the same peer across its repeated runs and all setpoints resolve to the same peer;
- peer-address continuity is an analysis guard, not proof that firmware is unchanged. Explicit cached GATT profiles still require independent same-fixture and same-firmware verification.

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

After repeatability is established, use at least three different setpoints for basic byte-position comparison. Use **at least four distinct numeric setpoints** when you want numeric encoding candidates. Create one consensus JSON per setpoint, then a sweep manifest:

```json
{
  "parameter": "DIM",
  "cases": [
    {"label":"DIM 10","value":10,"file":"dim10-consensus.json"},
    {"label":"DIM 30","value":30,"file":"dim30-consensus.json"},
    {"label":"DIM 60","value":60,"file":"dim60-consensus.json"},
    {"label":"DIM 90","value":90,"file":"dim90-consensus.json"}
  ]
}
```

Run:

`node backend/astera-att-sweep.js dim-sweep.json --json dim-sweep-result.json`

The sweep analyzer identifies byte positions that are:
- stable across repeated captures within each setpoint;
- present on the same logical endpoint across all setpoints;
- different between the isolated setpoints.

Bytes that still vary within a setpoint are classified as unstable and must not be treated as direct control values. Constant bytes are framing candidates. Changing bytes are parameter candidates only.

With four or more distinct numeric setpoints the analyzer additionally emits conservative `candidateEncodings` for:
- one-byte unsigned fields;
- adjacent 16-bit little-endian fields;
- adjacent 16-bit big-endian fields;
- strict monotonic direction;
- affine linear fits labelled `affine_linear` only when R-squared is at least 0.999.

With four or more setpoints where every payload byte is stable inside each setpoint, the sweep also reports simple `checksumCandidateBytes` when a changing byte exactly matches one of these relations across all cases:
- XOR8 of all other bytes;
- SUM8 modulo 256 of all other bytes;
- two's-complement SUM8 of all other bytes.

Checksum matches are framing candidates only. They are not permission to construct or transmit a new packet.

An encoding candidate is still not a DIM/CCT/COLOR/FX command. A checksum, transformed value or another correlated field can also vary monotonically or linearly. Physical replay remains mandatory before any runtime vendor driver may use the candidate.

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


## Physical capture runbook - first Titan evidence set

Use this exact order for the first real Astera Titan Tube FP1-BTB evidence set.

### Preconditions

- Keep PR #408 DRAFT.
- Keep MAIN untouched.
- Use the same physical Titan Tube for the whole evidence set.
- Record the Titan firmware version before the first capture.
- Enable Android Bluetooth HCI snoop logging.
- Disconnect unrelated Bluetooth devices where practical.
- Do not press any LightingAI DIM/CCT/BOJA/FX control; those controls must remain disabled.
- Do not reuse a raw HCI capture from a different fixture or firmware.

### Capture A - connect-only baseline

Create three independent fresh captures:

- `titan-connect-01.log`
- `titan-connect-02.log`
- `titan-connect-03.log`

For each capture:
1. start a fresh Android HCI snoop capture;
2. open the official AsteraApp;
3. connect to the same Titan;
4. wait without changing DIM, CCT, color or FX;
5. disconnect/stop the capture;
6. export the raw snoop file without committing it.

Analyze each raw capture with the exact Titan Bluetooth address and produce derived JSON:
- `titan-connect-01.json`
- `titan-connect-02.json`
- `titan-connect-03.json`

Then run connect-only session consensus before interpreting any parameter change.

### Capture B - isolated DIM

After the connect-only baseline is accepted, create at least three fresh DIM captures:

- `titan-dim-01.log`
- `titan-dim-02.log`
- `titan-dim-03.log`

In each capture:
1. start from a fresh capture and connection;
2. wait for the normal AsteraApp startup/session traffic to settle;
3. change only DIM once;
4. do not touch CCT, color or FX;
5. stop immediately after the isolated change plus enough time to observe the device response;
6. export the raw log without committing it.

Do not infer command bytes from a single run. Filter the verified connect-only session baseline first, then diff, then require consensus across at least three DIM runs.

### Capture C - isolated CCT

Repeat the same procedure with only one CCT change per fresh capture:

- `titan-cct-01.log`
- `titan-cct-02.log`
- `titan-cct-03.log`

Do not change DIM, color or FX in those captures.

### Stop conditions

Stop analysis and do not continue toward replay if any of these occur:
- the peer Bluetooth address differs between evidence files;
- GATT mapping is incomplete and the explicit same-fixture/same-firmware profile condition cannot be proven;
- a WRITE_REQUEST lacks WRITE_RESPONSE;
- any Prepared Write fragment or Execute Write lacks matching device confirmation;
- the supposed parameter candidate also appears in connect-only traffic without a defensible session/keepalive explanation;
- repeated runs do not converge on the same logical endpoint and byte-level relationship.

A packet remains candidate-only until later controlled physical replay changes only the intended Titan parameter.


## Evidence intake package

Use the repository template:

`backend/astera-physical-capture-set.example.json`

Create a working copy next to the derived capture JSON files and keep these exact filenames for the first Titan evidence set:

- `titan-connect-01.json`
- `titan-connect-02.json`
- `titan-connect-03.json`
- `titan-dim-01.json`
- `titan-dim-02.json`
- `titan-dim-03.json`
- `titan-cct-01.json`
- `titan-cct-02.json`
- `titan-cct-03.json`

The raw `.log` / BTSnoop files remain local evidence and must not be committed.

After the nine derived JSON files are present, run the complete offline evidence gate with:

`node backend/astera-physical-capture-set.js <working-manifest.json> --json titan-capture-set-result.json`

A successful run means only that the evidence set is internally consistent enough for protocol analysis. It does **not** verify DIM/CCT command semantics and does not permit runtime replay.

The physical capture-set gate is fail-closed. Every derived capture must include analyzer-produced `analysisCoverage` metadata with:
- an empty `mappingWarning`;
- the Astera private service positively mapped;
- at least one UUID attribute mapping;
- a mapping source of `capture` or `explicit_profile`;
- connection identity, ATT events and candidate-write arrays present.

A shortened or manually assembled JSON file without those coverage fields is rejected instead of being treated as physical protocol evidence.

Before accepting the result, record:
- Titan model and firmware;
- Android phone model and Android version;
- Titan Bluetooth address used by every capture;
- branch HEAD and Control Lab run;
- whether all nine captures were made with the same physical fixture and firmware;
- whether any unrelated Bluetooth activity was present.

If any one of these identity facts is uncertain, keep the result candidate-only and repeat the physical captures.
