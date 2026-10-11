# Knowledge Engine K1 — source audit and professional decision structure

This is local/offline development based on K0 at commit
`6b6589f751e432282dcb4dc08d16c2ff4fcf10ab`, previously validated by CI #7456.
No production route, Android code, video module, database schema or fixture
control is changed. No staging, commit, push, installation or renderer work is
authorized. The DoP retains the final creative decision.

## Original sources and honest coverage

The user confirmed that the three original PDFs attached in ChatGPT are not
available to this Codex environment. Relevant PDF filenames were not found in
Downloads or this repository. No substitute was downloaded, no DRM was bypassed,
and no original page was independently reviewed. The already supplied pilot ZIP
remains available. K1 uses its existing K0 corpus without changing one byte.
The user requested no further PDF requests during this phase.

Base knowledge version: `lightingai-knowledge-seed/1.0.0`.
Base SHA-256: `53f3b96d0f7e231a2c5a6a1c7c2e7e4b3b31a7baa4a8232b5d2ddf9e9319ad02`.
There remain 53 cards, 35 indexed chapter ranges and nine examples. No new
source-derived knowledge card is added. This is not complete book processing.

| Source | Bibliography from K0, not independently rechecked | K0 PDF pages | User-reported conversation pages | Independent review |
| --- | --- | --- | --- | --- |
| L / landau-2014 | David Landau, Lighting for Cinematography, 2014 electronic edition | 286 | 285 | NOT AVAILABLE FOR INDEPENDENT REVIEW |
| B / brown-2019 | Blain Brown, Motion Picture and Video Lighting, 3rd edition, 2019 | 369 | Not provided | NOT AVAILABLE FOR INDEPENDENT REVIEW |
| P / popovic-tv | Boris Popovic (priredio), Svjetlo u TV studiju / Primijenjena rasvjeta; edition/year unknown | 151 | 150 | NOT AVAILABLE FOR INDEPENDENT REVIEW |

The 286/285 and 151/150 differences remain UNRESOLVED. They do not establish
incorrect citations or justify shifting all pages. Concrete file hashes, edition
verification, actual PDF page counts and printed-page mappings are null until
the actual copies can be separately compared. K0's original hashes and offsets
(L 10, B 1, P 0) remain original package assertions. PDF page and printed page are
stored and displayed separately, never treated as interchangeable indices.

Source status and professional approval are distinct dimensions:

- SOURCE_VERIFIED: reserved for an actually reviewed, supporting original page.
- PARTIALLY_SUPPORTED: reserved for reviewed partial support.
- SOURCE_MISMATCH: reserved for a reviewed source/page disagreement.
- UNVERIFIED: the original was not reviewed; currently all 53 cards.
- NEEDS_DOP_REVIEW: separate DoP status; currently all 53 cards.

No status above UNVERIFIED can be granted by this K1 implementation. A hash,
matching metadata, a correction proposal or a DoP acceptance does not verify a
book page. The future authenticated editorial page-review process is not built.
Thus confirmed original-page references: 0; proven mismatches: 0; reviewed pages:
0. Metadata consistency alone passed for the entire existing reference inventory.

## Isolated technical architecture

`scene-planner-knowledge-review.js` pins and validates the unchanged K0 seed,
builds a deeply frozen per-card reference inventory and returns a deterministic
SHA-256 audit overlay. It retains each card's limitations, required checks,
sources, author, edition, printed/PDF pages and expected source hashes. It records
15 requested topic areas as having no independently reviewed source coverage;
existing prefix-based topic hints are not comprehensive chapter coverage.

Correction proposals are separately hashed and explicitly USER_SUPPLIED_FACT,
PENDING_INDEPENDENT_PAGE_REVIEW and UNVERIFIED. They require the correct base
knowledge/source hashes and an existing referenced card/page. Claimed replacement
copy hash, edition, count and proposed printed/PDF mapping remain claims. A
different claimed copy is quarantined, not classified SOURCE_MISMATCH. Impossible
pages against the claimed count, invented quote fields, fake verification fields
and spoofed records are rejected. No proposal is applied to K0 or retrieval.

Expansion drafts contain topic, intended sources and review questions only:
principle null, citations empty, retrievable false. They cannot masquerade as
new expert knowledge. The future sequence is concrete file/edition identification,
independent page review, short original paraphrase, support assessment, separate
DoP review, versioned registration and relevance tests. Any correction/new card
must be a new version rather than a silent rewrite of K0.

`scene-planner-knowledge-k1.js` wraps unchanged K0 retrieval/advisory APIs. It
prepares the creative goal, known user assertions, unknown physics, relevant
principles, alternatives, author-specific methods, conditional preferences,
risks, on-set checks and DoP changes. Production (narrative, documentary,
TV multicam, music), location, day/night, camera/actor motion and budget are
explicit USER_SUPPLIED_FACT context, not decoded tracking results.

Candidate families come only from matching K0 cards. Context checks exclude night
families for declared day, the daylight window family for night unless future
separate source justification exists, cross-key dialogue with fewer than two
declared actors, and music cues in another specified production type. Exclusions
are reported with reasons. If zero or one candidate survives, K1 says so and
never fabricates a second. This conservative rule-based structure can exclude
valid unconventional choices; DoP can change the request. It is not autonomous
human understanding or a complete semantic relevance model.

Each option keeps distinct authors, record IDs, citations, why/when/conditions
and limitations. Author agreement is not inferred from retrieval score. Neutral
matching versus mixed color, cross-key versus soft fill, and added fill versus
negative fill retain their trade-offs. Historical equipment/exposure/color/
safety principles require current datasheets, digital camera tests and qualified
set verification; they do not certify contemporary LED performance or safety.

## Scene identity, evidence and DoP

Every brief and decision is bound to sceneId, revisionId, lightPlotRevisionId and
planHash through the existing Phase 3A verifier. K1 stores base knowledge
version/hash, auditHash and its own knowledge/brief hash. The K1 knowledge hash
identifies base corpus + audit + rule version, not new book knowledge. Reports
and decisions are frozen, and private in-process trust sets reject forged JSON
even if its hashes are recomputed. Durable authenticated import remains future
work. No existing revision, plot, original video or K0 report is changed.

Optional video passes the existing ingestion, visual and calibration verification
functions through K0. Source identity, temporal and visual hashes are retained.
DoP reconsideration must reverify an already linked video; dropping or swapping
it is rejected by the existing boundary. Actor/camera movement requests never
become proof of tracking. K1 is backend/offline infrastructure, not a completed
interactive Android UI or production API integration.

The six categories remain BOOK_DERIVED_PRINCIPLE, PIXEL_MEASUREMENT,
VERIFIED_CALCULATION, USER_SUPPLIED_FACT, CREATIVE_RECOMMENDATION and UNKNOWN.
Source support and pixels are not physical illuminance. K1 executes no photometry
and invents no lux, distances, positions, Kelvin, ISO, aperture or WB. Geometry,
camera calibration, actor tracking and shadow continuity remain UNKNOWN.

Accept records concept approval for an existing surviving candidate; source review
is unaffected. Reject makes no plan mutation. Reconsider creates new K0 and K1
advisory hashes with parent links and leaves prior histories frozen. Automatic
creation of a new physical lighting-plan revision is not implemented.

## Example comparison

For a tense daytime dialogue between two actors beside a window, compare:

1. Cross-key: reciprocal source roles may model both faces and separate planes.
   Landau printed pp. 72–73 (PDF 82–83) and Popovic pp. 38, 106 are the K0
   SET-003 references. TV-002 provides multicam-context cross-lighting references.
   Validate both camera directions, occlusion and visible equipment.
2. Directional soft window key with controlled fill: retain source motivation,
   soften facial transitions and protect readability. PHY-004, DAY-001/002 and
   SET-005 carry their own multi-source citations. Window clipping, sunlight
   changes and spill must be checked.
3. Negative fill: reduce bounce for the requested tension rather than adding
   fill indiscriminately; check shadow continuity over blocking. PHY-007/008
   provide the conditional source-based principles.

In narrative coverage, a directional approach may be reconsidered per setup;
simultaneous multicam requires checking every active angle. More soft fill can
aid readability but reduce the requested tension. These are creative comparisons
of UNVERIFIED package references, not independently certified author conclusions
or a physically validated executable plot. Missing gear makes feasibility UNKNOWN.

## Test commands and scope

The new `test:scene-planner-knowledge-k1` command is appended to backend check,
after unchanged K0 tests. Existing tests and dependencies are not replaced.
Stable-base and CI Autofix admit only the three exact K1 backend paths and this
document, retaining their blocking checks and adversarial fixtures.

```text
node backend/scene-planner-knowledge-k1-selftest.js
cd backend
npm run check
```

Twelve mandatory K1 contract groups cover all 53 cards/references, fake source
verification, page/copy distinctions, stale hashes, nonexistent pages/quotes,
quarantined correction/expansion, cross-author methods, scene/motion/gear contexts,
unknown physical data, DoP decisions, immutability, wrong plot/video and K0 parity.
These tests do not review original books. An optional test uses only the already
selected existing decoder to generate/decode 20 procedural frames in a private
temporary directory, verify K1 video binding/reconsideration and reject forged
receipts. It cleans its directory in finally; no fixture or frame is stored in
Git. Without explicit decoder selection it prints REAL K1 VIDEO BINDING:
NOT EXECUTED. Procedural decoding is not a film benchmark or Day-for-Night render.

The 15 requested areas remain editorial expansion targets, including faces,
hard/soft light, contrast/shadows, lighting roles, daylight, night/effects,
color/exposure, movement/continuity, multicam, modifiers/grip, photometry and
electrical/mechanical safety. No new principles are authored without source
support. Source books, independent page review, semantic retrieval, authenticated
editorial workflow, DoP expert approval and calibrated physical feasibility
remain unavailable or future work.

## Executed local validation

On 2026-10-10 all 12 K1 contract groups passed, both with and without explicit
decoder selection. With the already-installed FFmpeg n4.4.4-6-gd5fa6e3a91, the
20-frame procedural K1 video binding/reconsideration test also passed. Without
decoder selection that optional check correctly prints NOT EXECUTED. No new
decoder, PDF tool, dependency or model was installed.

Complete backend check passed: K0 10 corpus groups + nine adapter groups + real
20-frame binding, Phase 2 video 47/47, Phase 3A 18 groups, temporal 13 groups,
ingestion 12 contract groups plus real 50-frame CFR / 49-frame VFR and process
failure/timeout/cleanup checks, visual seven synthetic / eight real procedural
groups, calibration six contract groups and 13 procedural scenarios. Calibration
retains its previously reported validation TP 11 / FP 2 / FN 1 (F1 0.88); these
are existing detector limitations, not newly introduced K1 test failures.

CI Autofix 23/23, Project 5 safety/stable-base/release, backup and PostgreSQL
preflight 3/3 passed. All 236 JavaScript/MJS files passed syntax checks; tracked
diff and untracked whitespace checks passed. All 53 documentation rows were
checked against the inventory. K0 corpus, retrieval behavior and historic scene
revisions remained unchanged in tests. Exact change scope is three new backend
files, this document and the three shared test/guard files.

Independent original-book review: NOT EXECUTED (sources unavailable). Real-film
evaluation: NOT EXECUTED. Android SDK/Gradle tools and the actual PostgreSQL test
server were unavailable locally; preflight is not real database integration.
No new GitHub CI run was triggered. CI #7456 remains the prior committed K0
baseline, not proof that these uncommitted K1 changes passed GitHub CI.

## Per-card audit

References below use source IDs L/B/P from the source table. Every reference is
shown as printed page / PDF page. Status columns distinguish source review and
DoP approval. The final column specifies the next card-specific on-set check;
all cards also require concrete file/edition and original-page support review.

| ID | Card | Printed / PDF references | Source status | DoP status | Limitations | Next check |
| --- | --- | --- | --- | --- | --- | --- |
| NAR-001 | Prvo prica i emocija, zatim reflektori | L: 6 / 16; B: 144 / 145; P: 97 / 97 | UNVERIFIED | NEEDS_DOP_REVIEW | Nema univerzalno ispravnog izgleda; kreativna ocena je ljudska. | Proveri sa direktorom fotografije da li prikaz podrzava nameru scene. |
| NAR-002 | Motivisano svetlo verovatnog izvora | L: 5 / 15; L: 41 / 51; P: 94 / 94; B: 76 / 77 | UNVERIFIED | NEEDS_DOP_REVIEW | U reklamama, koncertima i izrazito stilizovanoj drami motivacija moze biti namerno slobodnija. | Uporedi svetlosne pravce sa kadrom i rasporedom izvora; pitaj DoP kada je stilizacija namerna. |
| NAR-003 | Upravljanje paznjom gledalaca | L: 4 / 14; L: 5 / 15; B: 144 / 145 | UNVERIFIED | NEEDS_DOP_REVIEW | Jace osvetljenje nije jedini nacina usmeravanja paznje; kadar i boje su takodje bitni. | U preglednoj slici proveri da li nepotrebno svetla pozadina preotima paznju. |
| NAR-004 | Vizuelna dubina kroz svetlo i senku | L: 5 / 15; P: 13 / 13; B: 60 / 61 | UNVERIFIED | NEEDS_DOP_REVIEW | Iluzija dubine zavisi i od geometrije kadra, objektiva, dekora i pokreta. | Proveri da rezultat nije ravna slika osim ako je takav stil zahtevan. |
| PHY-001 | Cetiri osnovna parametra filmskog svetla | L: 9 / 19; P: 11 / 11; B: 58 / 59 | UNVERIFIED | NEEDS_DOP_REVIEW | Iz piksel vrednosti se ne moze direktno izracunati fizicka jacina izvora. | Zahtevaj ljudsku proveru sa stvarnim reflektorima i kamerom. |
| PHY-002 | Ugao izvora u odnosu na kameru | P: 13 / 13; P: 14 / 14; L: 10 / 20 | UNVERIFIED | NEEDS_DOP_REVIEW | Broj stepeni nije univerzalni recept za svako lice. | Pogledaj test-kadar sa planiranog polozaja kamere. |
| PHY-003 | Velicina izvora i meko svetlo | P: 19 / 19; P: 20 / 20; B: 92 / 93; L: 10 / 20 | UNVERIFIED | NEEDS_DOP_REVIEW | Meko svetlo nije sinonim za mali kontrast: negativ fill moze ocuvati visok odnos. | Uporedi ivicu senke i svetlosni spill na probi. |
| PHY-004 | Usmereno meko svetlo - flamanski prozor | P: 22 / 22 | UNVERIFIED | NEEDS_DOP_REVIEW | Naziv opisuje izgled, ne preciznu fotometrijsku specifikaciju. | Proveri smer nosa i senke, odsjaje, spill i realizam izvora. |
| PHY-005 | Pad osvetljenosti sa rastojanjem | L: 6 / 16; L: 7 / 17; P: 49 / 49 | UNVERIFIED | NEEDS_DOP_REVIEW | Za velike prostorne izvore, bounce, sociva i refleksije jednostavna tackasta aproksimacija moze biti netacna. | Stvarne vrednosti racunaj iz fotometrijskih podataka, ugla snopa i udaljenosti. |
| PHY-006 | Odbijanje i nekontrolisani spill | L: 8 / 18; B: 97 / 98 | UNVERIFIED | NEEDS_DOP_REVIEW | Fizicki transport svetla kroz prostor nije poznat iz same fotografije bez dodatnih podataka. | Proveri u setu da li boja okoline utice na kozu i rekvizitu. |
| PHY-007 | Negative fill i kontrola odsjaja | L: 8 / 18; B: 97 / 98; P: 21 / 21 | UNVERIFIED | NEEDS_DOP_REVIEW | Stativ, opterecenje, vetar i bezbednost grip postavke mora potvrditi profesionalac. | Pogledaj da li kontrast ostaje unutar planiranog opsega kamere. |
| PHY-008 | Cut, flag i eggcrate nisu zamenljivi | P: 20 / 20; P: 21 / 21; B: 96 / 97; B: 97 / 98 | UNVERIFIED | NEEDS_DOP_REVIEW | Izbor nosaca mora ostati vezan za specifikaciju i odobren rigging. | Proveri trag svetla na pozadini i opasnost ulaska opreme u kadar. |
| SET-001 | Odvojeni slojevi osvetljenja kadra | L: 55 / 65; L: 149 / 159; B: 60 / 61 | UNVERIFIED | NEEDS_DOP_REVIEW | Ne dodavati svetla mehanicki ako tamna pozadina ima svesnu narativnu svrhu. | Proveri pozadinu u wide shot-u, ne samo close-up. |
| SET-002 | Three-point je alat, ne obavezna formula | L: 41 / 51; L: 42 / 52; P: 31 / 31; P: 34 / 34 | UNVERIFIED | NEEDS_DOP_REVIEW | Sema nije univerzalno optimum za sve scene. | Proveri da osnovna shema ne izgleda studijski kada se trazi naturalizam. |
| SET-003 | Cross-key za razgovor dvoje ljudi | L: 72 / 82; L: 73 / 83; P: 38 / 38; P: 106 / 106 | UNVERIFIED | NEEDS_DOP_REVIEW | Svaki dijalog ne zahteva ovu postavku; odluku uskladiti sa stilom i lokacijom. | Proveri blocking, medjusobno zaklanjanje izvora i dva smera kamere. |
| SET-004 | Chicken-coop svetlo za stolom | L: 77 / 87; L: 78 / 88 | UNVERIFIED | NEEDS_DOP_REVIEW | Overhead rasveta trazi profesionalno odobreno osiguranje i nosivost konstrukcije. | Pregledaj oci, senke ispod brade i eventualno zaklanjanje pri ustajanju. |
| SET-005 | Dopunsko svetlo kontrolise kontrast | P: 32 / 32; P: 38 / 38 | UNVERIFIED | NEEDS_DOP_REVIEW | U dramaticnim kadrovima izostanak fill-a moze biti nameran. | Proveri vise senki ispod nosa i brade. |
| SET-006 | Kontura i odvajanje od pozadine | P: 16 / 16; P: 32 / 32; P: 34 / 34; B: 70 / 71 | UNVERIFIED | NEEDS_DOP_REVIEW | Kontra nije obavezna; naturalisticki stil moze je izbeci. | Proveri preeksponirane ivice i konzistentnost izvora. |
| SET-007 | Razlicit kadar zahteva razlicitu proveru | L: 181 / 191; P: 35 / 35; P: 36 / 36 | UNVERIFIED | NEEDS_DOP_REVIEW | Kontinuitet je esteticka i urednicka odluka, ne samo jednaka luma. | Uporedi sve zadrzane kadrove iste scene. |
| MOV-001 | Osvetli putanju, ne jednu tacku | L: 87 / 97; L: 88 / 98; L: 95 / 105 | UNVERIFIED | NEEDS_DOP_REVIEW | Pozicija glumca iz YUV merenja sama po sebi je UNKNOWN. | Pregledaj prolaske kroz vrata i senke koje se ukrstaju. |
| MOV-002 | Ravnopravnost pokreta kamere i rasvete | L: 87 / 97; P: 119 / 119; B: 116 / 117 | UNVERIFIED | NEEDS_DOP_REVIEW | Ne pretpostavljaj kalibrisani tracking ili 3D geometriju iz prostih metrika piksela. | Pripremi plan po kamernim pozicijama i prolazima. |
| DAY-001 | Obilazak lokacije sa prozorima | L: 128 / 138; B: 113 / 114 | UNVERIFIED | NEEDS_DOP_REVIEW | Proracun sunca bez lokacije i vremena nije pouzdan. | Uporedi plan sa stvarnim stanjem lokacije pre snimanja. |
| DAY-002 | Kontrola jacine prozora | L: 131 / 141; B: 99 / 100 | UNVERIFIED | NEEDS_DOP_REVIEW | Ne postavljati ND vrednosti kao tacne bez poznatog filtera i merenja. | Meri razliku eksterijera i enterijera, proveri clipping i refleksije. |
| DAY-003 | Sunce kao motivisani rim ili kontra | L: 109 / 119; L: 111 / 121; B: 85 / 86 | UNVERIFIED | NEEDS_DOP_REVIEW | Vremenska prognoza, oblak i precizan azimut nisu potvrdeni iz same knjige. | Proveri pomeranje senki i konzistentnost izmedju kadrova. |
| NIGHT-001 | Nocni kadar ne mora biti necitljiv | L: 147 / 157; L: 149 / 159; B: 145 / 146 | UNVERIFIED | NEEDS_DOP_REVIEW | Izrazito tamna slika moze biti svesna odluka, ali ne treba automatski gubiti kljucnu radnju. | Uporedi postojanje detalja u tamnim oblastima na monitoru i waveform-u. |
| NIGHT-002 | Mesecina je filmska konvencija | L: 149 / 159; B: 323 / 324 | UNVERIFIED | NEEDS_DOP_REVIEW | Jedan univerzalan Kelvin ili gel za sve noci ne postoji. | Pitaj DoP koliko plavog tona zeli; proveri zadrzavanje tonova koze. |
| NIGHT-003 | Practical kao motivacija nocnog enterijera | L: 41 / 51; L: 152 / 162; B: 127 / 128; P: 98 / 98 | UNVERIFIED | NEEDS_DOP_REVIEW | Elektricna bezbednost practical-a zahteva proveru, ne samo vizuelnu procenu. | Proveri kontinuitet sa ukljucivanjem practical-a u kadru. |
| COL-001 | Kontrolisana hladno-topla podela | P: 27 / 27; P: 29 / 29; L: 168 / 178; B: 175 / 176 | UNVERIFIED | NEEDS_DOP_REVIEW | Mesanje boja je kreativna tehnika, ne greska koju uvek treba automatski neutralisati. | Proveri lice, garderobu i fotografsku konzistentnost izmedju kadrova. |
| COL-002 | Gel menja spektar i intenzitet | L: 9 / 19; B: 180 / 181; P: 30 / 30 | UNVERIFIED | NEEDS_DOP_REVIEW | Bez proizvođacke transmisije nemoj izmisljati lux ili stop gubitke. | Izmeri svetlo nakon postavljanja filtera. |
| COL-003 | White balance je kamera-plus-scena odluka | L: 12 / 22; L: 13 / 23; P: 45 / 45; B: 174 / 175 | UNVERIFIED | NEEDS_DOP_REVIEW | Postojeca 3B.2V YUV analiza NE meri fizicku temperaturu boje niti automatski zna WB. | Proveri kartu boja i WB metapodatke ako postoje. |
| COL-004 | Spektralni kvalitet razlicitih LED izvora | L: 11 / 21; B: 27 / 28; B: 28 / 29 | UNVERIFIED | NEEDS_DOP_REVIEW | Opste ocene LED tehnologije iz 2014/2019 nisu dovoljna specifikacija modernih modela. | Potvrdi na test-kadru sa kozom i kartom boja. |
| EXP-001 | Racunanje ekspozicije trazi merenje | L: 13 / 23; L: 14 / 24; B: 203 / 204; B: 215 / 216; P: 44 / 44 | UNVERIFIED | NEEDS_DOP_REVIEW | Brojevi ekspozicije bez kalibracije oznaci PROCENA, a ne MERENJE. | Proveri svetlomer i waveform uz korisnikov dozvoljeni profil kamere. |
| EXP-002 | Kontrolisi clipped highlights i senke | B: 211 / 212; B: 212 / 213; P: 25 / 25 | UNVERIFIED | NEEDS_DOP_REVIEW | Istorijske analogne TV norme i broj blendi iz starih materijala ne prepisuj kao univerzalna moderna HDR ogranicenja. | Proveri odgovarajuci waveform, false-color ili zebra prikaz iz konkretnog kamera profila. |
| EXP-003 | Waveform/false-color pre subjektivne procene monitora | B: 205 / 206; B: 210 / 211; P: 43 / 43 | UNVERIFIED | NEEDS_DOP_REVIEW | Ne tumaci nekalibrisanu luma statistiku kao IRE ili fizicku ekspoziciju. | Proveri signalni opseg, transfer funkciju i postavke monitora. |
| EQ-001 | Izbor izvora prema funkciji, ne nominalnim vatima | B: 27 / 28; B: 26 / 27; P: 65 / 65 | UNVERIFIED | NEEDS_DOP_REVIEW | Ne izjednacavaj osvetljenje dva uredjaja samo na osnovu potrosnje u W. | Otvrdi sa gafferom stvarni output i raspodelu snopa. |
| EQ-002 | Spot i flood menjaju pokrivenost | P: 66 / 66; B: 26 / 27; B: 45 / 46 | UNVERIFIED | NEEDS_DOP_REVIEW | Ne pretpostavljaj identicne karakteristike razlicitih Fresnel/PAR/LED modela. | Proveri pokrivenost zeljenog prostora u light plot-u. |
| EQ-003 | Poznata oprema pre nove kupovine ili rente | B: 115 / 116; L: 40 / 50 | UNVERIFIED | NEEDS_DOP_REVIEW | Ne tvrdi da korisnik poseduje fixture bez potvrdenog inventara. | Gaffer potvrđuje kompatibilnost, sigurnost i dostupnost. |
| EQ-004 | Grips, nosaci i kontrola svetla | B: 258 / 259; B: 269 / 270; P: 21 / 21 | UNVERIFIED | NEEDS_DOP_REVIEW | Nikad ne automatizuj odobrenje nosivosti, elektricnih prikljucaka ili rada na visini. | Rigging i teret pregledava osposobljen grip tim. |
| SAFE-001 | Elektricni plan pre fizicke realizacije | L: 23 / 33; P: 55 / 55; B: 235 / 236; B: 248 / 249 | UNVERIFIED | NEEDS_DOP_REVIEW | Istorijske vrednosti napona, provodnika i osiguraca iz knjiga nisu zamena za moderne lokalne normative. | Profesionalac proverava struju, zastitu, uzemljenje, konektore i lokalne propise. |
| SAFE-002 | HMI i mokra lokacija | B: 37 / 38; B: 249 / 250 | UNVERIFIED | NEEDS_DOP_REVIEW | AI ne sme menjati sigurnosna pravila niti izdavati uputstvo kao certifikovanu proveru. | Pitaj osposobljenu ekipu za konkretan procedurni i opremni check. |
| SAFE-003 | Flicker i usporeno snimanje | B: 302 / 303; B: 312 / 313; L: 31 / 41 | UNVERIFIED | NEEDS_DOP_REVIEW | Nemoj obecavati flicker-free samo zato sto je izvor LED ili HMI. | Proveri probnim snimanjem pre glavnog kadra. |
| OPS-001 | Izvidjanje i dogovor DoP, gaffer, rezija | L: 18 / 28; L: 40 / 50; B: 113 / 114; B: 280 / 281 | UNVERIFIED | NEEDS_DOP_REVIEW | AI je savetnik, ne zamenjuje kreativnu odgovornost ni bezbednosna ovlascenja ekipe. | Na kraju predlozi tehnicku realizaciju za potvrdu DoP/gaffer tima. |
| OPS-002 | Blocking/rehearsal pre zavrsnog plana | B: 116 / 117; B: 294 / 295; L: 87 / 97 | UNVERIFIED | NEEDS_DOP_REVIEW | Nepostojanje podataka o blokingu oznaci kao neizvesnost. | Proveri wide, medium i close-up postavke. |
| OPS-003 | Rezija fotografije ima poslednju rec | L: 18 / 28; B: 112 / 113; P: 97 / 97 | UNVERIFIED | NEEDS_DOP_REVIEW | Ne mesati AI preferenciju, autorovu napomenu i fizicki meren rezultat. | Potvrdi da svaki prikaz i light plot koriste istu konkretnu verziju plana. |
| TV-001 | Tri kamere zahtevaju zajednicku rasvetu | P: 35 / 35; P: 36 / 36; P: 37 / 37 | UNVERIFIED | NEEDS_DOP_REVIEW | Kompromis u odnosu na pojedinacni filmski kadar je cesto neizbezan. | Uporedi ekspozicioni izgled svake kamere i ujednacenost montaze. |
| TV-002 | Ukrsena OSP za vise glumaca | P: 38 / 38; P: 105 / 105; P: 106 / 106 | UNVERIFIED | NEEDS_DOP_REVIEW | Ne kopirati bez prilagodjavanja ukupnom blokingu i scenografiji. | Uporedi smer senki i prikaz obe strane razgovora. |
| TV-003 | TV intervju i portret su poseban zanr | P: 113 / 113; P: 114 / 114; P: 117 / 117; P: 118 / 118 | UNVERIFIED | NEEDS_DOP_REVIEW | Naturalizam igranog filma i cisti studijski portret nisu identicne estetske mete. | Proveri kameru levo, desno, centralno, odsjaje i podbradne senke. |
| TV-004 | Glazbeni program koristi vremenski dizajn | P: 127 / 127; P: 133 / 133; P: 142 / 142; P: 143 / 143 | UNVERIFIED | NEEDS_DOP_REVIEW | Cue predlog nije isto sto i fizicki DMX nalog; kontrola reflektora posebno se odobrava. | Proveri sinhronizaciju sa dramaturgijom muzike i kapacitet dostupnih izvora. |
| FX-001 | Kisa i magla zahtevaju pozadinsku kontrolu | B: 320 / 321; L: 198 / 208 | UNVERIFIED | NEEDS_DOP_REVIEW | Uslovi efekta i vremenske prilike mogu znatno promeniti rezultat. | Proveri efekat na realnom test-snimku i mokre bezbednosne zone. |
| FX-002 | Vatra kao promenljivi praktikal | L: 198 / 208; B: 321 / 322 | UNVERIFIED | NEEDS_DOP_REVIEW | Svaki pravi otvoreni plamen podleze bezbednosnom planu tima; AI ne upravlja vatrom. | Gledaj da se promene cuvaju kroz ceo kadar. |
| FX-003 | Green screen odvojena kontrola | B: 300 / 301; B: 301 / 302 | UNVERIFIED | NEEDS_DOP_REVIEW | Odgovarajuce parametre diktira postprodukcioni proces, ne jedan fiksni prag iz knjige. | Proveri spill, refleksije i signal za konkretan kolor workflow. |
| META-001 | Istorijske tehnicke vrednosti nisu moderni standardi | P: 25 / 25; P: 41 / 41; B: 207 / 208 | UNVERIFIED | NEEDS_DOP_REVIEW | Informacija o istorijskom TV signalu nije dokaz o danasnjoj HDR kameri. | Za modernu kameru koristi njene specifikacije i kalibraciju, ne staru 5-stop TV normu. |
| META-002 | Nema laznog zakljucka iz piksela | B: 203 / 204; P: 47 / 47; P: 49 / 49 | UNVERIFIED | NEEDS_DOP_REVIEW | Ovaj metodoloski zapis je odluka arhitekture LightingAI-ja, ne citat ili direktno pravilo iz knjiga. | Obavezno prikazi UNKNOWN za nepoznate fizicke podatke. |
