# Titan failed WHITE test — 2026-10-09

## Existing 2026-10-07 HCI capture takes priority

The owner identifies an already collected private report:
`bugreport-topaz_eea-AQ3A.240829.003-2026-10-07-16-03-52.zip`.
The reported reanalysis found multiple connections to TITAN 01021450, 75-byte and 19-byte initialization packets absent from LightingAI, 36 color packets in one session, RED at 15:59:34 and WHITE at 16:00:10. These are owner-supplied findings; the original archive, raw HCI and that derived analysis are **not currently available to this executor**, so the payloads, counts and timestamps have not been independently revalidated here. Do not request a new physical capture before obtaining/using this existing evidence.

Search completed: local workspace and scratch file names, accessible repository history/docs, PR #408 discussion, both production-control-routing and light-ai-probe branch contents, and the accessible ChatGPT Pages listing. No matching archive or payload-bearing derived report was found. The connected tools do not provide a way to retrieve attachments from arbitrary earlier conversations by filename. No access to the archive is implied by knowing its name.

The current seven initialization writes are:

| Write label | Actual wire bytes |
| --- | ---: |
| wake | 1 |
| s0 | 5 |
| s1002 | 6 |
| status | 7 |
| radio | 10 |
| stage | 10 |
| poll | 5 |

Thus the reported 75/19-byte initialization writes are not implemented. The bootstrap-introduction commit explicitly acknowledges excluding a longer potentially session-specific config write, but contains neither that complete write nor an independently verifiable 75/19-byte interpretation. Length alone cannot establish whether a packet is application payload, ATT PDU or HCI packet, whether it is a complete logical write or a fragment, or which authentication/routing/config function it serves. The packet bytes, ATT opcode, endpoint mapping, connection identity and ordering must be recovered from the existing capture before changing runtime.

### Fixed versus changing fields: what can actually be established now

Offsets here are zero-based. In the **four stored color examples only**, offsets 0–11 are identical (`0A107EDF36000000007D6313`), offset 17 is also identical (`FF`), offsets 12–16 differ between presets, and offsets 18–19 are the changing CRC trailer. The current code interprets bytes 12–17 as the captured component tag/value pairs. Matching bytes across these examples do **not** prove a constant across fresh sessions; byte 17 being FF is consistent with the selected saturated presets rather than a proven global session field. Header offsets 2–11 are not decoded as reusable routing/PIN/sequence fields. No fixed/variable classification of the absent 75/19-byte writes can be supplied without their bytes from separate connection sessions.

Once the existing ZIP or payload-bearing derived Astera JSON is available, analysis must split by connection ID **and connection lifetime**, map ATT endpoints for that connection, reconstruct any confirmed Prepare/Execute Write transactions, preserve original byte stuffing, and distinguish logical application writes from wire fragments. Compare corresponding startup writes across those existing fresh connections while fixture settings are unchanged. Record stable observed bytes, changing observed offsets, checksums and unresolved fields separately; stable does not mean safe to replay, changing does not automatically mean authentication. The 36 color writes and the supplied RED/WHITE times should then be correlated within their own session against the full preceding initialization and device replies, accounting for the capture's timezone. Never assign meaning or copy private config values based only on length or timing.

The existing consensus analyzer requires three capture inputs and does not itself turn one multi-connection report into three isolated startup baselines. Do not pass an entire multi-session trace as a single connect-only baseline or mix color changes into initialization consensus. Multiple independent sessions already inside the October 7 report may provide the required comparison; no additional recording is justified until that is checked.

**Current evidence blocker:** attach the existing original ZIP privately, or supply the existing derived Astera-only JSON retaining `connections`, `candidateAsteraSessionWrites`, `attEvents`, `attributes`, `services`, `analysisCoverage`, complete `valueHex` and timing/connection fields. An exact private file reference accessible to this session also suffices. A prose summary containing only lengths, counts and times does not. Keep raw reports and session/config bytes out of the public repository. No replacement APK, new PIN, speculative session write or new physical capture is authorized by these incomplete bytes.

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
