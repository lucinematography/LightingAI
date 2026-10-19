# LightingAI Studio: parallel release and local signing preparation

Authorized scope: prepare durable local signing and a separate application, without
installation, migration, main changes or K0/K1 changes. The installed APK 7633 and
its private data are not accessed or changed.

## Application identity

Studio is a non-debuggable release-derived build type with applicationId
`com.lightingai.app.studio` and launcher label `LightingAI Studio`. The older review
package remains `com.lightingai.app.review13`; these identities can coexist.
The existing provider authority uses `${applicationId}`, preventing a provider-name
collision. Android keeps each application's private files and WebView stores in
its own sandbox. This does not copy old data into Studio.

Both CI workflows produce an explicitly **UNSIGNED** Studio APK. Studio sets
`signingConfig = null`, including when legacy release signing variables happen to
be configured. The Studio pipeline neither requires nor reads GitHub signing
secrets. The owner will download the unsigned artifact and sign on WIN11 only.

## Key custody plan — key NOT generated

Proposed primary directory, outside the repository:
`C:\Users\WIN 11\LightingAI Signing\Studio`.
The permanent key will use an encrypted PKCS#12 keystore with a long-lived Android
signing certificate. The primary directory will have restricted Windows access;
the local signing password will be protected using the owner's Windows DPAPI.
Neither secret will be committed, uploaded to GitHub, printed, or sent in chat.
Private keystore/credential formats are additionally ignored by Git as a secondary
barrier; this does not replace keeping all actual signing material outside Git.

Only C: and an optical D: were available when checked. The owner selected:
"I will connect an encrypted USB/external drive later." Generation is deferred
until that separate backup location is present and its encryption and ownership
can be checked. A copy on C: is not a backup against disk failure.

The external backup must contain the encrypted keystore and a portable recovery
method that works without the original Windows profile. DPAPI-only credentials
are not a portable recovery plan. Before generation, explain the exact backup and
recovery-file locations on the owner's encrypted volume and verify that the user
can recover the keystore without revealing secrets in this conversation. No secret
recovery file has been created yet. No signing configuration is activated yet.

## Future update procedure

1. CI runs the existing safety, knowledge, recovery and Android checks, plus Studio
   unit tests and unsigned package/label/debuggability checks. CI uses an increasing
   run number for automatic Studio test artifacts; manual unsigned builds take an
   explicitly chosen versionCode.
2. The WIN11 signer will verify artifact provenance and package identity, then sign
   with the same owner-controlled permanent key. The key must remain local, never
   in Actions secrets or a runner artifact. Local Java/Android signing tools still
   need to be prepared before this signing step is available.
3. Verify the resulting APK with Android SDK apksigner. Record only public metadata:
   applicationId, versionCode, certificate SHA-256, debuggability and APK SHA-256.
4. Before delivering an update, compare against the last approved signed Studio
   APK: identical Studio identity and certificate, non-debuggable, strictly higher
   versionCode. `scripts/studio-update-identity.mjs` implements this public metadata
   preflight. It is not a cryptographic verifier or an installer.
5. Keep the same data formats and private storage paths on each Studio update.
   The physical phone must still test an installed update retaining its own data,
   after the owner explicitly authorizes installation. Migration is a separate,
   previewed and explicitly approved operation.

This preparation does not yet provide a permanently signed or installable Studio
release. Certificate continuity cannot be claimed until the real key is generated,
backed up, pinned by public fingerprint, and used to verify at least two increasing
Studio versions. No installation or migration is authorized by this document.

Primary Android references:
- https://developer.android.com/studio/publish/app-signing
- https://developer.android.com/tools/apksigner
- https://developer.android.com/google/play/app-updates
