# Knowledge Engine K0 — local offline integration

K0 is a separate advisory milestone, not Phase 3B.3. It does not change production
routes, Android UI, fixture control, paid video, the PostgreSQL schema or any
previous revision. No trained AI model, photometric solver or relighting renderer
is supplied. The DoP decides; accepting a concept does not execute a lighting plan.

## Package and provenance

The user-supplied `LightingAI-Knowledge-Engine-Pilot-v1.zip` was found in Downloads.
Before extraction: all entries were checked for absolute/traversal/duplicate
paths and oversized entries; all seven payloads matched `CHECKSUMS.txt`.
Extraction used an isolated OS temporary directory outside this repository.
Checksums prove internal consistency with the supplied manifest, not independent
publisher authentication. The original ten package test groups passed unchanged
before adaptation. Demo and integration notes remain in the extracted package;
no original books, page images or media are imported into Git.

The seed JSON is byte-for-byte unchanged, SHA-256:
`53f3b96d0f7e231a2c5a6a1c7c2e7e4b3b31a7baa4a8232b5d2ddf9e9319ad02`.
It contains 53 short authored paraphrases, 35 indexed chapter ranges and nine
scene examples from three sources. Chapter indexing is not full-book processing.

| Source ID | Package bibliography | Page metadata |
| --- | --- | --- |
| landau-2014 | David Landau, Lighting for Cinematography, Bloomsbury Academic, 2014 electronic edition | 286 PDF pages; printed offset 10 |
| brown-2019 | Blain Brown, Motion Picture and Video Lighting, Routledge / Focal Press, 3rd edition, 2019 | 369 PDF pages; printed offset 1 |
| popovic-tv | Boris Popovic (priredio), Svjetlo u TV studiju / Primijenjena rasvjeta | 151 PDF pages; offset 0; edition/year/publisher UNKNOWN |

These are package assertions. Original books were not loaded or independently
rechecked in this integration. Citations explicitly carry
`PACKAGE_REFERENCE_NOT_INDEPENDENTLY_RECHECKED`, source ID, author, title, edition,
year, PDF page, printed page and the package's original-document hash. Unknown
bibliographic fields remain null. The loader pins the seed byte hash, validates
source metadata, unique record IDs, chapter ranges, printed/PDF offsets and scene
references. It rejects invalid pages, invented citation fields and references to
nonexistent records. It cannot prove that a paraphrase accurately represents a
book page without editorial review of the original. A hash is not that proof.

No long quotations or illustrations are included. Future full-text storage,
indexing, illustration reproduction and commercial distribution require a
separate rights review and necessary permissions. Older lamp, analog-TV,
electrical and rigging assumptions require current equipment and qualified
professional verification; this pilot does not certify safety.

## Read-only retrieval and alternatives

`scene-planner-knowledge.js` retains the package's deterministic weighted lexical
retrieval and Serbian/Croatian/English term expansion, including Serbian Cyrillic
transliteration. Input is bounded; options are strict. Scene type alone cannot
create a match without matching terms. ID order resolves ties independently of
system locale. Corpus, scene examples and all returned nested structures are
deeply frozen. The local file is read once; there are no writes or network calls.

`scene-planner-knowledge-adapter.js` accepts a bounded scene brief, narrative intent,
style, contrast, optional scene type and user-declared inventory IDs/quantities.
It validates the Phase 3A revision with the existing core. Optional expected
binding must match sceneId, revisionId, lightPlotRevisionId and planHash exactly.
It returns a frozen, SHA-256-hashed advisory report with knowledge version/hash,
selected record IDs, bibliography, conditional alternatives and their trade-offs.
Each alternative's rationale includes its record ID and page citations directly.

Ten candidate families are considered only when relevant records match: cross-key,
motivated window, soft fill, negative fill, practical night, layered night,
shared multicam, music cues, neutral color and mixed color. This is a transparent
rule-based pilot, not general semantic reasoning. It does not fabricate an
alternative when no record matches. Each candidate carries intended roles,
motivation, expected look, limitations and prerequisites. No candidate is
universally preferred. Explicit comparisons address cross-key versus soft fill,
added fill versus negative fill and neutral versus mixed color when both match.
Ranking is retrieval relevance, not measured artistic quality or feasibility.

The adapter uses the existing runtime fixture catalog to resolve declared IDs.
A catalog match confirms the catalog entry, not ownership, availability, optical
output or electrical suitability. Missing models stay unmatched. No fixtures are
assigned automatically, and no precise positions, distances, lux or camera
settings are invented. Existing plan light IDs are retained as context only;
their estimated positions do not become measurements. Geometry, photometry,
camera calibration, actor tracking, shadow continuity, grip and power remain
UNKNOWN. Missing inventory is explicit. Compatibility of modifiers, circuit
loading and full path/camera coverage remain on-set checks.

Evidence categories are kept separate:

- BOOK_DERIVED_PRINCIPLE: short authored corpus summaries and citations.
- PIXEL_MEASUREMENT: only genuine existing visual analysis, decoded code values.
- VERIFIED_CALCULATION: reserved; no K0 photometric calculation is executed.
- USER_SUPPLIED_FACT: brief, preferences, declared equipment and DoP decisions.
- CREATIVE_RECOMMENDATION: conditional role/look/strategy and comparison.
- UNKNOWN: unsupported physical or technical conclusions.

## Video and revision trust boundary

Optional ingestion, visual analysis and calibration objects pass their existing
verification functions. Only trusted in-process decoded ingestion can supply
video binding; metadata-only JSON is refused. Visual/calibration objects must
match that ingestion and the same revision. The advisory stores sourceIdentity,
temporalHash, ingestionHash and, when available, visualHash and calibrationHash.
Pixel context records method, original rational clock and frame count. It does
not convert code values into lux, physical WB, geometry, actors or shadow proof.
Forged JSON copies and mismatched sources/revisions are refused.

Reports and decisions have separate in-process trust sets and canonical hashes.
Hashing protects consistency; the trust sets prevent client JSON from granting
itself authority. Durable import/authentication is future work. The report is
linked to the same frozen revision used by technical cards and the 2D plot; K0
does not generate or change either view.

DoP actions are accept, reject and reconsider. Accept identifies an existing
alternative and records concept approval only. Reject leaves the plan unchanged.
Reconsider contains a complete bounded new brief/preferences/inventory, creates
a new advisory hash with parentRecommendationHash and preserves the previous
report and revision. If video was linked, it must be supplied and reverified
with the same source and temporal hash. Creating a future lighting revision
through Phase 3A is an explicitly separate step; K0 never silently rewrites it.

## Example: tense daytime dialogue by a window

For two actors, request a motivated but tense scene with visible faces. Compare:

1. Cross-key: reciprocal keys can also separate the other actor. Validate both
   camera directions, blocking, mutual occlusion and fixture visibility.
   SET-003 cites Landau printed pp. 72–73 (PDF 82–83) and Popovic pp. 38, 106.
2. A directional soft window key with controlled fill: preserve the window's
   motivation while keeping shadows readable. Validate sunlight changes, window
   clipping and the entire actor path. PHY-004, DAY-001/002 and SET-005 provide
   the page-specific references in the actual returned rationale.
3. Negative fill: reduce unwanted bounce to deepen the requested tension. This
   can conflict with a broad soft-fill approach; DoP chooses which intention
   matters in each angle. PHY-007/008 document the supporting principles.

These are proposals requiring geometry, inventory, metering and set review.
They contain no fabricated placement, camera exposure or physical illuminance.

## Validation and remaining work

Commands (existing Node 22; no installations):

```text
node backend/scene-planner-knowledge-selftest.js
node backend/scene-planner-knowledge-adapter-selftest.js
cd backend
npm run check
```

Ten adapted package groups plus nine K0 adapter contract groups cover all three
books, day/night, dialogue/cross-key, window motivation, multicam, music,
conflicting approaches, reference corruption/false quotes, wrong plot/hash,
missing equipment/geometry, DoP changes and history immutability. The new command
`test:scene-planner-knowledge` is included in backend check. Stable-base allows
only these five backend knowledge files and this document; the CI Autofix
candidate fixture copies only these explicit paths, retaining its negative tests.

With the explicitly selected already-installed decoder, an additional real
offline test generates a private temporary procedural H.264 clip, decodes 20
frames through existing ingestion/visual modules, creates a genuine calibration
report and checks knowledge linkage and forgery/revision rejection. The fixture
directory is checked and removed in finally. No video or pixels enter Git/logs.
Without explicit decoder selection it prints REAL KNOWLEDGE VIDEO BINDING:
NOT EXECUTED; the mandatory contract tests still run. This is procedural decoding,
not a real film benchmark, actor analysis or Day-for-Night video generation.

Real-film knowledge validation, independent book/page review, professional
quality review, semantic retrieval/LLM reasoning, complete UI, durable advisory
storage, automatic new-plan revision creation, photometry and renderer remain
unimplemented. No new GitHub CI run is triggered by this local-only task.
Android SDK/Gradle and actual PostgreSQL integration require their existing CI
environment when unavailable locally; preflight is not a database integration
test. Decoder tests are separately reported from synthetic contract tests.

Local verification on 2026-10-10: package 10/10, adapted package 10/10, adapter
9/9 plus genuine 20-frame procedural video binding passed. Complete backend
check passed, including 18 revision groups, 13 temporal groups, 12 ingestion
contract groups plus real CFR/VFR/failure checks, seven synthetic and eight real
visual groups, six calibration contract groups with 13 procedural scenarios and
47 Phase 2 video tests. Existing calibration limitations remain visible
(validation TP 11 / FP 2 / FN 1, F1 0.88); K0 does not improve that detector.
CI Autofix 23/23, Project 5 safety/stable-base/release, backup and PostgreSQL
preflight 3/3 passed. JavaScript/MJS syntax passed for all 233 project files;
tracked diff and untracked whitespace checks passed. The release check must run
from backend; an initial invocation from repo root failed on its expected relative
workflow path, and rerunning in the correct directory passed without code edits.
The explicitly selected existing FFmpeg version was n4.4.4-6-gd5fa6e3a91.
Without decoder selection, mandatory K0 tests also pass and real video binding
prints NOT EXECUTED. Android/Gradle/SDK and real PostgreSQL server were unavailable;
no new CI run, independent source-book verification or real-film evaluation ran.

Next recommended milestone: DoP review of the seed and bibliography against
authorized originals, followed by curated scene/alternative relevance tests and
explicit equipment/geometry/photometry contracts. Full-book processing and a
renderer need separate authorization. No staging, commit or push is authorized
for this local K0 integration.
