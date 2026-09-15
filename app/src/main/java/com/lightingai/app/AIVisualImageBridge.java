package com.lightingai.app;

import android.app.Activity;
import android.content.ClipData;
import android.content.ContentValues;
import android.content.Intent;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.widget.Toast;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Locale;
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
