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

## Separate film scenes on the same device

The existing Projects screen does not isolate the Scene Planner workspace.
The planner previously had one shared draft/photo and no A-B-A scene picker.

An Android-backed scene selector now keeps the existing workspace in its original
files and keys as "Postojeća scena". Each added scene has separate AtomicFile
workspace/photo records and namespaced WebView caches. An atomic scene index
records the selected scene; no existing files are moved, imported or deleted.
The original one-photo-per-scene workflow is retained; this does not add a gallery.

Changing scenes first checkpoints the current draft and photo, blocks while media
or plan work is pending, and refuses to change selection on a failed save.
The destination is validated before committing the selection. In-memory plan,
review and preview state is reset; delayed photo/core callbacks cannot populate
another overlay. Accepted history and pending measurements stay scene-specific.
New scene storage remains bounded per record; disk failures do not evict scenes.

Four additional regression groups cover A-B-A, native-only reopening, photos,
plan/review isolation, pending measurements, failed writes and corrupt records.
The existing Android prepare/force-stop/restore test now exercises the actual
scene picker, distinct fixture photos, two plans/reviews and pending distances,
then verifies both scenes after process death. Fixture readings are not references.

No lighting recommendations or K0/K1 references change. Existing JSON export still
exports the current plan, not a complete multi-scene/photo disaster-recovery backup.
Device-local scenes are not independent backups.


## Portable scene backup v1

The separate **KOPIJA SCENE** card exports one UTF-8 JSON file, `LightingAI_SceneBackup_<timestamp>.json`.
It contains the selected scene name, draft description and whitelisted settings, the saved optimized
photo, pending plan edits and measurements, the complete saved revision chain and saved prelight reviews.
The latest lighting plan is reconstructed from its verified revision. This reuses the existing scene
registry and private per-scene files; it does not replace the older plan-only JSON export.

The envelope has `format: "LightingAI.SceneBackup"`, `version: 1`, `payload` and
`integrity: {algorithm: "SHA-256", digest: "..."}`. The digest covers the core's canonical JSON
serialization of the entire payload, including the photo and explicit exclusions. Import rejects
unknown versions/fields, malformed drafts/photos, invalid revision/review chains, checksum mismatch,
oversized input and credential-shaped keys. Native Android computes SHA-256 without a JavaScript
byte-array copy and validates image bounds before decoding any raster. Bounds: 24 MiB UTF-8 file,
existing 8 MiB workspace, existing photo data-URI limit of 12,000,000 characters, 16 megapixels and
8192 px on either side, and at most 100 scenes. A very long history may exceed the existing workspace
limit even when its portable file is smaller; this is reported as an import failure.

Preview is local and shows scene name, timestamp, photo, description, latest plan summary, history
counts and pending inputs/settings. It writes no new scene. Only the separate checkbox and explicit
confirmation button import it as a **new** scene with a fresh UUID and ` (uvoz)` name suffix.
The active scene and every existing scene remain unchanged. Cancelling discards the staged payload.
The image must finish loading before confirmation can import. SHA-256 detects corruption; it does
not authenticate an author, validate a lighting recommendation or prove a physical measurement.

Native import checks the current registry against the preview's expected registry, writes the new
workspace and photo with AtomicFile/fsync, and publishes the expanded registry last, atomically.
Failures clean up only this import's unregistered files. Process death before publication may leave
unlisted orphan files, but never a selectable partial scene; death after publication retains both files.
Existing registered scenes are never overwritten, removed or replaced. Freeing space permits retry.
No auto-import runs during startup. Completed imports use normal native recovery on subsequent starts.

Saved revision history and its accepted measurements remain immutable historical records.
Import clears the current `sp-measured` and coordinate verification flags. Pending measurement
confirmation checkboxes are not serialized at all. The imported-scene notice distinguishes old records
from fresh on-set confirmation; numeric drafts do not become measured facts through import.
This changes data portability only, and introduces no new cinematography claims or K0/K1 references.

### Privacy and exact scope

Android 10+ writes a new app-created file to local Downloads and reports success only after completion.
Android 8–9 uses ACTION_CREATE_DOCUMENT with a local-only picker and a completion callback. JSON import
uses a separate local-only ACTION_OPEN_DOCUMENT flow rather than the image/video gallery.
The feature makes no network requests. Tokens, authentication controls, global app preferences,
signing material and arbitrary WebView storage are not copied. Test photos, plans and credentials are
synthetic; no user scene data is committed or uploaded to CI.

The file is **not encrypted**: it contains private scene content. The UI tells the user to protect it.
Only the application's one saved optimized scene photo is included, not its original full-resolution
file or additional unsaved photos. Original video, sampled video frames, AI-generated media and the
global equipment inventory are explicitly excluded in both the format and UI. Fixtures embedded in
a saved plan remain in that plan. This is a backup of the persisted Scene Planner workspace, not a
claim to archive all source media or the whole application. Transfer the file locally between phones;
there is no automatic cloud upload or data migration.

Recovery self-tests include synthetic export/import, checksum and semantic corruption, explicit
confirmation/cancel, separate repeated imports, transfer to a fresh storage context, process replacement
without WebView storage, physical-confirmation separation, and storage exhaustion at workspace/photo/
registry transaction phases. Android emulator instrumentation additionally exports through the actual
Downloads writer, previews through FileReader, imports via the real native transaction, and verifies
the imported photo/history/pending inputs after the CI host force-stops and restarts Android's process.
