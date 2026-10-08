# Astera Control repair — 2026-10-08

Scope: `feature/production-control-routing`, starting at `3b3c0d1b9a7118376929a4ce5476629dd0cb056d`. No change to main, no merge, no change to PR #413.

## Findings and resulting behavior

The previous replay scheduled independent GATT writes at absolute offsets. A delayed bootstrap callback could be labeled as the color callback once `finalColorWriteStarted` was set. A fallback timer completed an operation even without the color callback. Every completed operation closed the connection. Activity `onPause()` also closed it. These are code defects; they do not establish the physical reason that this fixture remained white.

The replacement keeps one foreground BLE transport open, serializes characteristic writes until their matching Android callback, bounds connection/discovery/CCCD/write phases, closes failed GATT instances and backs off on status 133. Generations discard stale callbacks and canceled tasks. Automatic reconnect is restricted to attempts before proprietary bytes are submitted; it never blindly replays an uncertain command. Authentication/encryption statuses 5/15 request operator bonding rather than blind retry. Background service is `connectedDevice`, non-exported and `START_NOT_STICKY`; process death never restores/replays commands.

Notifications and event timestamps are retained as raw evidence. A local `WRITE_WITHOUT_RESPONSE` callback is **not** an Astera ACK. All results retain `sessionVerified:false` and `deviceAppliedColorVerified:false`. Operator observation is stored separately. The public-safe bootstrap and four packets are unchanged from the baseline. Their bootstrap/session suitability remains experimental. Captured replay is limited to the observed name `TITAN 01021450`; this is an additional restriction, not cryptographic fixture authentication. No DIM, CCT, FX, Radio PIN or session/authentication command has been invented.

Android 31+ BLE permission checks require SCAN and CONNECT, not location. Android 15 target SDK is 35. Fine location permission remains for the existing SUN/location tools. Other existing app functions remain in this branch. The complete 977-entry official gel snapshot was recovered byte-for-byte from the successful APK of the baseline revision (run 748); its SHA-256 is `91fb016cc016971265036fa195120290b48389019b9f89681c3601d63acdc335`. Ordinary Control builds use that committed snapshot rather than depending on four live vendor sites.

## Installation identity and publication

The installable `control` variant is non-debuggable, package `com.lightingai.app.control13`, version name `2.2-control`, version code `100000 + workflow run number`. Its signing key must come from the existing repository release signing secrets: `LIGHTINGAI_KEYSTORE_BASE64`, `LIGHTINGAI_KEYSTORE_PASSWORD`, `LIGHTINGAI_KEY_ALIAS`, `LIGHTINGAI_KEY_PASSWORD`. Reuse and securely back up that keystore for every future update; never rotate it casually. It is never committed. Debug builds are internal checks, never downloadable Control candidates.

CI blocks publication on missing secrets, lint errors, unit/backend/UI test failures, signature verification failure, mismatched certificate, package/version/commit identity, or mismatched packaged assets. It verifies APK signatures with `apksigner`, checks the signer against the certificate exported from the persistent keystore, and records APK/certificate SHA-256 in `verification.json`. Runner key material is deleted in an always-running cleanup step. A passing CI candidate is eligible for the physical test below; it is not proof of lamp control.

The connected GitHub credential could not list/write Actions secrets (HTTP Forbidden). The workflow itself must establish whether the four existing release secrets are provisioned. Do not replace this check with an ephemeral debug signature to obtain an APK link.

## Software checks

Debug and Control Gradle builds, full lint, and 19 Java unit tests per variant run locally with SDK 35/JDK 17/Gradle 8.9. A disposable local key was used only to execute the complete signed-Control package/signature verifier; that key was deleted and its APK is not distributed. Building Control without signing secrets was separately proven to fail. New tests exercise serialized writes, delayed/duplicate callbacks, cancellation, payload immutability, callback timeout, rejection, reconnect boundaries, target restrictions and packet corruption. Executed JavaScript UI tests cover pending requests across pause/resume, four presets in one history, stale callbacks, failures, watchdog cleanup and never claiming an ACK. The APK verifier has success/rejection tests for identity, versions, debug APKs, certificates and build provenance. Existing Astera analyzers, full-app/backup/catalog and Project 5 safety/release gates are also run.

The historical `test:project5-base` fails on the **unchanged baseline HEAD** because its whitelist still describes the old isolated Project 5 camera-distance scope and rejects the already-existing Control branch changes/removals. It is not disabled or silently weakened. The current full-app critical and Project 5 safety/release checks remain applicable. A passing Control pipeline does not mean that obsolete historical scope check passed.

## One physical test on Xiaomi/Redmi Android 15

1. Use only the signed candidate after CI software checks and signature verification. Install once; future candidates update the same package with the same certificate. Close AsteraApp so it is not competing for the bridge. Turn Bluetooth on, grant Nearby Devices permission. Put `TITAN 01021450` in BlueMode using Astera's documented procedure (hold power for approximately three seconds until blue flashing).
2. In LightingAI: PRONAĐI → select `TITAN 01021450` → POVEŽI. Wait for the connection result. If it reports an error, stop this test; one saved session contains the attempts and status. If Android asks to pair, follow the legitimate system prompt. Do not guess a PIN.
3. Keep the same connection. Press CRVENA → BELA → ZELENA → PLAVA, waiting for each operation to finish. After each, answer whether the **requested color is visibly present**, not merely whether anything changed. Buttons and borders use the selected color. The captured white preset is RGB `(255,211,150)`, not a verified CCT setpoint or calibrated white.
4. Briefly switch away from the app (10 seconds), return, then press CRVENA again. Do not rescan/reconnect between colors. Finally tap RASKINI VEZU. Save one aggregated test result with the existing result-export action; it contains notifications, GATT events, timestamps and operator observations, also saved privately inside the app. No screen-by-screen photo/log collection is required.

Success requires all four observed colors, the final red after background/foreground, and no unintended disconnect/automatic replay. Transport-only results are inconclusive. The foreground service mitigates ordinary Activity pauses; HyperOS background restrictions and physical BLE stability still require this test. DIM/CCT/FX remain unavailable until their protocol is established.

If the connection works but colors fail, reinstalling the same replay cannot prove the missing session. The next minimum evidence is one fresh official AsteraApp connection and red/white/green/blue sequence captured in an Android Bluetooth HCI snoop bug report, with the actual observed colors and firmware identified. Existing backend analyzers can map GATT endpoints and compare startup/parameter traffic without guessing payloads. Initial differential evidence is a candidate, not a validated driver; repeat fresh-session changes and correlate device replies before implementing authentication/ACK parsing or DIM/CCT/FX.

## Official reference boundaries

- [Astera Bluetooth Bridge](https://astera-led.com/bluetooth-bridge-btb): Bluetooth bridge and bidirectional UHF are distinct layers.
- [Astera Radio PIN](https://astera-led.com/support/answer/1651): Radio PIN is an Astera radio/session concept; it is not Android Bluetooth bonding.
- [Astera pairing procedure](https://astera-led.com/support/answer/1648): BlueMode and AsteraApp pairing procedure.

No public, verifiable BTB command/authentication SDK was found during this review. UUID discovery, CRC-valid captures and Android callbacks do not substitute for it or for a fresh-session physical result.
