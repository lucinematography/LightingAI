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
                notifyPdfResult(true, safeName);
            } catch (Exception error) {
                notifyPdfResult(false, safeName);
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
                        notifyPdfResult(true, safeName);
                    } catch (Exception error) {
                        notifyPdfResult(false, safeName);
                    }
                });
            } catch (Exception error) {
                notifyPdfResult(false, safeName);
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

    private void notifyPdfResult(boolean ok, String filename) {
        activity.runOnUiThread(() -> {
            if (ok) Toast.makeText(activity, "LightingAI: PDF je sačuvan u Preuzimanja", Toast.LENGTH_LONG).show();
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
                if ("shot_setup".equals(payload.optString("documentType", ""))) return renderShotSetup();
                newPage();
                title(sr ? "AI PREDLOG POSTAVKE RASVETE" : "AI LIGHTING SETUP PROPOSAL");
                small(sr ? "Profesionalni LightingAI izvoz" : "Professional LightingAI export", MUTED);
                gap(8);

                section(sr ? "ZAHTEV DP-a" : "DP REQUEST");
                paragraph(payload.optString("dpRequest", ""), 11f, false);
                section(sr ? "CILJ / OPIS SCENE" : "SCENE GOAL / DESCRIPTION");
                paragraph(payload.optString("description", ""), 11f, false);
                String measurements = payload.optString("measurements", "");
                if (!measurements.isEmpty()) {
                    section(sr ? "MERENJA IZ PLANERA" : "PLANNER MEASUREMENTS");
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

                drawTechnical(payload.optJSONObject("technical"));

                finishPage();
                ByteArrayOutputStream output = new ByteArrayOutputStream();
                document.writeTo(output);
                return output.toByteArray();
            } finally {
                try { document.close(); } catch (Exception ignored) {}
            }
        }

        private byte[] renderShotSetup() throws Exception {
            JSONObject report = payload.optJSONObject("report");
            if (report == null) report = new JSONObject();

            newPage();
            title(sr ? "BLOCKING / CAMERA DESIGNER — SHOT SETUP" : "BLOCKING / CAMERA DESIGNER — SHOT SETUP");
            small(sr ? "Profesionalni tehnički LightingAI paket scene" : "Professional LightingAI scene technical package", MUTED);

            JSONObject scene = report.optJSONObject("scene");
            if (scene != null) {
                section(sr ? "SCENA / SET" : "SCENE / SET");
                paragraph(scene.optString("name", sr ? "Scena" : "Scene") +
                    " | " + String.format(Locale.US, "%.1f x %.1f m", scene.optDouble("widthM", 0), scene.optDouble("lengthM", 0)), 10.5f, true);
            }

            String notes = report.optString("notes", "");
            if (!notes.trim().isEmpty()) {
                section(sr ? "BELEŠKE SCENE" : "SCENE NOTES");
                paragraph(notes, 10f, false);
            }

            drawPlannerSetSketch(payload.optJSONObject("setSketch"), payload.optJSONObject("technical"));

            newPage();
            title(sr ? "KAMERA / BLOCKING / FRAMING" : "CAMERA / BLOCKING / FRAMING");
            if (scene != null) {
                JSONArray objects = scene.optJSONArray("objects");
                boolean hasCamera = false;
                if (objects != null) {
                    for (int i = 0; i < objects.length(); i++) {
                        JSONObject o = objects.optJSONObject(i);
                        if (o == null || !"camera".equals(o.optString("type", ""))) continue;
                        hasCamera = true;
                        String line = "- " + o.optString("label", sr ? "Kamera" : "Camera") +
                            " | " + String.format(Locale.US, "%.0f mm", o.optDouble("focalLengthMm", 35)) +
                            " | sensor " + String.format(Locale.US, "%.1f mm", o.optDouble("sensorWidthMm", 36)) +
                            " | x " + String.format(Locale.US, "%.2f m", o.optDouble("xM", 0)) +
                            " | y " + String.format(Locale.US, "%.2f m", o.optDouble("yM", 0)) +
                            " | " + String.format(Locale.US, "%.0f°", o.optDouble("directionDeg", 0));
                        paragraph(line, 10f, false);
                    }
                }
                if (!hasCamera) paragraph(sr ? "Nema kamere u aktivnoj sceni." : "No camera in active scene.", 10f, false);
            }

            JSONObject blocking = report.optJSONObject("blocking");
            if (blocking == null) blocking = new JSONObject();
            JSONArray motion = blocking.optJSONArray("motion");
            section(sr ? "PUTANJE KRETANJA" : "MOVEMENT PATHS");
            if (motion == null || motion.length() == 0) {
                paragraph(sr ? "Nema sačuvanih Blocking putanja." : "No saved Blocking paths.", 10f, false);
            } else {
                for (int i = 0; i < motion.length(); i++) {
                    JSONObject m = motion.optJSONObject(i);
                    if (m == null) continue;
                    JSONArray path = m.optJSONArray("path");
                    String line = "- " + m.optString("label", m.optString("type", "Object")) +
                        " | " + (path == null ? 0 : path.length()) + " waypoint" +
                        " | " + String.format(Locale.US, "%.1f s", m.optDouble("durationSec", 5));
                    String target = m.optString("trackSubjectId", "");
                    if (!target.isEmpty()) {
                        line += " | tracking " + m.optString("trackFramingMode", "center");
                        if (m.has("trackOffsetDeg") && !m.isNull("trackOffsetDeg")) {
                            line += " | " + String.format(Locale.US, "%+.1f°", m.optDouble("trackOffsetDeg", 0));
                        }
                    }
                    paragraph(line, 9.8f, false);
                    if (path != null) {
                        List<String> pts = new ArrayList<>();
                        for (int p = 0; p < path.length(); p++) {
                            JSONObject point = path.optJSONObject(p);
                            if (point == null) continue;
                            pts.add(String.format(Locale.US, "#%d %.2f/%.2f m",
                                point.optInt("index", p + 1), point.optDouble("xM", 0), point.optDouble("yM", 0)));
                        }
                        if (!pts.isEmpty()) paragraph(join(pts, " | "), 8.8f, false);
                    }
                }
            }

            JSONObject framing = blocking.optJSONObject("framing");
            if (framing != null && framing.length() > 0) {
                section(sr ? "CAMERA FOV / FRAMING" : "CAMERA FOV / FRAMING");
                paragraph((framing.optBoolean("inside", false) ? (sr ? "U KADRU" : "IN FRAME") : (sr ? "VAN KADRA" : "OUT OF FRAME")) +
                    " | H-FOV " + String.format(Locale.US, "%.1f°", framing.optDouble("horizontalFovDeg", 0)) +
                    " | " + (sr ? "odstupanje od centra " : "center offset ") + String.format(Locale.US, "%.2f m", framing.optDouble("centerOffset", 0)) +
                    " | " + (sr ? "rezerva do ivice " : "edge margin ") + String.format(Locale.US, "%+.2f m", framing.optDouble("edgeMargin", 0)), 10f, false);
            }

            newPage();
            title(sr ? "RASVETA / SUNCE / AI PREDLOZI" : "LIGHTING / SUN / AI PROPOSALS");
            JSONArray lighting = blocking.optJSONArray("lighting");
            section(sr ? "BLOCKING LIGHT MAP" : "BLOCKING LIGHT MAP");
            if (lighting == null || lighting.length() == 0) {
                paragraph(sr ? "Nema Blocking rasvete." : "No Blocking lighting.", 10f, false);
            } else {
                for (int i = 0; i < lighting.length(); i++) {
                    JSONObject l = lighting.optJSONObject(i);
                    if (l == null) continue;
                    String line = "- " + l.optString("label", "Light " + (i + 1)) +
                        " | x " + String.format(Locale.US, "%.2f m", l.optDouble("x", 0)) +
                        " | y " + String.format(Locale.US, "%.2f m", l.optDouble("y", 0)) +
                        " | " + String.format(Locale.US, "%.0f°", l.optDouble("directionDeg", 0));
                    if (l.has("beamAngleDeg") && !l.isNull("beamAngleDeg")) line += " | beam " + String.format(Locale.US, "%.1f°", l.optDouble("beamAngleDeg", 0));
                    JSONObject cov = l.optJSONObject("coverage");
                    if (cov != null) {
                        line += " | " + cov.optString("subjectLabel", sr ? "Glumac" : "Actor") +
                            " " + String.format(Locale.US, "%.2f m", cov.optDouble("distanceM", 0));
                        if (cov.has("insideBeam") && !cov.isNull("insideBeam")) line += cov.optBoolean("insideBeam") ? " | IN BEAM" : " | OUT OF BEAM";
                        if (cov.has("offsetM") && !cov.isNull("offsetM")) line += " | offset " + String.format(Locale.US, "%.2f m", Math.abs(cov.optDouble("offsetM", 0)));
                    }
                    paragraph(line, 9.4f, false);
                }
            }

            JSONObject sunCamera = blocking.optJSONObject("sunCamera");
            if (sunCamera != null && sunCamera.length() > 0) {
                section(sr ? "SUNCE PREMA KAMERI" : "SUN RELATIVE TO CAMERA");
                paragraph(sunCamera.optString("lightType", "-") +
                    " | " + sunCamera.optString("relation", "-") +
                    " | relative " + String.format(Locale.US, "%+.0f°", sunCamera.optDouble("relativeAngleDeg", 0)) +
                    " | sun az " + String.format(Locale.US, "%.0f°", sunCamera.optDouble("sunAzimuthDeg", 0)) +
                    " | el " + String.format(Locale.US, "%.1f°", sunCamera.optDouble("sunElevationDeg", 0)), 10f, false);
            }

            JSONObject ai = blocking.optJSONObject("ai");
            JSONArray proposals = ai == null ? null : ai.optJSONArray("proposals");
            if (proposals != null && proposals.length() > 0) {
                section(sr ? "AI BLOCKING PREDLOZI — NISU AUTOMATSKI PRIMENJENI" : "AI BLOCKING PROPOSALS — NOT APPLIED AUTOMATICALLY");
                for (int i = 0; i < proposals.length(); i++) {
                    JSONObject p = proposals.optJSONObject(i);
                    if (p == null) continue;
                    String line = "- " + p.optString("role", p.optString("fixture", "AI")) +
                        (p.optString("lightLabel", "").isEmpty() ? "" : " -> " + p.optString("lightLabel")) +
                        " | x " + String.format(Locale.US, "%.2f m", p.optDouble("xM", 0)) +
                        " | y " + String.format(Locale.US, "%.2f m", p.optDouble("yM", 0));
                    if (p.has("moveM") && !p.isNull("moveM")) line += " | move " + String.format(Locale.US, "%.2f m", p.optDouble("moveM", 0));
                    if (p.has("directionDeg") && !p.isNull("directionDeg")) line += " | " + String.format(Locale.US, "%.0f°", p.optDouble("directionDeg", 0));
                    paragraph(line, 9.4f, false);
                }
            }

            JSONArray measurements = report.optJSONArray("measurements");
            if (measurements != null && measurements.length() > 0) {
                section(sr ? "PRO MERENJA" : "PRO MEASUREMENTS");
                for (int i = 0; i < measurements.length(); i++) {
                    JSONObject m = measurements.optJSONObject(i);
                    if (m == null) continue;
                    paragraph("- " + m.optString("target", "-") + " | " +
                        String.format(Locale.US, "%.2f m", m.optDouble("distanceM", 0)) +
                        " | " + m.optString("method", "-"), 9.6f, false);
                }
            }

            JSONArray equipment = report.optJSONArray("equipment");
            if (equipment != null && equipment.length() > 0) {
                section(sr ? "OPREMA" : "EQUIPMENT");
                for (int i = 0; i < equipment.length(); i++) {
                    JSONObject e = equipment.optJSONObject(i);
                    if (e == null) continue;
                    paragraph("- " + e.optString("name", e.optString("id", "Fixture")) + " x" + Math.max(1, e.optInt("qty", 1)), 9.6f, false);
                }
            }

            JSONObject power = report.optJSONObject("power");
            if (power != null && power.length() > 0) {
                section(sr ? "NAPAJANJE" : "POWER");
                paragraph(String.format(Locale.US, "%.0f W | %.2f A @ %.0f V | circuits %d",
                    power.optDouble("totalW", 0), power.optDouble("currentA", 0), power.optDouble("voltageV", 230), power.optInt("circuitsNeeded", 0)), 10f, false);
            }

            finishPage();
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            document.writeTo(output);
            return output.toByteArray();
        }

        private void drawTechnical(JSONObject technical) {
            if (technical == null) return;
            newPage();
            title(sr ? "TEHNIČKI PODACI SCENE" : "SCENE TECHNICAL DATA");

            JSONObject power = technical.optJSONObject("power");
            if (power != null && power.length() > 0) {
                section(sr ? "NAPAJANJE" : "POWER");
                paragraph((sr ? "Napon: " : "Voltage: ") + power.optString("voltage", "230") + " V | " +
                    (sr ? "grana: " : "branch: ") + power.optString("branch", "16") + " A | " +
                    (sr ? "baterija: " : "battery: ") + power.optString("batteryWh", "1000") + " Wh", 10f, false);
            }

            JSONObject cct = technical.optJSONObject("cctGel");
            if (cct != null && cct.length() > 0) {
                section(sr ? "CCT / GEL" : "CCT / GEL");
                paragraph((sr ? "Izvor: " : "Source: ") + cct.optString("source", "-") + " K | " +
                    (sr ? "cilj: " : "target: ") + cct.optString("target", "-") + " K | " +
                    (sr ? "tint: " : "tint: ") + cct.optString("tintMode", "-") + " / " + cct.optString("tintStrength", "-"), 10f, false);
            }

            JSONObject sun = technical.optJSONObject("sun");
            if (sun != null && sun.length() > 0) {
                section(sr ? "SUNCE / LOKACIJA" : "SUN / LOCATION");
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
                if (dmx.optInt("warningCount", 0) > 0) {
                    paragraph((sr ? "Upozorenja u patch-u: " : "Patch warnings: ") + dmx.optInt("warningCount", 0), 9.8f, true);
                }
                for (int i = 0; i < rows.length(); i++) {
                    JSONObject row = rows.optJSONObject(i);
                    if (row == null) continue;
                    int start = row.optInt("start", 1);
                    int channels = row.optInt("channels", 0);
                    int end = channels > 0 ? start + channels - 1 : start;
                    String line = "- " + row.optString("name", "DMX") +
                        " | U" + row.optInt("universe", 1) +
                        " | " + start + "-" + end +
                        " | " + channels + " ch" +
                        (row.optString("mode", "").isEmpty() ? "" : " | " + row.optString("mode"));
                    paragraph(line, 9.5f, false);
                }
            }
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

                    JSONObject blocking = o.optJSONObject("blocking");
                    JSONArray path = blocking == null ? null : blocking.optJSONArray("path");
                    if (path != null && path.length() > 0 && ("camera".equals(type) || "subject".equals(type))) {
                        Paint pathPaint = paint("camera".equals(type) ? Color.rgb(70, 145, 205) : Color.rgb(168, 113, 190), Paint.Style.STROKE, 1.5f);
                        Paint pointPaint = paint("camera".equals(type) ? Color.rgb(70, 145, 205) : Color.rgb(168, 113, 190), Paint.Style.FILL, 1f);
                        float previousX = Float.NaN, previousY = Float.NaN;
                        for (int p = 0; p < path.length(); p++) {
                            JSONObject point = path.optJSONObject(p);
                            if (point == null) continue;
                            double xM = Math.max(0, Math.min(roomW, point.optDouble("x", ox)));
                            double yM = Math.max(0, Math.min(roomH, point.optDouble("y", oy)));
                            float pathX = mapLeft + (float) (xM / roomW) * mapW;
                            float pathY = mapTop + (float) (yM / roomH) * mapH;
                            if (!Float.isNaN(previousX)) canvas.drawLine(previousX, previousY, pathX, pathY, pathPaint);
                            canvas.drawCircle(pathX, pathY, p == 0 || p == path.length() - 1 ? 4.2f : 3.2f, pointPaint);
                            previousX = pathX; previousY = pathY;
                        }
                    }

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
