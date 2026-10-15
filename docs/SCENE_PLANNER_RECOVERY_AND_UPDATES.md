# Scene Planner recovery and APK update safety

## Recovery changes

The branch was fast-forwarded from b6993e60 to 7e08b1f4 after confirming that the
only local change, `-vsync 0`, was outside the incoming paths. CI build 7644 passed.
No local work, K0/K1 content or historical experiment was replaced.

The reviewed recovery implementation had these problems:

- It tracked `contrast` instead of the actual `fill` prelight control.
- Debounced text saves could lose the last edit if the process ended before the timer.
- Inline photo storage always won over IndexedDB, so replacing a small photo with
  a larger photo could restore the older image. Concurrent DB writes could also reorder.
- The pagehide listener was removed with the wrong callback on close.
- Voice edits did not trigger capture, photo writes were not awaited, malformed
  draft data could be silently replaced, and storage failures were not visible.

Edits now checkpoint synchronously; scroll uses a debounce plus explicit lifecycle
flush. Android onStop and onSaveInstanceState invoke the same draft checkpoint.
These callbacks are supplementary: abrupt process death does not promise a final
callback. Generated plans and saved reviews still use validated immutable revision
history. Unsaved review choices and DoP camera/light edits restore only for the
same revision, without converting pending choices into saved DoP acceptance.

Photo records now have monotonic sequence numbers across both existing stores.
Recovery selects the latest committed record; DB writes are serialized. Legacy
photos remain readable. Selecting a photo waits for persistence confirmation and
reports failure. An in-flight photo transaction interrupted before commit cannot
be guaranteed; the UI confirms durable saving only after success. Corrupt drafts
are preserved and blocked from replacement, with a visible warning.

## Tests

`backend/scene-planner-recovery-selftest.js` covers immediate process replacement,
all three pending review decisions, revision scoping, DoP fields, background and
pagehide, listener cleanup, corrupt data, storage quota, small/large photo
replacement, concurrent/failed DB writes, legacy photos and immutable plan/review
restoration. It runs in the existing package check chain.

The Android instrumentation runner has no extra library dependency and runs only
in the disposable CI emulator. Its prepare phase creates a tiny fixture photo,
generates an offline plan, saves reviews, changes a pending choice, backgrounds
and resumes the activity. The CI host then force-stops the target process without
clearing data. The restore phase verifies automatic reopening, description, photo,
ISO, exact validated plan, saved review history and pending review choice. This is
not a physical-phone test, and does not test video processing or call AI providers.

Existing security checks remain enabled. The stable-base guard admits only the
three exact new test/report paths, with its negative checks retained.

The first real process-death run (7646) passed background/resume preparation but
failed automatic recovery after the target process was killed. WebView-only
persistence was therefore insufficient in that test. The follow-up adds private
Android AtomicFile checkpoints for the four whitelisted workspace keys and for
the selected photo. Successful native calls complete an atomic file write before
the UI acknowledges persistence. On startup the newest native checkpoint restores
WebView data; a newer surviving local draft and malformed local data are preserved.
The native store is bounded to 8 MiB of workspace JSON and 12.1 MB of photo JSON.
Reads/writes are restricted to the trusted Android asset page, and no tokens,
external file paths, private keys or control transport commands are included.

## APK inspection and current limitation

Both downloaded original artifacts match GitHub's published file SHA-256.
Read-only APK v2 checks verified their RSA signed-data signatures, certificate
public-key binding and whole-file chunked content digests following the AOSP v2
format. Binary manifest inspection found:

| Build | applicationId | versionCode | certificate SHA-256 |
| --- | --- | --- | --- |
| 7633 | com.lightingai.app.review13 | 13 | bb23358ca5f407eef96208f8ccc17dbd65579cc2defcda5bd2b22c54d3baf7f4 |
| 7644 | com.lightingai.app.review13 | 13 | dbc092df2742c790d6ab31b82288c6471ece75a8d0ca3b8cc5ce5d32a3891a9a |

Their versionName is `2.1-review13`. Certificates differ, so 7644 cannot replace
7633 under the ordinary Android update rules. Private keys cannot be recovered
from these public certificates. No private key or password was read or published.

The debug signing method and applicationId are unchanged. The CI debug build now
uses the monotonically increasing workflow run number as versionCode, and invokes
the Android SDK apksigner verifier and aapt identity check. This fixes version
ordering and audits signatures; it does not solve certificate continuity. A newly
generated CI debug key still cannot update an older differently signed APK.

## Proposed safe update/migration plan — NOT EXECUTED

1. Keep the installed app and all its data. Determine its actual package and public
   certificate, and whether the matching private signing key still exists in an
   authorized secure backup. If it exists, using that same key requires explicit
   user approval and a test of a signed update with a higher versionCode.
2. If the matching key is unavailable, obtain explicit approval for a dedicated
   durable signing key and a distinct companion applicationId. This lets both apps
   coexist; it does not uninstall or overwrite the old app.
3. Before importing anything, export the existing app's projects and Scene Planner
   plan JSON with its current controls, retain the original photo, and preserve its
   description/settings. Those older exports do not include every draft/photo
   record. A complete rescue may require authorized read-only access to the old
   debug app on a connected phone. Do not assume that ordinary project backup
   contains the new Scene Planner draft. Do not copy live WebView DB directories
   blindly across app identities.
4. Build and validate a bounded, preview-before-import transfer for the approved
   companion app. Check plan/review bindings and photo content, show what will be
   imported, require explicit confirmation, and verify the new copy on the phone.
   Keep the old app until the user confirms the complete recovered copy.
5. Back up the approved stable signing key outside Git and store CI signing
   credentials in protected secrets. Future builds must match the approved public
   certificate and applicationId, increase versionCode, and preserve storage keys.

No key creation, signing change, companion ID change, migration or uninstall was
performed. The next APK is a diagnostic build until this decision is approved.

Primary Android references:
- https://developer.android.com/guide/components/activities/activity-lifecycle
- https://developer.android.com/google/play/app-updates
- https://developer.android.com/studio/publish/versioning
- https://source.android.com/docs/security/features/apksigning/v2

## Pending on-set measurement drafts

Distance, selected mounted optic, isolated incident-lux metadata, combined scene
incident-lux metadata and gray-card/waveform input fields now survive app backgrounding
or process replacement through the existing draft/native checkpoint path.
These are uncommitted user entries, bound to the exact active plan revision.
They do not create a measurement record, new plan revision or accepted prelight review.

Only explicitly listed text/number/date/select fields are persisted. Physical
measurement, camera/setup and reference confirmation checkboxes are deliberately
excluded and require the operator's fresh confirmation after recovery. Changed
revision IDs, unknown select choices, secret/hidden/file controls, malformed values
and unsupported fields are not restored. Existing version-1 drafts remain readable.

Four additional recovery regression groups cover same-revision restoration,
native-only recovery, immutable accepted history, confirmation/privacy exclusions
and malformed input. The new regression fails on the previous implementation.
Numeric examples in tests are arbitrary fixtures, not lighting or camera references.

This is a persistence fix supporting practical on-set work, not a new lighting
recommendation. K0/K1 and their Landau, Brown and Popović references are unchanged;
no new book quotations, page claims or exposure rules are introduced.
