# Scene Planner: key/fill and measured-exposure context (pilot)

This is an **offline, deterministic, user-evidence-only** analysis. It does not call an AI service, control a fixture, start a paid preview, publish a release, or change a physical set. The plan and its evidence stay bound to an immutable, SHA-256-checked revision.

## Key/fill: what the calculation means

`compareKeyFillMeasurements(revision, keyId, fillId)` accepts only an owned, available key and fill with both positive, user-entered incident-lux readings. Each reading must have:
- A matched fixture and previously reported on-set fixture-to-subject distance, with isolated-light attestation.
- V2 meter context, the same user-reported meter model, the same named measurement point, both receptor orientations toward the camera, and a reported local reading time.
- Readings separated by **no more than 15 minutes**.

Blocked comparisons have `status=NOT_COMPARABLE`, an explicit reason and **null** ratio and stop difference. Neither a zero denominator nor legacy meter metadata can produce a numeric answer. This is **self-reported protocol comparability**, not independent confirmation that it was the same *physical* meter; model strings are not unique serial numbers. Local wall-clock times do not prove a shared time zone or stable lighting between takes.

For a comparable pair:

- `ratio = keyLux / fillLux` (six significant figures).
- `relativeStops = log2(keyLux / fillLux)` (three decimal places; signed, key minus fill).
- Example: 400 lx key / 100 lx fill = 4:1 and +2 stops of **isolated, camera-axis incident contribution**. If the fill is brighter, the signed difference is negative.
- A card attached to the active revision can supply a practical *principle, application, check and limitation*. Only attached `SET-005`, `SET-002`, `EXP-001` are used. Absence of a card yields no made-up reference.

No numeric result proves scene contrast, face shadow ratios, total scene lux, reflectance, key dominance in the image, sensor capture, a preferred lighting ratio, or that the DoP will accept the look. Inspect double shadows, monitor/waveform, motivation, blocking and every camera angle. Book cards are curated paraphrases, **not independently page-verified books**.

## Camera / exposure foundation

`analyzeMeteredExposureContext(revision, keyId, fillId)` first checks revision integrity, and *separately* computes a mathematical **nominal settings EV100** from validated camera settings:

```text
shutterSeconds = shutterAngle / (360 * fps)
nominalSettingsEv100 = log2( (fNumber^2 / shutterSeconds) * (100 / ISO) ) + NDstops
```

This is a **settings-only index** for the entered or AI-proposed f-number, shutter angle, frame rate, ISO and ND stops. It is NOT an incident or spot reading, a measured EV of the scene, a calibrated exposure prediction, actual lens T-stop, verified sensor EI, verified ND transmission, or a camera waveform reading.

The returned revision-bound record deliberately keeps these fields **null**:
- `derivedSceneLux`
- `measuredSceneEv100`
- `recommendedAperture`
- `recommendedIso`

And deliberately keeps `sceneExposureVerified`, `cameraExposureVerified`, `meterCalibrationVerified` and `manufacturerPhotometricsUsed` **false**.

If a key/fill pair is not comparable, `status=CAMERA_SETTINGS_ONLY`; its meter lux and stop fields remain null. If comparable, `status=RELATIVE_LIGHT_CONTRIBUTIONS_ONLY`: relative meter contribution and nominal camera settings coexist but **are not converted into one another**. No photometric output is generated from manufacturer tables, AI guesses or camera pixels.

To support a future calibrated workflow, require recorded instrument identity and calibration, verified measurement protocol (and local offset/time provenance), exact sensor and diffusion configuration, scene/background/ambient measurement, camera profile/EI and actual exposure validation (e.g. gray card and waveform) before drawing camera-exposure conclusions.

## Regressions

`npm run test:scene-planner-photometry` exercises positive and negative signed stops, equal contributions, missing/inconsistent meter context, no made-up lux/aperture/ISO, book-card binding, UI presence and rejection of tampered meter/camera revisions. The full CI workflow also runs existing tests for the Scene Planner, revision history, backend and Android build.

No K0/K1 sources or protected `main` files are modified by this work.
