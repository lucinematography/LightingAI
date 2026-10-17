package com.lightingai.app;

import android.app.Activity;
import android.content.ClipData;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.pdf.PdfDocument;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONObject;

public final class AIVisualImageBridge {
    private static final int MAX_IMAGE_BYTES = 20 * 1024 * 1024;
    private final Activity activity;

    AIVisualImageBridge(Activity activity) {
        this.activity = activity;
    }

    @JavascriptInterface public void saveImage(String filename, String dataUrl) {
        new Thread(() -> {
            try {
                ImageData image = decode(dataUrl);
                String safeName = safeFilename(filename, image.extension);
                saveToPictures(safeName, image);
                notifyResult("save", true);
            } catch (Exception error) {
                notifyResult("save", false);
            }
        }, "LightingAI-image-save").start();
    }

    @JavascriptInterface public void shareImage(String filename, String dataUrl, String chooserTitle) {
        new Thread(() -> {
            try {
                ImageData image = decode(dataUrl);
                String safeName = safeFilename(filename, image.extension);
                File directory = AIVisualImageProvider.shareDirectory(activity);
                if (!directory.exists() && !directory.mkdirs()) throw new IllegalStateException("Share directory unavailable");
                File output = new File(directory, safeName);
                try (OutputStream stream = new FileOutputStream(output, false)) { stream.write(image.bytes); }
                Uri uri = Uri.parse("content://" + activity.getPackageName() + ".ai.preview/" + Uri.encode(safeName));
                activity.runOnUiThread(() -> {
                    try {
                        Intent share = new Intent(Intent.ACTION_SEND);
                        share.setType(image.mimeType);
                        share.putExtra(Intent.EXTRA_STREAM, uri);
                        share.setClipData(ClipData.newRawUri("LightingAI image", uri));
                        share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        activity.startActivity(Intent.createChooser(share, chooserTitle));
                        notifyResult("share", true);
                    } catch (Exception error) {
                        notifyResult("share", false);
                    }
                });
            } catch (Exception error) {
                notifyResult("share", false);
            }
        }, "LightingAI-image-share").start();
    }

    @JavascriptInterface public void savePlanPdf(String filename, String payloadJson) {
        new Thread(() -> {
            String safeName = safePdfFilename(filename);
            try {
                byte[] pdfBytes = renderPlanPdf(payloadJson);
                savePdfToDownloads(safeName, pdfBytes);
                notifyPdfResult(true, safeName, payloadJson);
            } catch (Exception error) {
                notifyPdfResult(false, safeName, payloadJson);
            }
        }, "LightingAI-pdf-save").start();
    }

    @JavascriptInterface public void sharePlanPdf(String filename, String payloadJson, String chooserTitle) {
        new Thread(() -> {
            String safeName = safePdfFilename(filename);
            try {
                byte[] pdfBytes = renderPlanPdf(payloadJson);
                File directory = AIVisualImageProvider.shareDirectory(activity);
                if (!directory.exists() && !directory.mkdirs()) throw new IllegalStateException("Share directory unavailable");
                File output = new File(directory, safeName);
                try (OutputStream stream = new FileOutputStream(output, false)) { stream.write(pdfBytes); }
                Uri uri = Uri.parse("content://" + activity.getPackageName() + ".ai.preview/" + Uri.encode(safeName));
                activity.runOnUiThread(() -> {
                    try {
                        Intent share = new Intent(Intent.ACTION_SEND);
                        share.setType("application/pdf");
                        share.putExtra(Intent.EXTRA_STREAM, uri);
                        share.setClipData(ClipData.newRawUri("LightingAI PDF", uri));
                        share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        activity.startActivity(Intent.createChooser(share, chooserTitle));
                        notifyPdfResult(true, safeName, payloadJson);
                    } catch (Exception error) {
                        notifyPdfResult(false, safeName, payloadJson);
                    }
                });
            } catch (Exception error) {
                notifyPdfResult(false, safeName, payloadJson);
            }
        }, "LightingAI-pdf-share").start();
    }

    private String safePdfFilename(String requested) {
        String base = requested == null ? "LightingAI_AI_Plan" : requested.replaceAll("[^A-Za-z0-9._-]", "_");
        if (base.length() > 90) base = base.substring(0, 90);
        base = base.replaceFirst("(?i)\\.pdf$", "");
        if (base.isEmpty()) base = "LightingAI_AI_Plan";
        return base + ".pdf";
    }

    private void savePdfToDownloads(String filename, byte[] bytes) throws Exception {
        if (bytes == null || bytes.length == 0) throw new IllegalArgumentException("Empty PDF");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
            values.put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf");
            values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
            values.put(MediaStore.MediaColumns.IS_PENDING, 1);
            Uri uri = activity.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (uri == null) throw new IllegalStateException("Downloads unavailable");
            try {
                try (OutputStream stream = activity.getContentResolver().openOutputStream(uri, "w")) {
                    if (stream == null) throw new IllegalStateException("PDF output unavailable");
                    stream.write(bytes);
                }
                ContentValues ready = new ContentValues();
                ready.put(MediaStore.MediaColumns.IS_PENDING, 0);
                activity.getContentResolver().update(uri, ready, null, null);
            } catch (Exception error) {
                activity.getContentResolver().delete(uri, null, null);
                throw error;
            }
            return;
        }
        File downloads = activity.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        if (downloads == null) throw new IllegalStateException("Downloads unavailable");
        File output = new File(downloads, filename);
        try (OutputStream stream = new FileOutputStream(output, false)) { stream.write(bytes); }
        MediaScannerConnection.scanFile(activity, new String[]{output.getAbsolutePath()}, new String[]{"application/pdf"}, null);
    }

    private byte[] renderPlanPdf(String payloadJson) throws Exception {
        JSONObject payload = new JSONObject(payloadJson == null ? "{}" : payloadJson);
        return new PlanPdfRenderer(payload).render();
    }

    private void notifyPdfResult(boolean ok, String filename, String payloadJson) {
        String savedMessage = "LightingAI: PDF je sačuvan u Preuzimanja";
        try {
            JSONObject payload = new JSONObject(payloadJson == null ? "{}" : payloadJson);
            if ("en".equals(payload.optString("language", "sr"))) {
                savedMessage = "LightingAI: PDF saved to Downloads";
            }
        } catch (Exception ignored) {}
        final String toastMessage = savedMessage;
        activity.runOnUiThread(() -> {
            if (ok) Toast.makeText(activity, toastMessage, Toast.LENGTH_LONG).show();
            if (activity instanceof MainActivity) {
                ((MainActivity) activity).notifyAIVisualPdfResult(JSONObject.quote(filename), ok);
            }
        });
    }

    private static final class PlanPdfRenderer {
        private static final int PAGE_W = 595;
        private static final int PAGE_H = 842;
        private static final float MARGIN = 38f;
        private static final float CONTENT_W = PAGE_W - MARGIN * 2f;
        private static final int ACCENT = Color.rgb(190, 148, 28);
        private static final int INK = Color.rgb(29, 31, 35);
        private static final int MUTED = Color.rgb(100, 105, 113);
        private static final int PANEL = Color.rgb(244, 245, 247);

        private final JSONObject payload;
        private final boolean sr;
        private final PdfDocument document = new PdfDocument();
        private PdfDocument.Page page;
        private Canvas canvas;
        private float y;
        private int pageNumber = 0;

        PlanPdfRenderer(JSONObject payload) {
            this.payload = payload;
            this.sr = !"en".equals(payload.optString("language", "sr"));
        }

        byte[] render() throws Exception {
            try {
                newPage();
                title(sr ? "AI PREDLOG POSTAVKE RASVETE" : "AI LIGHTING SETUP PROPOSAL");
                small(sr ? "Profesionalni LightingAI izvoz" : "Professional LightingAI export", MUTED);
                gap(8);

                section(sr ? "POREKLO I STATUS PODATAKA" : "DATA ORIGIN AND STATUS");
                paragraph(sr
                    ? "Opis scene, zahtev i izbor opreme potiču iz aplikacije. AI plan je predlog za pregled direktora fotografije i gaffera. Izvoz ne beleži njihovo odobrenje."
                    : "Scene description, brief and equipment selection come from the app. The AI plan is a proposal for review by the director of photography and gaffer. This export does not record their approval.", 10f, false);
                paragraph(sr
                    ? "Podešavanja kalkulatora nisu merenja na setu. Proračuni su označeni posebno. Nedostajući podaci ostaju nepoznati."
                    : "Calculator settings are not on-set measurements. Calculations are identified separately. Missing data remains unknown.", 10f, false);

                section(sr ? "ZAHTEV DP-a" : "DP REQUEST");
                paragraph(payload.optString("dpRequest", ""), 11f, false);
                section(sr ? "CILJ / OPIS SCENE" : "SCENE GOAL / DESCRIPTION");
                paragraph(payload.optString("description", ""), 11f, false);
                String measurements = payload.optString("measurements", "");
                if (!measurements.isEmpty()) {
                    section(sr ? "PODACI IZ PLANERA" : "PLANNER DATA");
                    paragraph(measurements, 10.5f, false);
                }

                JSONArray equipment = payload.optJSONArray("equipment");
                section(sr ? "IZABRANA RASVETA" : "SELECTED LIGHTING");
                if (equipment == null || equipment.length() == 0) {
                    paragraph(sr ? "Nema izabrane opreme." : "No selected equipment.", 10.5f, false);
                } else {
                    for (int i = 0; i < equipment.length(); i++) {
                        JSONObject item = equipment.optJSONObject(i);
                        if (item == null) continue;
                        String line = "- " + item.optString("name", item.optString("id", "Fixture")) +
                            " x" + Math.max(1, item.optInt("qty", 1));
                        if (item.has("powerDrawW")) line += " | " + item.optInt("powerDrawW", 0) + " W";
                        JSONObject cct = item.optJSONObject("cctK");
                        if (cct != null) line += " | CCT " + cct.optInt("min", 0) + "-" + cct.optInt("max", 0) + " K";
                        paragraph(line, 10f, false);
                    }
                }

                drawImage(payload.optString("scenePhoto", ""), sr ? "ORIGINALNA FOTOGRAFIJA SCENE" : "ORIGINAL SCENE PHOTO");
                drawImage(payload.optString("aiPreview", ""), sr ? "AI FOTO-PREVIEW" : "AI PHOTO PREVIEW");

                drawPlannerSetSketch(payload.optJSONObject("setSketch"), payload.optJSONObject("technical"));

                JSONObject planJson = payload.optJSONObject("plan");
                if (planJson == null) planJson = new JSONObject();

                newPage();
                title(sr ? "MAPA POSTAVKE" : "SETUP MAP");
                drawSetupMap(planJson);

                newPage();
                title(sr ? "AI PREDLOG RASVETE" : "AI LIGHTING PROPOSAL");
                small(sr ? "Status: predlog; potvrda DoP-a i gaffera nije zabeležena." : "Status: proposal; DoP and gaffer approval is not recorded.", MUTED);
                gap(8);
                planSection(planJson, "summary", sr ? "SAŽETAK" : "SUMMARY");
                planSection(planJson, "key", sr ? "GLAVNO SVETLO / KEY" : "KEY LIGHT");
                planSection(planJson, "fill", sr ? "FILL SVETLO" : "FILL LIGHT");
                planSection(planJson, "backlight", sr ? "KONTRA / POZADINSKO" : "BACKLIGHT");
                planSection(planJson, "negative_fill", sr ? "NEGATIVNI FILL" : "NEGATIVE FILL");
                planSection(planJson, "camera_notes", sr ? "KAMERA" : "CAMERA");
                planSection(planJson, "color_notes", sr ? "BOJA / CCT / GEL" : "COLOR / CCT / GEL");
                planSection(planJson, "sun_notes", sr ? "SUNCE / PRIRODNO SVETLO" : "SUN / NATURAL LIGHT");
                planSection(planJson, "dmx_notes", sr ? "DMX / KONTROLA" : "DMX / CONTROL");
                planSection(planJson, "safety_notes", sr ? "BEZBEDNOST" : "SAFETY");

                JSONArray planEquipment = planJson.optJSONArray("equipment_list");
                if (planEquipment != null && planEquipment.length() > 0) {
                    section(sr ? "OPREMA U AI PLANU" : "EQUIPMENT IN AI PLAN");
                    for (int i = 0; i < planEquipment.length(); i++) {
                        Object value = planEquipment.opt(i);
                        paragraph("- " + String.valueOf(value), 10f, false);
                    }
                }

                drawCameraReport(payload.optJSONObject("technical"));
                drawGafferReport(planJson);
                drawTechnical(payload.optJSONObject("technical"));
                drawKnowledgeReference(planJson);

                finishPage();
                ByteArrayOutputStream output = new ByteArrayOutputStream();
                document.writeTo(output);
                return output.toByteArray();
            } finally {
                try { document.close(); } catch (Exception ignored) {}
            }
        }

        // Scoped local review dated 2026-10-16: Landau PDF 18 / printed 8.
        // Original paraphrase and bibliography only; no PDF data or AI-supplied citations.
        // This general reference does not establish applicability or approve the scene plan.
        private boolean hasScopedKnowledgeReference(JSONObject basis) {
            if (basis == null || !"lightingai-professional-pdf-knowledge/1".equals(basis.optString("schema")) ||
                !"SERVER_K0_K1_BRIDGE".equals(basis.optString("producer")) ||
                !"53f3b96d0f7e231a2c5a6a1c7c2e7e4b3b31a7baa4a8232b5d2ddf9e9319ad02".equals(basis.optString("knowledgeHash"))) return false;
            boolean used = false;
            JSONArray usedIds = basis.optJSONArray("usedCardIds");
            JSONArray cards = basis.optJSONArray("cards");
            boolean supplied = false;
            if (usedIds != null) for (int i = 0; i < usedIds.length(); i++) if ("PHY-007".equals(usedIds.optString(i))) used = true;
            if (cards != null) for (int i = 0; i < cards.length(); i++) {
                JSONObject card = cards.optJSONObject(i);
                if (card != null && "PHY-007".equals(card.optString("id")) && "UNVERIFIED".equals(card.optString("sourceStatus"))) supplied = true;
            }
            if (!used || !supplied) return false;
            JSONArray refs = basis.optJSONArray("reviewedReferences");
            if (refs != null) for (int i = 0; i < refs.length(); i++) {
                JSONObject r = refs.optJSONObject(i);
                if (r != null && "PHY007-LANDAU-20261016".equals(r.optString("reviewId")) &&
                    "PHY-007".equals(r.optString("cardId")) && "landau-2014".equals(r.optString("sourceId")) &&
                    "SCOPED_LOCAL_PAGE_REVIEW".equals(r.optString("status")) &&
                    "REDUCING_UNWANTED_BOUNCE_ONLY".equals(r.optString("scope")) &&
                    "2014 electronic edition".equals(r.optString("edition")) && r.optInt("year") == 2014 &&
                    r.optInt("pdfPage") == 18 && r.optInt("printedPage") == 8 &&
                    "7b5005a63525dc17dba2886849661738a7a7d392e222203cf3a8caeb0d554d52".equals(r.optString("sourceSha256")) &&
                    r.has("wholeCardVerified") && !r.optBoolean("wholeCardVerified", true) &&
                    "NOT_VERIFIED".equals(r.optString("sceneApplicability")) && "NOT_RECORDED".equals(r.optString("dopApproval"))) return true;
            }
            return false;
        }

        private void drawKnowledgeReference(JSONObject plan) {
            JSONObject basis = plan.optJSONObject("knowledgeBasis");
            if (basis == null) { drawReviewedPrincipleReference(); return; }
            newPage();
            title(sr ? "STRUČNO ZNANJE / K0-K1" : "PROFESSIONAL KNOWLEDGE / K0-K1");
            paragraph(sr ? "Savetodavne kartice iz postojeće baze. Pronalaženje kartice nije potvrda njene primenljivosti na scenu. K1 status izvora ostaje UNVERIFIED; odobrenje DoP-a nije zabeleženo."
                : "Advisory cards from the existing corpus. Retrieval does not confirm scene applicability. K1 source status remains UNVERIFIED; DoP approval is not recorded.", 10f, false);
            section(sr ? "KARTICE U AI ZAHTEVU" : "CARDS IN THE AI REQUEST");
            JSONArray cards = basis.optJSONArray("cards");
            if (cards == null || cards.length() == 0) paragraph(sr ? "Nema relevantnih kartica u ovom kontekstu. Predlog zahteva stručnu procenu."
                : "No relevant cards in this context. The proposal requires professional review.", 10f, false);
            if (cards != null) for (int i = 0; i < Math.min(4, cards.length()); i++) {
                JSONObject c = cards.optJSONObject(i);
                if (c != null) paragraph(c.optString("id", "UNKNOWN") + " | UNVERIFIED | " + (sr ? "primenljivost nije potvrđena" : "applicability unconfirmed"), 10f, false);
            }
            paragraph((sr ? "AI je označio korišćenje: " : "AI reported using: ") + recordedList(basis, "usedCardIds") +
                (sr ? ". To nije stručna potvrda." : ". This is not professional approval."), 10f, false);
            section(sr ? "PROVERA IZVORA / OGRANIČEN OBUHVAT" : "SOURCE REVIEW / LIMITED SCOPE");
            if (hasScopedKnowledgeReference(basis)) {
                paragraph(sr ? "PHY-007 / landau-2014: zasebna lokalna provera uskog principa, ne cele kartice. Crna tkanina ili zastava mogu smanjiti neželjeno odbijeno svetlo."
                    : "PHY-007 / landau-2014: separate local review of a narrow principle, not the entire card. Black cloth or a flag can reduce unwanted bounced light.", 10f, false);
                paragraph("David Landau, Lighting for Cinematography, " + (sr ? "elektronsko izdanje 2014, Bloomsbury Academic. PDF strana 18 / štampana strana 8."
                    : "2014 electronic edition, Bloomsbury Academic. PDF page 18 / printed page 8."), 10f, false);
                paragraph(sr ? "Provera: 16.10.2026; naslov i izdanje: PDF 3 i 6. Primenljivost na scenu, ekspozicija i kontrast nisu potvrđeni. Ostale reference nisu unapređene u proverene."
                    : "Review: 2026-10-16; title and edition: PDF 3 and 6. Scene applicability, exposure and contrast are unconfirmed. Other references have not been promoted to reviewed status.", 10f, false);
            } else paragraph(sr ? "Za kartice koje je AI označio nema odgovarajuće zasebno proverene reference. Bibliografija se ne preuzima iz AI teksta."
                : "No matching separately reviewed reference for the cards reported used. Bibliography is not taken from AI text.", 10f, false);
            section(sr ? "PROCENE I BEZBEDNOST" : "ESTIMATES AND SAFETY");
            paragraph(sr ? "Visina, CCT, dimmer, intenzitet i geometrija iz AI plana su nepotvrđene procene, ne merenja. Nepoznate vrednosti ostaju nepoznate. Proveriti fotometriju, ekspoziciju, montažu, napajanje i rad iz svih uglova kamere na setu."
                : "Height, CCT, dimmer, intensity and geometry in the AI plan are unverified estimates, not measurements. Unknown values remain unknown. Verify photometry, exposure, rigging, power and all camera angles on set.", 10f, false);
            paragraph(sr ? "Stručni princip ne odobrava dodatnu opremu, prekoračenje količine ili bezbednost montaže. K0/K1 i knjige nisu menjani; stranice knjiga i doslovni citati nisu uključeni."
                : "A literature principle does not authorize extra equipment, excess quantities or rigging safety. K0/K1 and books are unchanged; book pages and verbatim quotations are not included.", 10f, false);
        }

        private void drawReviewedPrincipleReference() {
            newPage();
            title(sr ? "STRUČNI IZVOR / NEGATIVNI FILL" : "SOURCE / NEGATIVE FILL");
            paragraph(sr
                ? "Opšta stručna referenca. Primenljivost na ovu scenu nije proverena; ona ne potvrđuje AI predlog, merenja ili odobrenje postavke."
                : "General professional reference. Applicability to this scene has not been verified; it does not confirm the AI proposal, measurements or setup approval.", 10f, false);

            section(sr ? "PROVEREN STRUČNI PRINCIP" : "REVIEWED PRINCIPLE");
            paragraph(sr
                ? "Crna tkanina ili crna zastava mogu smanjiti neželjeno odbijeno svetlo. Ovo je kratka parafraza principa, bez određivanja ekspozicije ili odnosa kontrasta."
                : "Black cloth or a black flag can reduce unwanted bounced light. This is a brief paraphrase of the principle, without specifying exposure or contrast ratio.", 10.5f, false);
            paragraph("David Landau, Lighting for Cinematography, " + (sr
                ? "elektronsko izdanje 2014, Bloomsbury. PDF strana 18 / štampana strana 8."
                : "2014 electronic edition, Bloomsbury. PDF page 18 / printed page 8."), 10.5f, false);
            paragraph(sr
                ? "Obuhvat lokalne provere: samo navedena strana i ovaj uski princip. Naslov i izdanje provereni na PDF stranama 3 i 6. Datum provere: 16.10.2026."
                : "Local review scope: only the cited page and this narrow principle. Title and edition checked on PDF pages 3 and 6. Review date: 2026-10-16.", 10f, false);

            section(sr ? "PREDLOG ZA PROCENU DoP-a I GAFFERA" : "PROPOSAL FOR DoP AND GAFFER REVIEW");
            paragraph(sr
                ? "Ako senovita strana subjekta prima previše odbijenog svetla, razmotriti crnu površinu. Na probi uporediti izgled pre i posle postavljanja. Ovo je predlog za procenu; proba nije potvrđena ovim izvozom."
                : "If the subject's shadow side receives too much bounced light, consider a black surface. Compare the look before and after placement during a test. This is a proposal for review; this export does not confirm a completed test.", 10.5f, false);
            paragraph(sr
                ? "DoP procenjuje željeni izgled senke. Gaffer i grip ekipa proveravaju mogućnost i odgovornosti za montažu. Navedena strana knjige nije odobrenje konkretne postavke."
                : "The DoP assesses the intended shadow look. The gaffer and grip team assess mounting feasibility and responsibilities. The cited book page does not approve a specific setup.", 10f, false);

            section(sr ? "NEPOTVRĐENI PODACI" : "UNCONFIRMED DATA");
            paragraph(sr
                ? "Tačan položaj i veličina crne površine: nisu potvrđeni ovim izvozom. Lux, promena ekspozicije i odnos kontrasta: nisu potvrđeni merenjem u ovom izveštaju. Odobrenje DoP-a i montaže: nije zabeleženo ovim izvozom."
                : "Exact placement and size of the black surface: not confirmed by this export. Lux, exposure change and contrast ratio: not confirmed by measurements in this report. DoP and mounting approval: not recorded by this export.", 10f, false);

            section(sr ? "GRANICE PROVERE IZVORA" : "SOURCE REVIEW LIMITS");
            paragraph(sr
                ? "Ovo nije potvrda cele kartice PHY-007, ostalih referenci ili svih knjiga. K0/K1 nisu menjani. Izvoz sadrži bibliografske podatke i kratku originalnu parafrazu, bez stranica knjiga, ilustracija i doslovnih citata."
                : "This does not verify the entire PHY-007 card, other references or all books. K0/K1 are unchanged. The export contains bibliographic data and a brief original paraphrase, without book pages, figures or verbatim quotations.", 10f, false);
        }

        private String recordedText(JSONObject object, String key) {
            String unknown = sr ? "nije uneto" : "not entered";
            if (object == null || object.isNull(key)) return unknown;
            String value = object.optString(key, "").trim();
            return value.isEmpty() ? unknown : value;
        }

        private String recordedList(JSONObject object, String key) {
            JSONArray values = object == null ? null : object.optJSONArray(key);
            if (values == null || values.length() == 0) return sr ? "nije uneto" : "not entered";
            List<String> labels = new ArrayList<>();
            for (int i = 0; i < values.length(); i++) {
                String value = values.optString(i, "").trim();
                if (!value.isEmpty()) labels.add(value);
            }
            return labels.isEmpty() ? (sr ? "nije uneto" : "not entered") : join(labels, ", ");
        }

        private void drawCameraReport(JSONObject technical) {
            JSONObject camera = technical == null ? null : technical.optJSONObject("camera");
            JSONObject exposure = camera == null ? null : camera.optJSONObject("exposureSettings");
            newPage();
            title(sr ? "KAMERA / ZA DoP-a" : "CAMERA / FOR THE DoP");
            paragraph(sr ? "Izvor: podešavanja aplikacije i aktivna skica seta. Ovo nije očitavanje sa kamere niti potvrda DoP-a."
                : "Source: app settings and active set sketch. This is not a camera readout or DoP approval.", 10f, false);
            section(sr ? "PODEŠAVANJA APLIKACIJE" : "APP SETTINGS");
            paragraph((sr ? "Model kamere: " : "Camera model: ") + recordedText(camera, "model"), 10.5f, false);
            paragraph("ISO: " + technicalNumber(exposure, "iso", "", false) + " | fps: " + technicalNumber(exposure, "fps", "", false) +
                (sr ? " | ugao zatvarača: " : " | shutter angle: ") + technicalNumber(exposure, "shutterAngleDeg", "deg", false), 10f, false);
            paragraph((sr ? "Ciljna blenda (f): " : "Target aperture (f): ") + technicalNumber(exposure, "targetAperture", "", false) +
                " | ND: " + technicalNumber(exposure, "ndStops", "stop", true), 10f, false);
            paragraph((sr ? "Ručno uneti lux: " : "Manually entered lux: ") + technicalNumber(exposure, "manualLux", "lux", true) +
                (sr ? ". Status: unos u kalkulator; merenje i instrument nisu potvrđeni." : ". Status: calculator input; measurement and instrument are not verified."), 9.5f, false);
            paragraph(sr ? "Ova podešavanja nisu automatski vezana za svaku kameru u skici."
                : "These settings are not automatically assigned to each camera in the sketch.", 9.5f, false);
            section(sr ? "KAMERE U AKTIVNOJ SKICI SETA" : "CAMERAS IN THE ACTIVE SET SKETCH");
            paragraph((sr ? "Scena: " : "Scene: ") + recordedText(camera, "sceneName"), 10f, false);
            JSONArray cameras = camera == null ? null : camera.optJSONArray("cameras");
            if (cameras == null || cameras.length() == 0) {
                paragraph(sr ? "Nema zabeleženih kamera u aktivnoj skici." : "No cameras recorded in the active sketch.", 10f, false);
                return;
            }
            for (int i = 0; i < cameras.length(); i++) {
                JSONObject item = cameras.optJSONObject(i);
                if (item == null) continue;
                ensure(110f);
                paragraph((i + 1) + ". " + recordedText(item, "label") + " | ID: " + recordedText(item, "id"), 10.5f, true);
                paragraph("x: " + technicalNumber(item, "xM", "m", true) + " | y: " + technicalNumber(item, "yM", "m", true) +
                    (sr ? " | smer: " : " | heading: ") + technicalNumber(item, "directionDeg", "deg", true), 10f, false);
                paragraph((sr ? "Objektiv: " : "Lens: ") + technicalNumber(item, "focalLengthMm", "mm", false) +
                    (sr ? " | širina senzora: " : " | sensor width: ") + technicalNumber(item, "sensorWidthMm", "mm", false), 10f, false);
            }
        }

        private void drawGafferReport(JSONObject plan) {
            newPage();
            title(sr ? "RADNA LISTA / GAFFER" : "WORKING LIST / GAFFER");
            paragraph(sr ? "Izvor: svetla u AI predlogu i pripadajućoj mapi. Jedna stavka odgovara jednoj oznaci svetla. Postavka nije potvrđena na setu."
                : "Source: lights in the AI proposal and its map. One entry represents one light ID. The setup is not confirmed on set.", 10f, false);
            paragraph(sr ? "Izabrana oprema i količine navedeni su na početku izveštaja. Napajanje i lokalni DMX patch su u tehničkom delu."
                : "Selected equipment and quantities are listed at the start. Power and the local DMX patch are in the technical section.", 9.5f, false);
            paragraph(sr ? "Sve AI vrednosti visine, CCT-a, dimmera i intenziteta su procene, ne merenja na setu. Položaj u mapi je shematski."
                : "All AI height, CCT, dimmer and intensity values are estimates, not on-set measurements. Map placement is schematic.", 10f, false);
            JSONObject diagram = plan == null ? null : plan.optJSONObject("lighting_diagram");
            JSONArray lights = diagram == null ? null : diagram.optJSONArray("lights");
            if (lights == null || lights.length() == 0) {
                paragraph(sr ? "Nema pojedinačno zabeleženih svetala u mapi. Radna lista nije izvedena iz slobodnog teksta."
                    : "No individual lights are recorded in the map. The working list was not inferred from free text.", 10f, false);
                return;
            }
            for (int i = 0; i < lights.length(); i++) {
                JSONObject light = lights.optJSONObject(i);
                if (light == null) continue;
                if (y + 175f > PAGE_H - 42f) {
                    newPage();
                    title(sr ? "RADNA LISTA / NASTAVAK" : "WORKING LIST / CONTINUED");
                }
                section((sr ? "SVETLO " : "LIGHT ") + (i + 1));
                paragraph("ID: " + recordedText(light, "id") + " | " + recordedText(light, "fixture"), 10.5f, true);
                paragraph((sr ? "Uloga: " : "Role: ") + recordedText(light, "role") + (sr ? " | ciljevi: " : " | targets: ") + recordedList(light, "targets"), 10f, false);
                paragraph((sr ? "Dodaci: " : "Accessories: ") + recordedList(light, "accessories"), 10f, false);
                paragraph((sr ? "Smer: " : "Direction: ") + recordedText(light, "direction"), 10f, false);
                paragraph((sr ? "Visina: " : "Height: ") + technicalNumber(light, "heightM", "m", false) +
                    " | dimmer: " + technicalNumber(light, "dimmerPercent", "%", true) +
                    " | CCT: " + technicalNumber(light, "cctK", "K", false), 10f, false);
                paragraph((sr ? "Intenzitet (AI procena): " : "Intensity (AI estimate): ") + technicalNumber(light, "intensityPct", "%", true), 10f, false);
                paragraph((sr ? "Napomena: " : "Note: ") + recordedText(light, "notes"), 9.5f, false);
            }
        }

        private void drawTechnical(JSONObject technical) {
            if (technical == null) technical = new JSONObject();
            newPage();
            title(sr ? "TEHNIČKI PODACI SCENE" : "SCENE TECHNICAL DATA");
            small(sr ? "Za direktora fotografije i gaffera" : "For the director of photography and gaffer", MUTED);
            gap(8);

            JSONObject power = technical.optJSONObject("power");
            section(sr ? "NAPAJANJE / ZA GAFFERA" : "POWER / FOR THE GAFFER");
            paragraph(sr ? "Status: podešavanja kalkulatora; nije merenje niti potvrda napajanja na setu."
                : "Status: calculator settings; not an on-set measurement or power verification.", 9.5f, false);
            paragraph((sr ? "Napon: " : "Voltage: ") + technicalNumber(power, "voltage", "V", false) + " | " +
                (sr ? "grana: " : "branch: ") + technicalNumber(power, "branch", "A", false) + " | " +
                (sr ? "baterija: " : "battery: ") + technicalNumber(power, "batteryWh", "Wh", true), 10f, false);

            JSONObject cct = technical.optJSONObject("cctGel");
            if (cct != null && cct.length() > 0) {
                section(sr ? "CCT / GEL" : "CCT / GEL");
                paragraph(sr ? "Za DoP-a: podešavanja kalkulatora; nisu merenje kolorimetrom."
                    : "For the DoP: calculator settings; not a color-meter measurement.", 9.5f, false);
                paragraph((sr ? "Izvor: " : "Source: ") + cct.optString("source", "-") + " K | " +
                    (sr ? "cilj: " : "target: ") + cct.optString("target", "-") + " K | " +
                    (sr ? "tint: " : "tint: ") + cct.optString("tintMode", "-") + " / " + cct.optString("tintStrength", "-"), 10f, false);
            }

            JSONObject sun = technical.optJSONObject("sun");
            if (sun != null && sun.length() > 0) {
                section(sr ? "SUNCE / LOKACIJA" : "SUN / LOCATION");
                paragraph(sr ? "Status: proračun za prikazani datum, vreme i lokaciju; nije merenje na setu."
                    : "Status: calculation for the displayed date, time and location; not an on-set measurement.", 9.5f, false);
                String line = (sr ? "Datum: " : "Date: ") + sun.optString("date", "-") + " " + sun.optString("time", "") +
                    " | lat " + sun.optString("lat", "-") + " | lon " + sun.optString("lon", "-") +
                    " | az " + (sun.has("azimuthDeg") ? String.format(Locale.US, "%.1f", sun.optDouble("azimuthDeg")) + "°" : "-") +
                    " | el " + (sun.has("elevationDeg") ? String.format(Locale.US, "%.1f", sun.optDouble("elevationDeg")) + "°" : "-");
                paragraph(line, 10f, false);
                if (sun.has("shadowAzimuthDeg")) {
                    paragraph((sr ? "Senka: " : "Shadow: ") + String.format(Locale.US, "%.1f°", sun.optDouble("shadowAzimuthDeg")) +
                        (sun.isNull("shadowLengthRatio") ? "" : " | " + String.format(Locale.US, "%.2fx", sun.optDouble("shadowLengthRatio"))), 10f, false);
                }
                String windows = (sr ? "Izlazak/Zalazak: " : "Sunrise/Sunset: ") + sun.optString("sunrise", "-") + " / " + sun.optString("sunset", "-") +
                    " | Golden: " + sun.optString("goldenMorning", "-") + " / " + sun.optString("goldenEvening", "-") +
                    " | Blue: " + sun.optString("blueMorning", "-") + " / " + sun.optString("blueEvening", "-");
                paragraph(windows, 9.6f, false);
            }

            JSONObject dmx = technical.optJSONObject("dmx");
            JSONArray rows = dmx == null ? null : dmx.optJSONArray("rows");
            if (rows != null && rows.length() > 0) {
                section(sr ? "DMX PATCH" : "DMX PATCH");
                paragraph(sr ? "Za gaffera: podaci iz lokalnog patch-a; veza i odziv uređaja nisu potvrđeni ovim izvozom."
                    : "For the gaffer: local patch data; this export does not verify device connection or response.", 9.5f, false);
                if (dmx.optInt("warningCount", 0) > 0) {
                    paragraph((sr ? "Upozorenja u patch-u: " : "Patch warnings: ") + dmx.optInt("warningCount", 0), 9.8f, true);
                }
                for (int i = 0; i < rows.length(); i++) {
                    JSONObject row = rows.optJSONObject(i);
                    if (row == null) continue;
                    int start = row.optInt("start", 0);
                    int channels = row.optInt("channels", 0);
                    boolean validRange = start >= 1 && start <= 512 && channels > 0 && channels <= 512 && start + channels - 1 <= 512;
                    String range = validRange ? start + "-" + (start + channels - 1) : (sr ? "nije potvrđen" : "not confirmed");
                    String line = "- " + row.optString("name", "DMX") +
                        " | U " + technicalNumber(row, "universe", "", false) +
                        " | " + (sr ? "opseg " : "range ") + range +
                        " | " + technicalNumber(row, "channels", "ch", false) +
                        (row.optString("mode", "").isEmpty() ? "" : " | " + row.optString("mode"));
                    paragraph(line, 9.5f, false);
                }
            }
        }

        private String technicalNumber(JSONObject object, String key, String unit, boolean allowZero) {
            String unknown = sr ? "nije uneto" : "not entered";
            if (object == null || object.isNull(key)) return unknown;
            Object value = object.opt(key);
            if (!(value instanceof Number) && !(value instanceof String)) return unknown;
            if (value instanceof String && ((String) value).trim().isEmpty()) return unknown;
            double number = object.optDouble(key, Double.NaN);
            if (Double.isNaN(number) || Double.isInfinite(number) || (allowZero ? number < 0 : number <= 0)) return unknown;
            return String.valueOf(value).trim() + (unit.isEmpty() ? "" : " " + unit);
        }

        private void drawPlannerSetSketch(JSONObject sketch, JSONObject technical) {
            if (sketch == null) return;
            JSONArray scenes = sketch.optJSONArray("scenes");
            if (scenes == null || scenes.length() == 0) return;
            String activeId = sketch.optString("activeId", "");
            JSONObject scene = null;
            for (int i = 0; i < scenes.length(); i++) {
                JSONObject candidate = scenes.optJSONObject(i);
                if (candidate == null) continue;
                if (scene == null) scene = candidate;
                if (!activeId.isEmpty() && activeId.equals(candidate.optString("id", ""))) {
                    scene = candidate;
                    break;
                }
            }
            if (scene == null) return;

            double roomW = Math.max(0.5, scene.optDouble("roomW", 10.0));
            double roomH = Math.max(0.5, scene.optDouble("roomH", 8.0));
            JSONArray objects = scene.optJSONArray("objects");

            newPage();
            title(sr ? "SKICA SETA IZ PLANERA" : "PLANNER SET SKETCH");
            String sceneName = scene.optString("name", sr ? "Scena" : "Scene");
            small(sceneName + " | " + String.format(Locale.US, "%.1f x %.1f m", roomW, roomH), MUTED);

            float mapTop = y + 12f;
            float mapLeft = MARGIN;
            float mapW = CONTENT_W;
            float mapH = Math.min(500f, mapW * (float) Math.min(1.20, Math.max(0.55, roomH / roomW)));
            if (mapH < 300f) mapH = 300f;
            ensure(mapH + 36f);

            Paint fill = paint(Color.rgb(247, 248, 250), Paint.Style.FILL, 1f);
            Paint border = paint(Color.rgb(150, 156, 165), Paint.Style.STROKE, 1.1f);
            canvas.drawRoundRect(new RectF(mapLeft, mapTop, mapLeft + mapW, mapTop + mapH), 8f, 8f, fill);
            canvas.drawRoundRect(new RectF(mapLeft, mapTop, mapLeft + mapW, mapTop + mapH), 8f, 8f, border);

            Paint grid = paint(Color.rgb(220, 223, 228), Paint.Style.STROKE, 0.55f);
            int gridX = (int) Math.min(50, Math.floor(roomW));
            int gridY = (int) Math.min(50, Math.floor(roomH));
            for (int gx = 1; gx < gridX; gx++) {
                float x = mapLeft + (float) (gx / roomW) * mapW;
                canvas.drawLine(x, mapTop, x, mapTop + mapH, grid);
            }
            for (int gy = 1; gy < gridY; gy++) {
                float yy = mapTop + (float) (gy / roomH) * mapH;
                canvas.drawLine(mapLeft, yy, mapLeft + mapW, yy, grid);
            }

            JSONObject sun = technical == null ? null : technical.optJSONObject("sun");
            if (sun != null && sun.optBoolean("aboveHorizon", false) && sun.has("azimuthDeg")) {
                double screenAz = ((sun.optDouble("sketchNorthDeg", 0.0) + sun.optDouble("azimuthDeg", 0.0)) % 360.0 + 360.0) % 360.0;
                double rad = Math.toRadians(screenAz);
                float dx = (float) Math.sin(rad);
                float dy = (float) -Math.cos(rad);
                float centerX = mapLeft + mapW * 0.5f;
                float centerY = mapTop + mapH * 0.5f;
                float radius = Math.min(mapW, mapH) * 0.40f;
                float sunX = centerX + dx * radius;
                float sunY = centerY + dy * radius;
                Paint sunLine = paint(ACCENT, Paint.Style.STROKE, 2.0f);
                canvas.drawLine(sunX, sunY, centerX, centerY, sunLine);
                Paint sunDisk = paint(Color.rgb(245, 197, 66), Paint.Style.FILL, 1f);
                canvas.drawCircle(sunX, sunY, 10f, sunDisk);
                Paint sunLabel = textPaint(8f, true, INK);
                sunLabel.setTextAlign(Paint.Align.CENTER);
                canvas.drawText("SUN", sunX, sunY + 2.8f, sunLabel);
                sunLabel.setTextAlign(Paint.Align.LEFT);
            }

            if (objects != null) {
                Paint direction = paint(Color.rgb(145, 116, 30), Paint.Style.STROKE, 1.2f);
                Paint cameraDirection = paint(Color.rgb(70, 145, 205), Paint.Style.STROKE, 1.2f);
                Paint wallPaint = paint(Color.rgb(100, 107, 116), Paint.Style.STROKE, 4.2f);
                Paint backgroundPaint = paint(Color.rgb(125, 92, 176), Paint.Style.STROKE, 4.2f);
                Paint labelPaint = textPaint(7.8f, true, INK);
                labelPaint.setTextAlign(Paint.Align.CENTER);

                for (int i = 0; i < objects.length(); i++) {
                    JSONObject o = objects.optJSONObject(i);
                    if (o == null) continue;
                    String type = o.optString("type", "object");
                    String label = o.optString("label", type);
                    double ox = Math.max(0, Math.min(roomW, o.optDouble("x", roomW / 2.0)));
                    double oy = Math.max(0, Math.min(roomH, o.optDouble("y", roomH / 2.0)));
                    double rot = o.optDouble("rot", 0.0);
                    float px = mapLeft + (float) (ox / roomW) * mapW;
                    float py = mapTop + (float) (oy / roomH) * mapH;
                    double rad = Math.toRadians(rot);
                    float dx = (float) Math.sin(rad);
                    float dy = (float) -Math.cos(rad);

                    if ("wall".equals(type) || "background".equals(type)) {
                        float half = 26f;
                        float pxv = -dy;
                        float pyv = dx;
                        Paint wp = "background".equals(type) ? backgroundPaint : wallPaint;
                        canvas.drawLine(px - pxv * half, py - pyv * half, px + pxv * half, py + pyv * half, wp);
                    } else if ("camera".equals(type)) {
                        Paint cam = paint(Color.rgb(72, 78, 86), Paint.Style.FILL, 1f);
                        canvas.drawRect(px - 10f, py - 7f, px + 10f, py + 7f, cam);
                        canvas.drawLine(px, py, px + dx * 38f, py + dy * 38f, cameraDirection);
                    } else if ("subject".equals(type)) {
                        Paint person = paint(Color.rgb(70, 74, 82), Paint.Style.FILL, 1f);
                        canvas.drawCircle(px, py, 9f, person);
                        canvas.drawLine(px, py + 9f, px, py + 25f, wallPaint);
                    } else if ("light".equals(type)) {
                        Paint lamp = paint(ACCENT, Paint.Style.FILL, 1f);
                        canvas.drawCircle(px, py, 9f, lamp);
                        canvas.drawLine(px, py, px + dx * 44f, py + dy * 44f, direction);
                    } else {
                        Paint other = paint(Color.rgb(95, 101, 109), Paint.Style.FILL, 1f);
                        canvas.drawCircle(px, py, 7f, other);
                    }

                    String safeLabel = label.length() > 28 ? label.substring(0, 28) : label;
                    canvas.drawText(safeLabel, px, py + 18f, labelPaint);
                }
                labelPaint.setTextAlign(Paint.Align.LEFT);
            }

            y = mapTop + mapH + 18f;
            if (objects != null && objects.length() > 0) {
                section(sr ? "ELEMENTI SKICE" : "SKETCH ELEMENTS");
                for (int i = 0; i < objects.length(); i++) {
                    JSONObject o = objects.optJSONObject(i);
                    if (o == null) continue;
                    String type = o.optString("type", "object");
                    String label = o.optString("label", type);
                    String line = "- " + label + " | " + type +
                        " | x " + String.format(Locale.US, "%.2f", o.optDouble("x", 0)) + " m" +
                        " | y " + String.format(Locale.US, "%.2f", o.optDouble("y", 0)) + " m" +
                        " | " + String.format(Locale.US, "%.0f", o.optDouble("rot", 0)) + " deg";
                    if ("light".equals(type) && !o.optString("fixtureId", "").isEmpty()) {
                        line += " | " + o.optString("fixtureId");
                    }
                    if ("light".equals(type) && o.has("beamAngleDeg")) {
                        line += " | beam " + String.format(Locale.US, "%.1f", o.optDouble("beamAngleDeg", 0)) + " deg";
                    }
                    paragraph(line, 9f, false);
                }
            }
        }

        private void drawSetupMap(JSONObject planJson) {
            JSONObject diagram = planJson.optJSONObject("lighting_diagram");
            JSONArray lights = diagram == null ? null : diagram.optJSONArray("lights");
            JSONArray subjects = diagram == null ? null : diagram.optJSONArray("subjects");
            if (subjects == null || subjects.length() == 0) {
                subjects = new JSONArray();
                JSONObject fallback = new JSONObject();
                try {
                    fallback.put("id", "S1");
                    fallback.put("label", sr ? "Glumac" : "Subject");
                    fallback.put("x", 50);
                    fallback.put("y", 50);
                    subjects.put(fallback);
                } catch (Exception ignored) {}
            }

            float mapH = 420f;
            ensure(mapH + 28f);
            float left = MARGIN;
            float top = y + 8f;
            Paint fill = paint(PANEL, Paint.Style.FILL, 1f);
            Paint border = paint(Color.rgb(180, 184, 191), Paint.Style.STROKE, 1.2f);
            canvas.drawRoundRect(new RectF(left, top, left + CONTENT_W, top + mapH), 10f, 10f, fill);
            canvas.drawRoundRect(new RectF(left, top, left + CONTENT_W, top + mapH), 10f, 10f, border);

            java.util.Map<String, float[]> subjectPoints = new java.util.HashMap<>();
            for (int i = 0; i < subjects.length(); i++) {
                JSONObject subject = subjects.optJSONObject(i);
                if (subject == null) continue;
                String id = subject.optString("id", "S" + (i + 1));
                float x = (float) Math.max(5, Math.min(95, subject.optDouble("x", 50)));
                float yy = (float) Math.max(5, Math.min(95, subject.optDouble("y", 50)));
                float px = left + CONTENT_W * x / 100f;
                float py = top + mapH * yy / 100f;
                subjectPoints.put(id, new float[]{px, py});
                node(px, py, 13f, Color.rgb(55, 59, 65), id, Color.WHITE);
                Paint label = textPaint(7.2f, false, INK);
                label.setTextAlign(Paint.Align.CENTER);
                canvas.drawText(subject.optString("label", id), px, py + 24f, label);
                label.setTextAlign(Paint.Align.LEFT);
            }

            float cx = left + CONTENT_W * 0.50f;
            float cy = top + mapH * 0.90f;
            node(cx, cy, 15f, Color.rgb(85, 89, 95), sr ? "KAMERA" : "CAMERA", Color.WHITE);

            if (lights != null) {
                Paint ray = paint(Color.rgb(145, 116, 30), Paint.Style.STROKE, 1.2f);
                for (int i = 0; i < lights.length(); i++) {
                    JSONObject light = lights.optJSONObject(i);
                    if (light == null) continue;
                    float x = (float) Math.max(5, Math.min(95, light.optDouble("x", 50)));
                    float yy = (float) Math.max(5, Math.min(95, light.optDouble("y", 50)));
                    float px = left + CONTENT_W * x / 100f;
                    float py = top + mapH * yy / 100f;
                    JSONArray targets = light.optJSONArray("targets");
                    boolean drewTarget = false;
                    if (targets != null) {
                        for (int t = 0; t < targets.length(); t++) {
                            float[] point = subjectPoints.get(targets.optString(t, ""));
                            if (point == null) continue;
                            canvas.drawLine(px, py, point[0], point[1], ray);
                            drewTarget = true;
                        }
                    }
                    if (!drewTarget) {
                        for (float[] point : subjectPoints.values()) canvas.drawLine(px, py, point[0], point[1], ray);
                    }
                    String id = light.optString("id", "L" + (i + 1));
                    node(px, py, 14f, ACCENT, id, Color.rgb(25, 25, 25));
                }
            }
            y = top + mapH + 18f;

            section(sr ? "GLUMCI / SUBJEKTI" : "ACTORS / SUBJECTS");
            for (int i = 0; i < subjects.length(); i++) {
                JSONObject subject = subjects.optJSONObject(i);
                if (subject == null) continue;
                String line = subject.optString("id", "S" + (i + 1)) + " - " +
                    subject.optString("label", sr ? "Glumac" : "Subject") +
                    " | x " + String.format(Locale.US, "%.1f", subject.optDouble("x", 50)) +
                    " | y " + String.format(Locale.US, "%.1f", subject.optDouble("y", 50));
                paragraph(line, 9.4f, false);
            }

            if (lights != null && lights.length() > 0) {
                section(sr ? "LEGENDA RASVETE" : "LIGHTING LEGEND");
                for (int i = 0; i < lights.length(); i++) {
                    JSONObject light = lights.optJSONObject(i);
                    if (light == null) continue;
                    JSONArray targets = light.optJSONArray("targets");
                    List<String> targetNames = new ArrayList<>();
                    if (targets != null) for (int t = 0; t < targets.length(); t++) targetNames.add(targets.optString(t));
                    String line = light.optString("id", "L" + (i + 1)) + " - " +
                        light.optString("fixture", "") +
                        (light.optString("role", "").isEmpty() ? "" : " | " + light.optString("role")) +
                        (targetNames.isEmpty() ? "" : " | " + (sr ? "cilj " : "targets ") + join(targetNames, ", ")) +
                        (light.optString("direction", "").isEmpty() ? "" : " | " + light.optString("direction"));
                    paragraph(line, 9.6f, false);
                    JSONArray accessories = light.optJSONArray("accessories");
                    if (accessories != null && accessories.length() > 0) {
                        List<String> names = new ArrayList<>();
                        for (int a = 0; a < accessories.length(); a++) names.add(String.valueOf(accessories.opt(a)));
                        paragraph((sr ? "Dodaci: " : "Accessories: ") + join(names, ", "), 9f, false);
                    }
                }
            }
        }

        private void node(float x, float yy, float radius, int color, String label, int textColor) {
            Paint p = paint(color, Paint.Style.FILL, 1f);
            canvas.drawCircle(x, yy, radius, p);
            Paint t = textPaint(7.8f, true, textColor);
            t.setTextAlign(Paint.Align.CENTER);
            canvas.drawText(label, x, yy + 2.7f, t);
            t.setTextAlign(Paint.Align.LEFT);
        }

        private void planSection(JSONObject planJson, String key, String label) {
            Object value = planJson.opt(key);
            if (value == null || JSONObject.NULL.equals(value)) return;
            String rendered;
            if (value instanceof JSONArray) {
                JSONArray a = (JSONArray) value;
                List<String> items = new ArrayList<>();
                for (int i = 0; i < a.length(); i++) items.add("- " + String.valueOf(a.opt(i)));
                rendered = join(items, "\n");
            } else if (value instanceof JSONObject) {
                JSONObject o = (JSONObject) value;
                List<String> items = new ArrayList<>();
                JSONArray names = o.names();
                if (names != null) for (int i = 0; i < names.length(); i++) {
                    String name = names.optString(i);
                    items.add(name + ": " + String.valueOf(o.opt(name)));
                }
                rendered = join(items, " | ");
            } else {
                rendered = String.valueOf(value);
            }
            if (rendered.trim().isEmpty()) return;
            section(label);
            paragraph(rendered, 10.4f, false);
        }

        private void drawImage(String dataUrl, String label) {
            Bitmap bitmap = decodeBitmap(dataUrl);
            if (bitmap == null) return;
            try {
                section(label);
                float maxH = 300f;
                float scale = Math.min(CONTENT_W / bitmap.getWidth(), maxH / bitmap.getHeight());
                float w = Math.max(1f, bitmap.getWidth() * scale);
                float h = Math.max(1f, bitmap.getHeight() * scale);
                ensure(h + 16f);
                float left = MARGIN + (CONTENT_W - w) / 2f;
                canvas.drawBitmap(bitmap, null, new RectF(left, y, left + w, y + h), paint(Color.WHITE, Paint.Style.FILL, 1f));
                y += h + 14f;
            } finally {
                bitmap.recycle();
            }
        }

        private Bitmap decodeBitmap(String dataUrl) {
            try {
                if (dataUrl == null || !dataUrl.startsWith("data:image/")) return null;
                int comma = dataUrl.indexOf(',');
                if (comma < 0) return null;
                byte[] bytes = Base64.decode(dataUrl.substring(comma + 1), Base64.DEFAULT);
                if (bytes.length == 0 || bytes.length > MAX_IMAGE_BYTES) return null;
                BitmapFactory.Options bounds = new BitmapFactory.Options();
                bounds.inJustDecodeBounds = true;
                BitmapFactory.decodeByteArray(bytes, 0, bytes.length, bounds);
                int sample = 1;
                while (bounds.outWidth / sample > 1800 || bounds.outHeight / sample > 1800) sample *= 2;
                BitmapFactory.Options options = new BitmapFactory.Options();
                options.inSampleSize = sample;
                return BitmapFactory.decodeByteArray(bytes, 0, bytes.length, options);
            } catch (Exception ignored) {
                return null;
            }
        }

        private void newPage() {
            finishPage();
            pageNumber++;
            page = document.startPage(new PdfDocument.PageInfo.Builder(PAGE_W, PAGE_H, pageNumber).create());
            canvas = page.getCanvas();
            canvas.drawColor(Color.WHITE);
            Paint brand = textPaint(10f, true, INK);
            canvas.drawText("LIGHTINGAI", MARGIN, 28f, brand);
            Paint line = paint(ACCENT, Paint.Style.FILL, 1f);
            canvas.drawRect(MARGIN, 34f, PAGE_W - MARGIN, 36f, line);
            y = 58f;
        }

        private void finishPage() {
            if (page == null) return;
            Paint footer = textPaint(8.5f, false, MUTED);
            canvas.drawText((sr ? "Strana " : "Page ") + pageNumber, PAGE_W - MARGIN - 44f, PAGE_H - 20f, footer);
            document.finishPage(page);
            page = null;
            canvas = null;
        }

        private void title(String value) {
            ensure(38f);
            Paint p = textPaint(20f, true, INK);
            canvas.drawText(value, MARGIN, y, p);
            y += 28f;
        }

        private void section(String value) {
            ensure(34f);
            y += 8f;
            Paint bar = paint(ACCENT, Paint.Style.FILL, 1f);
            canvas.drawRect(MARGIN, y - 12f, MARGIN + 4f, y + 9f, bar);
            Paint p = textPaint(12f, true, INK);
            canvas.drawText(value, MARGIN + 12f, y + 4f, p);
            y += 18f;
        }

        private void paragraph(String value, float size, boolean bold) {
            String text = value == null ? "" : value.trim();
            if (text.isEmpty()) {
                small(sr ? "Nema podataka." : "No data.", MUTED);
                return;
            }
            Paint p = textPaint(size, bold, INK);
            String[] paragraphs = text.replace("\r", "").split("\n", -1);
            float lineHeight = size * 1.48f;
            for (String part : paragraphs) {
                if (part.trim().isEmpty()) {
                    gap(lineHeight * 0.6f);
                    continue;
                }
                List<String> lines = wrap(part.trim(), p, CONTENT_W);
                for (String line : lines) {
                    ensure(lineHeight + 2f);
                    canvas.drawText(line, MARGIN, y, p);
                    y += lineHeight;
                }
            }
            y += 3f;
        }

        private void small(String value, int color) {
            ensure(16f);
            Paint p = textPaint(9.5f, false, color);
            canvas.drawText(value == null ? "" : value, MARGIN, y, p);
            y += 14f;
        }

        private void gap(float amount) {
            ensure(amount);
            y += amount;
        }

        private void ensure(float required) {
            if (page == null) newPage();
            if (y + required > PAGE_H - 42f) newPage();
        }

        private Paint paint(int color, Paint.Style style, float stroke) {
            Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
            p.setColor(color);
            p.setStyle(style);
            p.setStrokeWidth(stroke);
            return p;
        }

        private Paint textPaint(float size, boolean bold, int color) {
            Paint p = paint(color, Paint.Style.FILL, 1f);
            p.setTextSize(size);
            p.setTypeface(Typeface.create("sans-serif", bold ? Typeface.BOLD : Typeface.NORMAL));
            return p;
        }

        private List<String> wrap(String value, Paint paint, float width) {
            List<String> out = new ArrayList<>();
            String[] words = value.split("\\s+");
            StringBuilder line = new StringBuilder();
            for (String word : words) {
                if (word.isEmpty()) continue;
                String candidate = line.length() == 0 ? word : line + " " + word;
                if (paint.measureText(candidate) <= width) {
                    line.setLength(0);
                    line.append(candidate);
                } else {
                    if (line.length() > 0) out.add(line.toString());
                    if (paint.measureText(word) <= width) {
                        line.setLength(0);
                        line.append(word);
                    } else {
                        StringBuilder chunk = new StringBuilder();
                        for (int i = 0; i < word.length(); i++) {
                            char ch = word.charAt(i);
                            String next = chunk.toString() + ch;
                            if (paint.measureText(next) > width && chunk.length() > 0) {
                                out.add(chunk.toString());
                                chunk.setLength(0);
                            }
                            chunk.append(ch);
                        }
                        line.setLength(0);
                        line.append(chunk);
                    }
                }
            }
            if (line.length() > 0) out.add(line.toString());
            if (out.isEmpty()) out.add("");
            return out;
        }

        private static String join(List<String> values, String separator) {
            StringBuilder out = new StringBuilder();
            for (String value : values) {
                if (out.length() > 0) out.append(separator);
                out.append(value);
            }
            return out.toString();
        }
    }

    private void saveToPictures(String filename, ImageData image) throws Exception {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Images.Media.DISPLAY_NAME, filename);
            values.put(MediaStore.Images.Media.MIME_TYPE, image.mimeType);
            values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/LightingAI");
            values.put(MediaStore.Images.Media.IS_PENDING, 1);
            Uri uri = activity.getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
            if (uri == null) throw new IllegalStateException("MediaStore unavailable");
            try {
                try (OutputStream stream = activity.getContentResolver().openOutputStream(uri, "w")) {
                    if (stream == null) throw new IllegalStateException("Image output unavailable");
                    stream.write(image.bytes);
                }
                ContentValues ready = new ContentValues();
                ready.put(MediaStore.Images.Media.IS_PENDING, 0);
                activity.getContentResolver().update(uri, ready, null, null);
            } catch (Exception error) {
                activity.getContentResolver().delete(uri, null, null);
                throw error;
            }
            return;
        }
        File pictures = activity.getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        if (pictures == null) throw new IllegalStateException("Pictures directory unavailable");
        File directory = new File(pictures, "LightingAI");
        if (!directory.exists() && !directory.mkdirs()) throw new IllegalStateException("Pictures directory unavailable");
        File output = new File(directory, filename);
        try (OutputStream stream = new FileOutputStream(output, false)) { stream.write(image.bytes); }
        MediaScannerConnection.scanFile(activity, new String[]{output.getAbsolutePath()}, new String[]{image.mimeType}, null);
    }

    private ImageData decode(String dataUrl) {
        if (dataUrl == null || !dataUrl.startsWith("data:image/")) throw new IllegalArgumentException("Image data URL required");
        int comma = dataUrl.indexOf(',');
        if (comma < 0 || !dataUrl.substring(0, comma).contains(";base64")) throw new IllegalArgumentException("Base64 image required");
        String header = dataUrl.substring(5, comma).toLowerCase(Locale.US);
        String mime = header.substring(0, header.indexOf(';'));
        if (!mime.equals("image/jpeg") && !mime.equals("image/png") && !mime.equals("image/webp")) throw new IllegalArgumentException("Unsupported image type");
        byte[] bytes = Base64.decode(dataUrl.substring(comma + 1), Base64.DEFAULT);
        if (bytes.length == 0 || bytes.length > MAX_IMAGE_BYTES) throw new IllegalArgumentException("Invalid image size");
        String extension = mime.equals("image/png") ? ".png" : (mime.equals("image/webp") ? ".webp" : ".jpg");
        return new ImageData(bytes, mime, extension);
    }

    private String safeFilename(String requested, String extension) {
        String base = requested == null ? "LightingAI_image" : requested.replaceAll("[^A-Za-z0-9._-]", "_");
        if (base.length() > 90) base = base.substring(0, 90);
        base = base.replaceFirst("(?i)\\.(jpg|jpeg|png|webp)$", "");
        if (base.isEmpty()) base = "LightingAI_image";
        return base + extension;
    }

    private void notifyResult(String action, boolean ok) {
        activity.runOnUiThread(() -> {
            if (ok && "save".equals(action)) Toast.makeText(activity, "LightingAI: slika je sačuvana", Toast.LENGTH_SHORT).show();
            if (activity instanceof MainActivity) {
                MainActivity main = (MainActivity) activity;
                main.notifyAIVisualImageResult(JSONObject.quote(action), ok);
            }
        });
    }

    private static final class ImageData {
        final byte[] bytes;
        final String mimeType;
        final String extension;
        ImageData(byte[] bytes, String mimeType, String extension) {
            this.bytes = bytes;
            this.mimeType = mimeType;
            this.extension = extension;
        }
    }
}
