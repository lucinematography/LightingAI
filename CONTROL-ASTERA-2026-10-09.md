# Titan failed WHITE test — 2026-10-09

## Transport diagnostics update — 2026-10-09

The owner has supplied further private extracts from the existing HCI capture. The original archive remains unavailable to this executor. Raw initialization values, session identifiers and newly supplied reply bytes are deliberately excluded from this public report and from runtime constants.

The failed Control operation produced an empty XML reply; the owner reports CRC-valid binary replies in the recorded AsteraApp control flow. This distinguishes observed protocol state, not physical execution. A local write callback is not a device application acknowledgement.

LightingAI's bootstrap remains a captured subset. The recorded application performs additional configuration before the existing status/radio/stage/poll sequence. Its initial `s0` assignment and later configured `s0` assignment differ, whereas Control keeps the initial assignment. Several settings change together: neither the meaning of `s0` nor the session establishment requirement can be isolated. Recorded sessions use different configuration sequences, so an omitted session write cannot yet be declared universally required or dispensable.

Transport and diagnostics changes:

- Negotiate ATT MTU before notification subscription and bootstrap. Use the actual callback MTU, with bounded timeout and existing pre-write retry protection. Reject writes larger than MTU minus three; never split an unknown command automatically.
- Incrementally reconstruct candidate binary envelopes, including the observed doubled line-feed escape across notification boundaries, and check length and CRC. This is a receive-only candidate framing interpretation, not a general protocol specification.
- Count complete XML replies separately from CRC-valid binary envelopes. An empty envelope has unknown meaning and never verifies session, authentication or color.
- Preserve originating operation and receive timing across fragments, reset framing on connection changes, bound receive buffers and retain the most recent raw diagnostic samples with a dropped-sample count.
- Preserve partial framing evidence when an operation fails. Keep all session/color verification flags false.

Validation: Android debug build; debug and Control lint; 34 Java unit tests passed in each variant, including MTU payload limits, split/coalesced replies, escaping, CRC rejection, cross-operation attribution, disconnect reset and bounded buffers. JavaScript control, routing, evidence, backup, application, APK-verifier, Astera analyzer, catalog and Project 5 safety checks passed. Control lint/tests use the existing original signing configuration without publishing an APK or disclosing signing credentials. No physical lamp validation is implied. No new installation is prescribed for these diagnostic changes.

Still needed from the existing recording: complete ordered initialization and notification streams for comparable connection lifetimes, including alternative configuration sequences; a justified interpretation of configuration/routing fields and any changing session fields; and the relationship between protocol replies and actual light output. Use relative timing within a recording: the export's absolute timezone remains unverified. Do not request a replacement capture merely because the archive is not currently accessible here. Neither old private configuration nor a candidate timestamp is safe to turn into runtime constants or generated commands.

## Update after receiving the owner's complete CONNECT/WHITE JSON

The owner subsequently supplied both complete result objects in chat. The nine retained post-WHITE fragments reconstruct exactly 40 ASCII bytes:

```xml
<?xml version="1.0" ?>
<reply>
</reply>
```

Thus nine BLE notifications are **one complete empty XML reply**, not nine application acknowledgements. The first/last fragments arrived 72/78 ms after the WHITE submission at monotonic time `1530493`. There is no color value, explicit success/error or authentication state in this reply. Its emptiness does not prove rejection either. Without a verified protocol specification or successful official reference session, it must not be treated as an execution ACK.

The WHITE bootstrap also reconstructs a response field `<sh1002>   V5.12.96.U</sh1002>`. This is an observed version string from the connected BTB endpoint; the evidence does not establish that it identifies the tube's complete firmware rather than a bridge component. Most other complete WHITE-bootstrap replies are empty. The CONNECT samples contain incomplete XML fragments, so they cannot be reconstructed into complete messages with the same certainty.

The initial CONNECT attempt failed with status 133; the 2200 ms retry succeeded with bond state 12 (Android BONDED), successful discovery and CCCD status 0. Initial bootstrap completion was at `1472185`; the later disconnect was at `1482920`, 10735 ms later, status 19 (`0x13`, remote-user-terminated reason in standard Bluetooth terminology). This does not prove a human pressed disconnect or why the peripheral terminated. WHITE started 42282 ms after that disconnect with `reuseConnection:false`, a fresh successful GATT connection and repeated bootstrap.

WHITE local callback arrived 2 ms after submission. All nine reply fragments arrived early in its 5000 ms observation interval; completion at `1535495` retained the connection and no disconnect occurred within that recorded interval. Therefore premature GATT closure **during this WHITE test** does not explain the failure. The earlier idle disconnect remains a separate unresolved session/keepalive issue; no heartbeat will be invented.

Both JSON entries have `operatorObservation:NOT_RECORDED`; the physical failure is established by the owner's separate statement that the tube remained red, not by feedback recorded in JSON. Do not silently change the supplied export to UNCHANGED. The exact installed build identity remains absent. One fragment differs by 1 ms between the samples and timeline; it does not affect ordering or reconstruction.

The offline analyzer now assembles the observed ASCII reply wrappers across arbitrary BLE boundaries, counts complete versus empty replies, checks sample completeness and monotonic ordering, and retains `ackVerified:false`. Tests cover the exact nine supplied non-secret fragments, 1/5/20-byte boundaries, incomplete/unordered/binary streams and the separation between chat observation and exported operator feedback. No proprietary write bytes or runtime settings were changed, and no new installation is justified by an empty reply alone.

The supplied LightingAI export resolves the notification-content gap. The earlier recommendation to collect a fresh official AsteraApp HCI session is superseded by the existing October 7 report described above. Recover and analyze that report first. Until its complete reference session or a verifiable vendor specification is available, the meaning of omitted session fields and empty replies remains unknown.

## Initial assessment before receiving the full JSON (historical)

The update above supersedes the missing-export and next-export recommendations below.

Reviewed branch HEAD `94164259902b3ffa072c6f4c31ebd565e7fd46c6`, including the previous repair, captured-frame/bootstrap introduction commits, native scanner/inspector/bonding/foreground transport, WebView export path and backend evidence analyzers. PR #408 stays draft; main and PR #413 are unchanged. Filters remain Equipment → FILTERI/GEL. No runtime command bytes or user settings were changed in this investigation.

## Physical evidence supplied by the owner

`TITAN 01021450`, `C0:49:EF:F8:05:0A`: connected, WHITE write status 0, lamp remained RED, nine post-write notifications, `sessionVerified:false`, `deviceAppliedColorVerified:false`. This is a failed color-control test. The complete exported JSON, notification bytes/timestamps, firmware and exact installed build identity were not supplied. This summary is not a raw BLE capture.

The supplied WHITE bytes match the existing frame exactly:
`0A107EDF36000000007D63130DD30E960CFFBE0F`.
It is 20 bytes; length field 16 matches the existing envelope rule; CRC16/Modbus over bytes 1–17 is `BE0F`, matching the big-endian trailer. This rules out a simple corruption of this supplied color packet under the existing captured-envelope rule. It does not prove destination, mode, session, current sequence state or semantics. The existing byte extraction produces RGB `(255,211,150)`, not calibrated CCT white.

## Why session verification is absent

`sessionVerified` is assigned false unconditionally. There is no Astera application-level authentication/ACK decoder in the replay implementation. `transportReady` means local subscription/bootstrap writes finished; it must not be interpreted as authenticated Astera readiness. Nine notifications cannot change that conclusion without their content and a verified interpretation. A WRITE_WITHOUT_RESPONSE callback with status 0 supplies no ATT Write Response and no Astera execution confirmation.

The bootstrap-introduction commit `6d6be062beddeb1b332894cad5fa62f58e26ea3c` explicitly omitted a longer session/config write because its fields might be device/session specific. Current initialization still uses that subset: wake, `s0=0`, `s1002`, status, radio, stage, poll. It does not process replies before deciding that the transport is ready. That omission and lack of response-driven session management are possible causes, **not a proven explanation of this physical failure**. The absent bytes must not be reconstructed, borrowed from another session or replaced with a guessed Radio PIN.

Captured color frames share fixed header bytes; the code neither identifies their routing/session/sequence fields nor updates them. Fresh-session portability, fixture input mode and required keepalive remain unknown. Android bonding verifies the Bluetooth security layer only; it does not establish Astera Radio PIN/UHF control.

Stage bytes `0A057F932700020A0A09` do not satisfy the unescaped envelope-length rule used for color frames. Removing one duplicated `0A` would produce an envelope with matching CRC, suggesting possible byte stuffing. This is **only a hypothesis**. There is no verified escaping specification or original capture here; therefore these bytes were not changed or declared corrupt.

## Connection and response review

The current transport retains GATT between colors, serializes Android writes, subscribes before bootstrap, observes for five seconds after a color write and prevents retry after proprietary submission. Activity pause keeps the foreground BLE transport; explicit scan/inspection/disconnect, Activity destruction, process death or remote disconnection can still close it. This test summary gives no disconnection timing, so an early close cannot be blamed or ruled out. Full event timestamps are needed. Android status 133 and Nearby Devices permission are not the reported failure in this successfully connected attempt.

No confirmed new color/session fix can be made from a write status and a notification count. A new installation with unchanged protocol would add no evidence. Do not distribute another APK as a color fix on the basis of this investigation alone.

## Added software evidence tooling

`backend/astera-control-evidence.js` analyzes existing single/aggregated Control JSON privately, checks the supplied envelope, isolates the latest operation's timeline, records physical operator outcomes separately, detects missing notification samples, and always leaves proprietary session/ACK verification false. It does not transmit anything and does not copy raw session/notification payloads into its output. Regression tests reproduce the supplied WHITE failure and exercise missing/malformed samples, CRC corruption, unknown escaping, stale operation callbacks and false imported success claims. Synthetic test notifications are explicitly synthetic, not the owner's nine replies.

## Minimum next evidence, using the installed app

1. Attach **one existing SAČUVAJ TEST JSON file** from the failed test. No reinstall, commands, screen-by-screen photos or manual log transcription. It should include CONNECT and WHITE, all retained `notificationSamples`, `eventTimeline`, write mode/status and operator observation. I can analyze it directly. If the file lacks the nine replies, a count cannot recover them.
2. If those replies do not establish the missing session, make **one successful official AsteraApp fresh connection with RED → WHITE → GREEN → BLUE**, while Android full Bluetooth HCI snoop logging is enabled before connecting. Wait about five seconds between changes and confirm them visually. Close LightingAI first so two apps do not compete. Export one Android bug-report ZIP through the system Developer options, then turn logging off. Some HyperOS versions restrict full HCI export; if no snoop artifact is included, identify that limitation rather than claim capture success. Do not change Radio PIN, reset the lamp, delete bonding or clear app data merely for this capture.
3. Share the capture privately, with AsteraApp/fixture firmware versions and observed results. Bug reports can contain other phone data; never publish raw reports or session material on the public repository. I extract the target address, mapping, startup ordering, complete session/config writes, responses and timings using existing analyzers. One successful session is initial comparison evidence; repeated fresh-session behavior is required before claiming a reusable protocol/ACK implementation.

APK gate after an evidence-backed runtime fix: existing persistent signer/pinned certificate, package `com.lightingai.app.control13`, version `2.2-control`, code `100000 + run_number`, all CI/lint/regression/package checks; only then one update APK and one focused physical test. A software pass remains separate from physical acceptance.

## Verification completed

- Local `gradle assembleDebug lintDebug testDebugUnitTest`: build/lint passed; the Java suite contains 19 tests (6 captured-frame, 9 serialized-write, 4 reconnect), zero failures/errors.
- New offline evidence self-test, existing UI execution test, all seven existing Astera analyzer self-tests and APK verifier's 21 acceptance/rejection scenarios passed.
- `npm run check` passed; backup/full-app/control routing/operator desk/driver families/catalog/Project 5 safety and Project 5.2 release gate passed. The latter requires execution from `backend/`; running from repository root failed on its existing relative-path assumption, then passed from the documented directory.
- All WebView JavaScript and added analyzer JavaScript passed syntax checks. No protocol bytes were added or modified.
- Existing Actions run [752](https://github.com/lucinematography/LightingAI/actions/runs/37816031397), source `9416425`, completed all software, persistent-signing and pinned-signature/package checks successfully. Thus signing is no longer the known blocker. This is not physical control verification.
- These changes add offline evidence tooling/tests and this report only. The documentation/tooling commit skips CI so it does not publish a redundant installation of the unchanged runtime. The next runtime repair must run the complete existing Control CI and new evidence regression before any APK is recommended.
