package com.lightingai.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ContentValues;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.Typeface;
import android.location.Location;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.speech.RecognizerIntent;
import android.speech.RecognitionListener;
import android.speech.SpeechRecognizer;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.Gravity;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.style.ForegroundColorSpan;
import android.util.Base64;
import org.json.JSONObject;
import org.json.JSONArray;
import java.io.OutputStream;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.ArrayList;
import java.util.UUID;

public class MainActivity extends Activity {
    private WebView webView;
    private FrameLayout rootView;
    private View startupSplash;
    private String pendingText = null;
    private ValueCallback<Uri[]> pendingFileChooser = null;
    private Uri pendingCameraUri = null;
    private boolean pendingCameraCapture = false;
    private boolean pendingPhotoCapturePermission = false;
    private boolean pendingGalleryPersistable = false;
    private NativeSunLocation nativeSunLocation;
    private NativeSunCompass nativeSunCompass;
    private boolean pendingNativeSunLocation = false;
    private String pendingVoiceTarget = null;
    private String pendingVoiceLanguage = "sr";
    private SpeechRecognizer speechRecognizer;
    private final AtomicInteger artNetSequence = new AtomicInteger(1);
    private final AtomicInteger sacnSequence = new AtomicInteger(0);
    private final AtomicInteger sacnPriority = new AtomicInteger(SacnSender.DEFAULT_PRIORITY);
    private final AtomicLong artNetDirectSent = new AtomicLong(0);
    private final AtomicLong artNetDirectFailed = new AtomicLong(0);
    private final AtomicLong artNetDirectLastAtMs = new AtomicLong(0);
    private final AtomicLong sacnDirectSent = new AtomicLong(0);
    private final AtomicLong sacnDirectFailed = new AtomicLong(0);
    private final AtomicLong sacnDirectLastAtMs = new AtomicLong(0);
    private volatile String artNetDirectLastError = "";
    private volatile String sacnDirectLastError = "";
    private final ArtNetLiveEngine artNetLiveEngine = new ArtNetLiveEngine();
    private byte[] sacnCid;
    private SacnLiveEngine sacnLiveEngine;
    private BleDeviceScanner bleDeviceScanner;
    private String pendingBleDiscoveryRequestId = null;
    private int pendingBleDiscoveryTimeoutMs = 3000;

    private static final int CREATE_FILE = 501;
    private static final int CHOOSE_IMAGE = 502;
    private static final int LOCATION_PERMISSION = 503;
    private static final int CAMERA_PERMISSION = 504;
    private static final int MEASURE_SCENE = 505;
    private static final int SPEECH_INPUT = 506;
    private static final int BLE_PERMISSION = 507;
    private static final int AUDIO_PERMISSION = 508;

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(13, 15, 18));
        getWindow().setNavigationBarColor(Color.rgb(13, 15, 18));
        rootView = new FrameLayout(this);
        rootView.setBackgroundColor(Color.BLACK);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(13, 15, 18));
        rootView.addView(webView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));
        startupSplash = createStartupSplash();
        rootView.addView(startupSplash, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));
        setContentView(rootView);
        nativeSunLocation = new NativeSunLocation(this);
        nativeSunCompass = new NativeSunCompass(this);
        sacnCid = loadOrCreateSacnCid();
        sacnLiveEngine = new SacnLiveEngine(sacnCid, "LightingAI");
        sacnLiveEngine.setPriority(sacnPriority.get());
        bleDeviceScanner = new BleDeviceScanner(this);
        webView.setOnApplyWindowInsetsListener((View v, WindowInsets insets) -> {
            int bottomPx = Math.max(0, insets.getSystemWindowInsetBottom());
            int topPx = Math.max(0, insets.getSystemWindowInsetTop());
            ViewGroup.LayoutParams rawParams = v.getLayoutParams();
            if (rawParams instanceof ViewGroup.MarginLayoutParams) {
                ViewGroup.MarginLayoutParams margins = (ViewGroup.MarginLayoutParams) rawParams;
                if (margins.topMargin != topPx || margins.bottomMargin != bottomPx) {
                    margins.topMargin = topPx;
                    margins.bottomMargin = bottomPx;
                    v.setLayoutParams(margins);
                }
            }
            v.setPadding(0, 0, 0, 0);
            applyNavigationInset();
            return insets;
        });
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setDatabaseEnabled(true); s.setGeolocationEnabled(true);
        s.setAllowFileAccess(true); s.setAllowContentAccess(true); s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.clearCache(true);
        webView.clearHistory();
        webView.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                applyNavigationInset();
                installCatalogView();
                hideStartupSplashAfterDelay();
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, hasLocationPermission(), false);
            }

            @Override public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> {
                    if (request == null) return;
                    if (!hasCameraPermission()) {
                        request.deny();
                        return;
                    }
                    for (String resource : request.getResources()) {
                        if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                            request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
                            return;
                        }
                    }
                    request.deny();
                });
            }

            @Override public boolean onShowFileChooser(
                WebView view,
                ValueCallback<Uri[]> filePathCallback,
                FileChooserParams fileChooserParams
            ) {
                if (pendingFileChooser != null) pendingFileChooser.onReceiveValue(null);
                pendingFileChooser = filePathCallback;
                pendingCameraCapture = fileChooserParams != null && fileChooserParams.isCaptureEnabled();
                pendingGalleryPersistable = false;

                if (pendingCameraCapture) {
                    if (!hasCameraPermission()) {
                        pendingPhotoCapturePermission = true;
                        requestCameraPermission();
                        return true;
                    }
                    return openCameraForWebView();
                }
                if (requiresDocumentPicker(fileChooserParams)) {
                    return openDocumentForWebView(fileChooserParams);
                }
                return openGalleryForWebView(fileChooserParams);
            }
        });
        webView.addJavascriptInterface(new AndroidBridge(), "Android");
        webView.addJavascriptInterface(new AIVisualImageBridge(this), "LightingAIImages");
        webView.postDelayed(
            () -> webView.loadUrl("file:///android_asset/index.html?rev=lightai-native-splash-v4"),
            3350
        );
        webView.requestApplyInsets();
    }

    private View createStartupSplash() {
        FrameLayout splash = new FrameLayout(this);
        splash.setBackgroundColor(Color.BLACK);

        TextView title = new TextView(this);
        SpannableString label = new SpannableString("LightAI");
        label.setSpan(new ForegroundColorSpan(Color.WHITE), 0, 5, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        label.setSpan(new ForegroundColorSpan(Color.rgb(245, 197, 66)), 5, 7, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        title.setText(label);
        title.setTextSize(56);
        title.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        title.setGravity(Gravity.CENTER);
        title.setScaleX(0.08f);
        title.setScaleY(0.08f);
        title.setAlpha(1f);

        FrameLayout.LayoutParams titleParams = new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.WRAP_CONTENT,
            FrameLayout.LayoutParams.WRAP_CONTENT,
            Gravity.CENTER
        );
        splash.addView(title, titleParams);

        title.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        title.setHasTransientState(true);
        title.postDelayed(() -> title.animate()
            .scaleX(1.0f)
            .scaleY(1.0f)
            .setDuration(3200)
            .setInterpolator(new android.view.animation.LinearInterpolator())
            .withEndAction(() -> {
                title.setHasTransientState(false);
                title.setLayerType(View.LAYER_TYPE_NONE, null);
            })
            .start(), 80);

        return splash;
    }

    private void hideStartupSplashAfterDelay() {
        if (startupSplash == null) return;
        startupSplash.postDelayed(() -> {
            if (startupSplash == null) return;
            startupSplash.animate().alpha(0f).setDuration(350).withEndAction(() -> {
                if (startupSplash != null && startupSplash.getParent() instanceof ViewGroup) {
                    ((ViewGroup) startupSplash.getParent()).removeView(startupSplash);
                }
                startupSplash = null;
            }).start();
        }, 250);
    }

    private boolean hasLocationPermission() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.M ||
            checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    private void requestLocationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !hasLocationPermission()) {
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, LOCATION_PERMISSION);
        }
    }

    private void requestNativeSunLocation() {
        if (!hasLocationPermission()) {
            pendingNativeSunLocation = true;
            requestLocationPermission();
            return;
        }
        pendingNativeSunLocation = false;
        if (nativeSunLocation == null) nativeSunLocation = new NativeSunLocation(this);
        nativeSunLocation.request(new NativeSunLocation.Callback() {
            @Override public void onLocation(Location location) {
                if (location == null) { notifyNativeSunLocationError(); return; }
                double accuracy = location.hasAccuracy() ? location.getAccuracy() : Double.NaN;
                notifyNativeSunLocation(location.getLatitude(), location.getLongitude(), accuracy);
            }
            @Override public void onFailure() { notifyNativeSunLocationError(); }
        });
    }

    private void notifyNativeSunLocation(double lat, double lon, double accuracy) {
        if (webView == null) return;
        String accuracyJs = Double.isFinite(accuracy) ? Double.toString(accuracy) : "NaN";
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAINativeSunLocation&&window.LightingAINativeSunLocation(" + lat + "," + lon + "," + accuracyJs + ");",
            null));
    }

    private void notifyNativeSunLocationError() {
        if (webView == null) return;
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAINativeSunLocationError&&window.LightingAINativeSunLocationError();", null));
    }

    private void startNativeSunCompass() {
        if (nativeSunCompass == null) nativeSunCompass = new NativeSunCompass(this);
        boolean started = nativeSunCompass.start(new NativeSunCompass.Callback() {
            @Override public void onHeading(double headingDeg) { notifyNativeSunCompassHeading(headingDeg); }
            @Override public void onUnavailable() { notifyNativeSunCompassStatus(false); }
        });
        if (started) notifyNativeSunCompassStatus(true);
    }

    private void stopNativeSunCompass() {
        if (nativeSunCompass != null) nativeSunCompass.stop();
    }

    private void notifyNativeSunCompassHeading(double headingDeg) {
        if (webView == null) return;
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAINativeSunCompassHeading&&window.LightingAINativeSunCompassHeading(" + headingDeg + ");",
            null));
    }

    private void notifyNativeSunCompassStatus(boolean available) {
        if (webView == null) return;
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAINativeSunCompassStatus&&window.LightingAINativeSunCompassStatus(" + (available ? "true" : "false") + ");",
            null));
    }

    private boolean hasCameraPermission() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.M ||
            checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
    }

    private void requestCameraPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !hasCameraPermission()) {
            requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION);
        } else {
            notifySceneMeasureCameraPermission(true);
        }
    }

    private void notifySceneMeasureCameraPermission(boolean granted) {
        if (webView == null) return;
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAISceneMeasureCameraPermission&&window.LightingAISceneMeasureCameraPermission(" + (granted ? "true" : "false") + ");",
            null));
    }

    void notifyAIVisualImageResult(String quotedAction, boolean ok) {
        if (webView == null) return;
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAIVisualImageResult&&window.LightingAIVisualImageResult(" + quotedAction + "," + (ok ? "true" : "false") + ");",
            null));
    }

    void notifyAIVisualPdfResult(String quotedFilename, boolean ok) {
        if (webView == null) return;
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAIPdfExportResult&&window.LightingAIPdfExportResult(" + (ok ? "true" : "false") + "," + quotedFilename + ");",
            null));
    }

    private void openAIImagePicker(boolean cameraCapture) {
        if (pendingFileChooser != null) finishFileChooser(null);
        pendingCameraCapture = cameraCapture;
        pendingGalleryPersistable = false;
        pendingFileChooser = uris -> {
            Uri uri = uris != null && uris.length > 0 ? uris[0] : null;
            deliverAIVisualImage(uri);
        };
        if (cameraCapture) {
            if (!hasCameraPermission()) {
                pendingPhotoCapturePermission = true;
                requestCameraPermission();
                return;
            }
            openCameraForWebView();
            return;
        }
        openGalleryForWebView(null);
    }

    private void deliverAIVisualImage(Uri uri) {
        if (webView == null) return;
        if (uri == null) {
            webView.post(() -> webView.evaluateJavascript(
                "window.LightingAIVisualImageTransferError&&window.LightingAIVisualImageTransferError();", null));
            return;
        }
        new Thread(() -> {
            Bitmap bitmap = null;
            Bitmap scaled = null;
            try {
                BitmapFactory.Options bounds = new BitmapFactory.Options();
                bounds.inJustDecodeBounds = true;
                try (InputStream input = getContentResolver().openInputStream(uri)) {
                    if (input == null) throw new IllegalStateException("Image input unavailable");
                    BitmapFactory.decodeStream(input, null, bounds);
                }

                int maxSide = Math.max(bounds.outWidth, bounds.outHeight);
                int sample = 1;
                while (maxSide > 0 && maxSide / sample > 1800) sample *= 2;

                BitmapFactory.Options options = new BitmapFactory.Options();
                options.inSampleSize = Math.max(1, sample);
                options.inPreferredConfig = Bitmap.Config.ARGB_8888;
                try (InputStream input = getContentResolver().openInputStream(uri)) {
                    if (input == null) throw new IllegalStateException("Image input unavailable");
                    bitmap = BitmapFactory.decodeStream(input, null, options);
                }
                if (bitmap == null) throw new IllegalStateException("Image decode failed");

                int width = bitmap.getWidth();
                int height = bitmap.getHeight();
                int longest = Math.max(width, height);
                Bitmap output = bitmap;
                if (longest > 1280) {
                    float scale = 1280f / longest;
                    int outW = Math.max(1, Math.round(width * scale));
                    int outH = Math.max(1, Math.round(height * scale));
                    scaled = Bitmap.createScaledBitmap(bitmap, outW, outH, true);
                    output = scaled;
                }

                ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                if (!output.compress(Bitmap.CompressFormat.JPEG, 82, bytes)) {
                    throw new IllegalStateException("Image compression failed");
                }
                String base64 = Base64.encodeToString(bytes.toByteArray(), Base64.NO_WRAP);
                deliverAIVisualImageChunks(base64);
            } catch (Exception e) {
                webView.post(() -> webView.evaluateJavascript(
                    "window.LightingAIVisualImageTransferError&&window.LightingAIVisualImageTransferError();", null));
            } finally {
                if (scaled != null && scaled != bitmap && !scaled.isRecycled()) scaled.recycle();
                if (bitmap != null && !bitmap.isRecycled()) bitmap.recycle();
            }
        }, "LightingAI-AI-Image").start();
    }

    private void deliverAIVisualImageChunks(String base64) {
        if (webView == null || base64 == null || base64.isEmpty()) {
            if (webView != null) webView.post(() -> webView.evaluateJavascript(
                "window.LightingAIVisualImageTransferError&&window.LightingAIVisualImageTransferError();", null));
            return;
        }
        final int chunkSize = 48000;
        final int total = (base64.length() + chunkSize - 1) / chunkSize;
        webView.post(() -> {
            webView.evaluateJavascript(
                "window.LightingAIVisualImageTransferBegin&&window.LightingAIVisualImageTransferBegin(" + total + ");", null);
            for (int i = 0; i < total; i++) {
                int from = i * chunkSize;
                int to = Math.min(base64.length(), from + chunkSize);
                String chunk = JSONObject.quote(base64.substring(from, to));
                webView.evaluateJavascript(
                    "window.LightingAIVisualImageTransferChunk&&window.LightingAIVisualImageTransferChunk(" + i + "," + chunk + ");", null);
            }
            webView.evaluateJavascript(
                "window.LightingAIVisualImageTransferEnd&&window.LightingAIVisualImageTransferEnd();", null);
        });
    }

    private boolean requiresDocumentPicker(WebChromeClient.FileChooserParams params) {
        if (params == null) return false;
        String[] acceptTypes = params.getAcceptTypes();
        if (acceptTypes == null || acceptTypes.length == 0) return false;
        for (String accept : acceptTypes) {
            if (accept == null) continue;
            for (String raw : accept.split(",")) {
                String type = raw == null ? "" : raw.trim().toLowerCase(java.util.Locale.US);
                if (type.isEmpty() || "*/*".equals(type)) continue;
                if ("image/*".equals(type) || type.startsWith("image/")) continue;
                return true;
            }
        }
        return false;
    }

    private String documentMimeType(WebChromeClient.FileChooserParams params) {
        if (params == null) return "*/*";
        String[] acceptTypes = params.getAcceptTypes();
        if (acceptTypes == null) return "*/*";
        for (String accept : acceptTypes) {
            if (accept == null) continue;
            for (String raw : accept.split(",")) {
                String type = raw == null ? "" : raw.trim().toLowerCase(java.util.Locale.US);
                if (".json".equals(type) || type.endsWith("+json")) return "application/json";
                if (type.contains("/") && !type.startsWith("image/") && !"*/*".equals(type)) return type;
            }
        }
        return "*/*";
    }

    private boolean openDocumentForWebView(WebChromeClient.FileChooserParams params) {
        pendingGalleryPersistable = true;
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(documentMimeType(params));
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        try {
            startActivityForResult(intent, CHOOSE_IMAGE);
            return true;
        } catch (ActivityNotFoundException primaryError) {
            try {
                Intent fallback = new Intent(Intent.ACTION_GET_CONTENT);
                fallback.addCategory(Intent.CATEGORY_OPENABLE);
                fallback.setType(documentMimeType(params));
                fallback.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                pendingGalleryPersistable = false;
                startActivityForResult(fallback, CHOOSE_IMAGE);
                return true;
            } catch (Exception ignored) {
                finishFileChooser(null);
                return false;
            }
        }
    }

    private boolean openGalleryForWebView(WebChromeClient.FileChooserParams params) {
        pendingGalleryPersistable = false;
        Intent intent;
        if (Build.VERSION.SDK_INT >= 33) {
            intent = new Intent(MediaStore.ACTION_PICK_IMAGES);
            intent.setType("image/*");
        } else {
            intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            intent.setType("image/*");
        }
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        try {
            startActivityForResult(intent, CHOOSE_IMAGE);
            return true;
        } catch (ActivityNotFoundException primaryError) {
            try {
                Intent fallback = new Intent(Intent.ACTION_GET_CONTENT);
                fallback.setType("image/*");
                fallback.addCategory(Intent.CATEGORY_OPENABLE);
                fallback.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                startActivityForResult(fallback, CHOOSE_IMAGE);
                return true;
            } catch (Exception ignored) {
                finishFileChooser(null);
                return false;
            }
        }
    }

    private boolean openCameraForWebView() {
        pendingPhotoCapturePermission = false;
        pendingGalleryPersistable = false;
        deletePendingCameraUri();
        Intent camera = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        try {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Images.Media.DISPLAY_NAME, "LightingAI_scene_" + System.currentTimeMillis() + ".jpg");
            values.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                values.put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/LightingAI");
            }
            pendingCameraUri = getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
            if (pendingCameraUri == null) throw new IllegalStateException("Could not create camera output URI");

            camera.putExtra(MediaStore.EXTRA_OUTPUT, pendingCameraUri);
            camera.setClipData(ClipData.newRawUri("LightingAI scene", pendingCameraUri));
            camera.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            for (ResolveInfo info : getPackageManager().queryIntentActivities(camera, PackageManager.MATCH_DEFAULT_ONLY)) {
                if (info != null && info.activityInfo != null && info.activityInfo.packageName != null) {
                    grantUriPermission(
                        info.activityInfo.packageName,
                        pendingCameraUri,
                        Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                    );
                }
            }
            startActivityForResult(camera, CHOOSE_IMAGE);
            return true;
        } catch (Exception e) {
            deletePendingCameraUri();
            finishFileChooser(null);
            return false;
        }
    }

    private void persistGalleryAccess(Intent data, Uri[] result) {
        if (!pendingGalleryPersistable || data == null || result == null) return;
        int takeFlags = data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        if (takeFlags == 0) takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION;
        for (Uri uri : result) {
            if (uri == null) continue;
            try { getContentResolver().takePersistableUriPermission(uri, takeFlags); } catch (Exception ignored) {}
        }
    }

    private void finishFileChooser(Uri[] result) {
        ValueCallback<Uri[]> callback = pendingFileChooser;
        pendingFileChooser = null;
        pendingCameraCapture = false;
        pendingPhotoCapturePermission = false;
        pendingGalleryPersistable = false;
        if (callback != null) callback.onReceiveValue(result);
    }

    private void deletePendingCameraUri() {
        if (pendingCameraUri == null) return;
        try { getContentResolver().delete(pendingCameraUri, null, null); } catch (Exception ignored) {}
        pendingCameraUri = null;
    }

    private void applyNavigationInset() {
        if (webView == null) return;
        webView.post(() -> webView.evaluateJavascript(
            "(function(){" +
            "function fit(){var n=document.querySelector('nav');var a=document.querySelector('.app');if(!n||!a)return;" +
            "n.style.bottom='0px';n.style.zIndex='9999';" +
            "var h=Math.ceil(n.getBoundingClientRect().height||84);a.style.paddingBottom=(h+20)+'px';" +
            "if(window.ResizeObserver&&!window.__lightingaiNavObserver){window.__lightingaiNavObserver=new ResizeObserver(fit);window.__lightingaiNavObserver.observe(n);}}" +
            "fit();setTimeout(fit,250);setTimeout(fit,1000);" +
            "})();", null));
    }

    private void installCatalogView() {
        if (webView == null) return;
        webView.evaluateJavascript(
            "(function(){" +
            "if(!document.getElementById('lightingai-catalog-script')){var c=document.createElement('script');c.id='lightingai-catalog-script';c.src='file:///android_asset/catalog.js';document.body.appendChild(c);}" +
            "if(!document.getElementById('lightingai-sun-ui-script')){var s=document.createElement('script');s.id='lightingai-sun-ui-script';s.src='file:///android_asset/sun-ui.js';document.body.appendChild(s);}" +
            "if(!document.getElementById('lightingai-sun-camera-script')){var k=document.createElement('script');k.id='lightingai-sun-camera-script';k.src='file:///android_asset/sun-camera.js';document.body.appendChild(k);}" +
            "if(!document.getElementById('lightingai-sun-shot-planner-script')){var p=document.createElement('script');p.id='lightingai-sun-shot-planner-script';p.src='file:///android_asset/sun-shot-planner.js';document.body.appendChild(p);}" +
            "if(!document.getElementById('lightingai-scene-measure-script')){var m=document.createElement('script');m.id='lightingai-scene-measure-script';m.src='file:///android_asset/scene-measure.js';document.body.appendChild(m);}" +
            "if(!document.getElementById('lightingai-power-calculator-script')){var w=document.createElement('script');w.id='lightingai-power-calculator-script';w.src='file:///android_asset/power-calculator.js';document.body.appendChild(w);}" +
            "if(!document.getElementById('lightingai-light-calculator-script')){var l=document.createElement('script');l.id='lightingai-light-calculator-script';l.src='file:///android_asset/light-calculator.js';document.body.appendChild(l);}" +
            "if(!document.getElementById('lightingai-cct-gel-script')){var g=document.createElement('script');g.id='lightingai-cct-gel-script';g.src='file:///android_asset/cct-gel-calculator.js';document.body.appendChild(g);}" +
            "if(!document.getElementById('lightingai-set-sketch-script')){var q=document.createElement('script');q.id='lightingai-set-sketch-script';q.src='file:///android_asset/set-sketch.js';document.body.appendChild(q);}" +
            "if(!document.getElementById('lightingai-set-sketch-camera-fov-script')){var f=document.createElement('script');f.id='lightingai-set-sketch-camera-fov-script';f.src='file:///android_asset/set-sketch-camera-fov.js';document.body.appendChild(f);}" +
            "if(!document.getElementById('lightingai-blocking-camera-designer-script')){var bc=document.createElement('script');bc.id='lightingai-blocking-camera-designer-script';bc.src='file:///android_asset/blocking-camera-designer.js';document.body.appendChild(bc);}" +
            "if(!document.getElementById('lightingai-set-sketch-sun-script')){var bcs=document.createElement('script');bcs.id='lightingai-set-sketch-sun-script';bcs.src='file:///android_asset/set-sketch-sun.js';document.body.appendChild(bcs);}" +
            "if(!document.getElementById('lightingai-blocking-sun-integration-script')){var bsi=document.createElement('script');bsi.id='lightingai-blocking-sun-integration-script';bsi.src='file:///android_asset/blocking-sun-integration.js';document.body.appendChild(bsi);}" +
            "if(!document.getElementById('lightingai-blocking-ai-integration-script')){var bai=document.createElement('script');bai.id='lightingai-blocking-ai-integration-script';bai.src='file:///android_asset/blocking-ai-integration.js';document.body.appendChild(bai);}" +
            "if(!document.getElementById('lightingai-device-capabilities-script')){var d=document.createElement('script');d.id='lightingai-device-capabilities-script';d.src='file:///android_asset/device-capabilities.js';document.body.appendChild(d);}" +
            "if(!document.getElementById('lightingai-sun-native-bridge-script')){var n=document.createElement('script');n.id='lightingai-sun-native-bridge-script';n.src='file:///android_asset/sun-native-bridge.js';document.body.appendChild(n);}" +
            "if(!document.getElementById('lightingai-artnet-control-script')){var a=document.createElement('script');a.id='lightingai-artnet-control-script';a.src='file:///android_asset/artnet-control.js';document.body.appendChild(a);}" +
            "if(!document.getElementById('lightingai-ble-control-script')){var b=document.createElement('script');b.id='lightingai-ble-control-script';b.src='file:///android_asset/ble-control.js';document.body.appendChild(b);}if(!document.getElementById('lightingai-control-dashboard-script')){var h=document.createElement('script');h.id='lightingai-control-dashboard-script';h.src='file:///android_asset/control-dashboard.js';document.body.appendChild(h);}if(!document.getElementById('lightingai-ai-control-bridge-script')){var j=document.createElement('script');j.id='lightingai-ai-control-bridge-script';j.src='file:///android_asset/ai-control-bridge.js';document.body.appendChild(j);}if(!document.getElementById('lightingai-dmx-patch-script')){var x1=document.createElement('script');x1.id='lightingai-dmx-patch-script';x1.src='file:///android_asset/dmx-patch-planner.js';document.body.appendChild(x1);}if(!document.getElementById('lightingai-dmx-export-script')){var x2=document.createElement('script');x2.id='lightingai-dmx-export-script';x2.src='file:///android_asset/dmx-export.js';document.body.appendChild(x2);}if(!document.getElementById('lightingai-dof-script')){var x3=document.createElement('script');x3.id='lightingai-dof-script';x3.src='file:///android_asset/dof-planner.js';document.body.appendChild(x3);}if(!document.getElementById('lightingai-flicker-script')){var x4=document.createElement('script');x4.id='lightingai-flicker-script';x4.src='file:///android_asset/flicker-shutter-planner.js';document.body.appendChild(x4);}if(!document.getElementById('lightingai-continuity-script')){var x5=document.createElement('script');x5.id='lightingai-continuity-script';x5.src='file:///android_asset/continuity-match-shot.js';document.body.appendChild(x5);}if(!document.getElementById('lightingai-shot-list-script')){var x6=document.createElement('script');x6.id='lightingai-shot-list-script';x6.src='file:///android_asset/shot-list-planner.js';document.body.appendChild(x6);}if(!document.getElementById('lightingai-shot-list-export-script')){var x7=document.createElement('script');x7.id='lightingai-shot-list-export-script';x7.src='file:///android_asset/shot-list-export.js';document.body.appendChild(x7);}if(!document.getElementById('lightingai-cue-script')){var x8=document.createElement('script');x8.id='lightingai-cue-script';x8.src='file:///android_asset/lighting-cue-planner.js';document.body.appendChild(x8);}if(!document.getElementById('lightingai-cue-export-script')){var x9=document.createElement('script');x9.id='lightingai-cue-export-script';x9.src='file:///android_asset/lighting-cue-export.js';document.body.appendChild(x9);}if(!document.getElementById('lightingai-beam-report-script')){var x10=document.createElement('script');x10.id='lightingai-beam-report-script';x10.src='file:///android_asset/beam-coverage-report.js';document.body.appendChild(x10);}if(!document.getElementById('lightingai-camera-snapshots-script')){var x11=document.createElement('script');x11.id='lightingai-camera-snapshots-script';x11.src='file:///android_asset/camera-setup-snapshots.js';document.body.appendChild(x11);}if(!document.getElementById('lightingai-camera-report-script')){var x12=document.createElement('script');x12.id='lightingai-camera-report-script';x12.src='file:///android_asset/camera-setup-report.js';document.body.appendChild(x12);}if(!document.getElementById('lightingai-ratio-script')){var x13=document.createElement('script');x13.id='lightingai-ratio-script';x13.src='file:///android_asset/lighting-ratio.js';document.body.appendChild(x13);}if(!document.getElementById('lightingai-shot-setup-report-script')){var x14=document.createElement('script');x14.id='lightingai-shot-setup-report-script';x14.src='file:///android_asset/shot-setup-report.js';document.body.appendChild(x14);}if(!document.getElementById('lightingai-backup-script')){var x15=document.createElement('script');x15.id='lightingai-backup-script';x15.src='file:///android_asset/project-backup-export.js';document.body.appendChild(x15);}if(!document.getElementById('lightingai-shot-setup-recovery-script')){var x16=document.createElement('script');x16.id='lightingai-shot-setup-recovery-script';x16.src='file:///android_asset/shot-setup-recovery.js';document.body.appendChild(x16);}" +
            "})();", null);
    }

    private void openCreateDocumentFallback(String filename, String text) {
        pendingText = text;
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(filename != null && filename.toLowerCase(java.util.Locale.US).endsWith(".json") ? "application/json" : "text/plain");
        intent.putExtra(Intent.EXTRA_TITLE, filename);
        startActivityForResult(intent, CREATE_FILE);
    }

    private boolean saveTextDirectlyToDownloads(String filename, String text) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return false;
        Uri uri = null;
        try {
            String safeName = (filename == null || filename.trim().isEmpty()) ? ("LightingAI_" + System.currentTimeMillis() + ".txt") : filename.trim();
            String mime = safeName.toLowerCase(java.util.Locale.US).endsWith(".json") ? "application/json" : "text/plain";
            ContentValues values = new ContentValues();
            values.put(MediaStore.MediaColumns.DISPLAY_NAME, safeName);
            values.put(MediaStore.MediaColumns.MIME_TYPE, mime);
            values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
            values.put(MediaStore.MediaColumns.IS_PENDING, 1);
            uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (uri == null) return false;
            try (OutputStream out = getContentResolver().openOutputStream(uri, "w")) {
                if (out == null) throw new IllegalStateException("Could not open Downloads output stream");
                out.write((text == null ? "" : text).getBytes(java.nio.charset.StandardCharsets.UTF_8));
                out.flush();
            }
            ContentValues done = new ContentValues();
            done.put(MediaStore.MediaColumns.IS_PENDING, 0);
            getContentResolver().update(uri, done, null, null);
            final String savedName = safeName;
            runOnUiThread(() -> Toast.makeText(MainActivity.this, "LightingAI: sačuvano u Preuzimanja / Downloads\n" + savedName, Toast.LENGTH_LONG).show());
            return true;
        } catch (Exception e) {
            if (uri != null) {
                try { getContentResolver().delete(uri, null, null); } catch (Exception ignored) {}
            }
            return false;
        }
    }

    private void notifyVoiceInputResult(String targetId, String text) {
        if (webView == null) return;
        final String target = targetId == null ? "aiv-dp-request" : targetId;
        final String targetJs = JSONObject.quote(target);
        final String textJs = JSONObject.quote(text == null ? "" : text);
        if ("aiv-dp-request".equals(target) || "aiv-desc".equals(target)) {
            final String statusIdJs = JSONObject.quote("aiv-desc".equals(target) ? "aiv-desc-voice-status" : "aiv-dp-voice-status");
            final String successJs = JSONObject.quote("aiv-desc".equals(target) ? "Glasovni opis je dodat u opis scene." : "Glasovni zahtev je dodat u polje DP-a.");
            webView.post(() -> webView.evaluateJavascript(
                "(function(){var f=document.getElementById(" + targetJs + ");" +
                "var spoken=String(" + textJs + "||'').trim();" +
                "if(f&&spoken){var existing=String(f.value||'').trim();f.value=existing?(existing+' '+spoken):spoken;" +
                "f.dispatchEvent(new Event('input',{bubbles:true}));var s=document.getElementById(" + statusIdJs + ");" +
                "if(s){s.textContent=" + successJs + ";s.style.color='#b8f0d1';}return true;}" +
                "if(window.LightingAIVoiceInputResult){window.LightingAIVoiceInputResult(" + targetJs + "," + textJs + ");return true;}return false;})();",
                null));
            return;
        }
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAIVoiceInputResult&&window.LightingAIVoiceInputResult(" + targetJs + "," + textJs + ");",
            null));
    }

    private byte[] loadOrCreateSacnCid() {
        SharedPreferences prefs = getSharedPreferences("lightingai_control", MODE_PRIVATE);
        String raw = prefs.getString("sacn_cid", null);
        UUID uuid;
        try {
            uuid = raw == null ? null : UUID.fromString(raw);
        } catch (Exception ignored) {
            uuid = null;
        }
        if (uuid == null) {
            uuid = UUID.randomUUID();
            prefs.edit().putString("sacn_cid", uuid.toString()).apply();
        }
        return ByteBuffer.allocate(16)
            .putLong(uuid.getMostSignificantBits())
            .putLong(uuid.getLeastSignificantBits())
            .array();
    }

    private boolean hasBlePermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return checkSelfPermission(Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED &&
                checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED;
        }
        return hasLocationPermission();
    }

    private void requestBlePermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || hasBlePermission()) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            requestPermissions(
                new String[]{Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_CONNECT},
                BLE_PERMISSION
            );
        } else {
            requestPermissions(
                new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION},
                BLE_PERMISSION
            );
        }
    }

    private void startBleDiscovery(String requestId, int timeoutMs) {
        final String id = requestId == null ? "" : requestId;
        final int boundedTimeout = Math.max(1000, Math.min(10000, timeoutMs));
        if (!hasBlePermission()) {
            pendingBleDiscoveryRequestId = id;
            pendingBleDiscoveryTimeoutMs = boundedTimeout;
            requestBlePermission();
            return;
        }

        pendingBleDiscoveryRequestId = null;
        if (bleDeviceScanner == null) bleDeviceScanner = new BleDeviceScanner(this);
        bleDeviceScanner.discover(boundedTimeout, new BleDeviceScanner.Callback() {
            @Override public void onComplete(JSONArray devices) {
                notifyBleDiscovery(id, devices, "");
            }

            @Override public void onError(String code) {
                notifyBleDiscovery(id, new JSONArray(), code);
            }
        });
    }

    private void notifyBleDiscovery(String requestId, JSONArray devices, String error) {
        if (webView == null) return;
        final String idJs = JSONObject.quote(requestId == null ? "" : requestId);
        final String devicesJs = devices == null ? "[]" : devices.toString();
        final String errJs = JSONObject.quote(error == null ? "" : error);
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAIBleDiscoveryResult&&window.LightingAIBleDiscoveryResult(" + idJs + "," + devicesJs + "," + errJs + ");",
            null));
    }

    private void notifyArtNetResult(String requestId, boolean ok, String message) {
        if (webView == null) return;
        final String idJs = JSONObject.quote(requestId == null ? "" : requestId);
        final String msgJs = JSONObject.quote(message == null ? "" : message);
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAIArtNetResult&&window.LightingAIArtNetResult(" + idJs + "," + (ok ? "true" : "false") + "," + msgJs + ");",
            null));
    }

    private void notifyArtNetDiscovery(String requestId, JSONArray nodes, String error) {
        if (webView == null) return;
        final String idJs = JSONObject.quote(requestId == null ? "" : requestId);
        final String nodesJs = nodes == null ? "[]" : nodes.toString();
        final String errJs = JSONObject.quote(error == null ? "" : error);
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAIArtNetDiscoveryResult&&window.LightingAIArtNetDiscoveryResult(" + idJs + "," + nodesJs + "," + errJs + ");",
            null));
    }

    private void notifyVoiceInputError(String targetId, String code) {
        if (webView == null) return;
        final String target = targetId == null ? "aiv-dp-request" : targetId;
        final String targetJs = JSONObject.quote(target);
        final String codeJs = JSONObject.quote(code == null ? "error" : code);
        if ("aiv-dp-request".equals(target) || "aiv-desc".equals(target)) {
            final String statusIdJs = JSONObject.quote("aiv-desc".equals(target) ? "aiv-desc-voice-status" : "aiv-dp-voice-status");
            webView.post(() -> webView.evaluateJavascript(
                "(function(){var s=document.getElementById(" + statusIdJs + ");" +
                "if(s){var c=" + codeJs + ";s.textContent=c==='cancelled'?'Glasovni unos je otkazan.':(c==='empty'?'Nije prepoznat govor. Pokušaj ponovo.':'Glasovni unos nije dostupan na ovom telefonu.');" +
                "s.style.color=c==='cancelled'?'#b8f0d1':'#ffb5b5';return true;}" +
                "if(window.LightingAIVoiceInputError){window.LightingAIVoiceInputError(" + targetJs + "," + codeJs + ");return true;}return false;})();",
                null));
            return;
        }
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAIVoiceInputError&&window.LightingAIVoiceInputError(" + targetJs + "," + codeJs + ");",
            null));
    }

    private boolean hasAudioPermission() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.M ||
            checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
    }

    private void requestAudioPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !hasAudioPermission()) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, AUDIO_PERMISSION);
        }
    }

    private void startSpeechInput(String language, String targetId) {
        String target = (targetId == null || targetId.trim().isEmpty()) ? "aiv-dp-request" : targetId.trim();
        pendingVoiceTarget = target;
        pendingVoiceLanguage = "en".equals(language) ? "en" : "sr";
        startExternalSpeechInput(pendingVoiceLanguage, target);
    }

    private void startNativeSpeechInput(String language, String target) {
        String locale = "en".equals(language) ? "en-US" : "sr-RS";
        boolean onDeviceAvailable = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
            SpeechRecognizer.isOnDeviceRecognitionAvailable(this);
        if (!onDeviceAvailable && !SpeechRecognizer.isRecognitionAvailable(this)) {
            notifyVoiceInputError(target, "unavailable");
            return;
        }
        try {
            if (speechRecognizer != null) {
                try { speechRecognizer.destroy(); } catch (Exception ignored) {}
            }
            speechRecognizer = onDeviceAvailable
                ? SpeechRecognizer.createOnDeviceSpeechRecognizer(this)
                : SpeechRecognizer.createSpeechRecognizer(this);
            speechRecognizer.setRecognitionListener(new RecognitionListener() {
                @Override public void onReadyForSpeech(Bundle params) {}
                @Override public void onBeginningOfSpeech() {}
                @Override public void onRmsChanged(float rmsdB) {}
                @Override public void onBufferReceived(byte[] buffer) {}
                @Override public void onEndOfSpeech() {}
                @Override public void onPartialResults(Bundle partialResults) {}
                @Override public void onEvent(int eventType, Bundle params) {}
                @Override public void onError(int error) {
                    String activeTarget = pendingVoiceTarget;
                    pendingVoiceTarget = null;
                    if (activeTarget == null) activeTarget = target;
                    String code = (error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT) ? "empty" :
                        (error == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS ? "denied" : "error");
                    notifyVoiceInputError(activeTarget, code);
                }
                @Override public void onResults(Bundle results) {
                    String activeTarget = pendingVoiceTarget;
                    pendingVoiceTarget = null;
                    if (activeTarget == null) activeTarget = target;
                    ArrayList<String> matches = results == null ? null : results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (matches != null && !matches.isEmpty() && matches.get(0) != null && !matches.get(0).trim().isEmpty()) {
                        notifyVoiceInputResult(activeTarget, matches.get(0).trim());
                    } else {
                        notifyVoiceInputError(activeTarget, "empty");
                    }
                }
            });
            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, locale);
            intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
            intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);
            speechRecognizer.startListening(intent);
        } catch (Exception e) {
            pendingVoiceTarget = null;
            notifyVoiceInputError(target, "error");
        }
    }

    private void fallbackToNativeSpeech(String language, String target) {
        pendingVoiceTarget = target;
        pendingVoiceLanguage = "en".equals(language) ? "en" : "sr";
        if (!hasAudioPermission()) {
            requestAudioPermission();
            return;
        }
        webView.postDelayed(() -> startNativeSpeechInput(pendingVoiceLanguage, target), 250);
    }

    private void startExternalSpeechInput(String language, String target) {
        String locale = "en".equals(language) ? "en-US" : "sr-RS";
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, locale);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
        boolean sceneDescription = "aiv-desc".equals(target) || "planner-description".equals(target);
        intent.putExtra(RecognizerIntent.EXTRA_PROMPT,
            sceneDescription
                ? ("en".equals(language) ? "Describe the scene" : "Opiši scenu")
                : ("en".equals(language) ? "Describe the DP lighting request" : "Izgovori zahtev DP-a za rasvetu"));
        pendingVoiceTarget = target;
        try {
            startActivityForResult(intent, SPEECH_INPUT);
        } catch (ActivityNotFoundException e) {
            fallbackToNativeSpeech(language, target);
        } catch (Exception e) {
            fallbackToNativeSpeech(language, target);
        }
    }

    public class AndroidBridge {
        @JavascriptInterface public void saveText(String filename, String text) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                new Thread(() -> {
                    if (!saveTextDirectlyToDownloads(filename, text)) {
                        runOnUiThread(() -> openCreateDocumentFallback(filename, text));
                    }
                }, "LightingAI-DownloadsSave").start();
                return;
            }
            runOnUiThread(() -> openCreateDocumentFallback(filename, text));
        }

        @JavascriptInterface public void shareText(String title, String text, String chooserTitle) {
            runOnUiThread(() -> {
                try {
                    Intent share = new Intent(Intent.ACTION_SEND);
                    share.setType("text/plain");
                    share.putExtra(Intent.EXTRA_SUBJECT, title == null ? "LightingAI" : title);
                    share.putExtra(Intent.EXTRA_TEXT, text == null ? "" : text);
                    startActivity(Intent.createChooser(share, chooserTitle == null ? "Share LightingAI" : chooserTitle));
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface public void requestLocationPermission() {
            runOnUiThread(() -> MainActivity.this.requestLocationPermission());
        }

        @JavascriptInterface public boolean hasLocationPermission() {
            return MainActivity.this.hasLocationPermission();
        }

        @JavascriptInterface public void requestNativeSunLocation() {
            runOnUiThread(() -> MainActivity.this.requestNativeSunLocation());
        }

        @JavascriptInterface public void startNativeSunCompass() {
            runOnUiThread(() -> MainActivity.this.startNativeSunCompass());
        }

        @JavascriptInterface public void stopNativeSunCompass() {
            runOnUiThread(() -> MainActivity.this.stopNativeSunCompass());
        }

        @JavascriptInterface public void requestCameraPermission() {
            runOnUiThread(() -> MainActivity.this.requestCameraPermission());
        }

        @JavascriptInterface public void openImagePicker(String mode) {
            runOnUiThread(() -> MainActivity.this.openAIImagePicker("camera".equals(mode)));
        }

        @JavascriptInterface public boolean hasCameraPermission() {
            return MainActivity.this.hasCameraPermission();
        }

        @JavascriptInterface public String getDeviceCapabilities() {
            return DeviceCapabilities.toJson(MainActivity.this);
        }

        @JavascriptInterface public void startSceneMeasure(double cameraHeight, String language) {
            runOnUiThread(() -> {
                Intent intent = new Intent(MainActivity.this, MeasureActivity.class);
                intent.putExtra("cameraHeight", cameraHeight);
                intent.putExtra("lang", "en".equals(language) ? "en" : "sr");
                startActivityForResult(intent, MEASURE_SCENE);
            });
        }

        @JavascriptInterface public void startSpeechInput(String language, String targetId) {
            runOnUiThread(() -> MainActivity.this.startSpeechInput("en".equals(language) ? "en" : "sr", targetId));
        }

        @JavascriptInterface public boolean hasBlePermission() {
            return MainActivity.this.hasBlePermission();
        }

        @JavascriptInterface public void bleDiscover(String requestId, int timeoutMs) {
            runOnUiThread(() -> MainActivity.this.startBleDiscovery(requestId, timeoutMs));
        }

        @JavascriptInterface public String networkDmxDiagnostics() {
            try {
                JSONObject out = new JSONObject();
                out.put("platform", "android");
                out.put("timestampMs", System.currentTimeMillis());

                out.put("interfaces", NetworkInterfaceInspector.snapshot());

                JSONObject artNet = new JSONObject();
                artNet.put("directSent", artNetDirectSent.get());
                artNet.put("directFailed", artNetDirectFailed.get());
                artNet.put("directLastAtMs", artNetDirectLastAtMs.get());
                artNet.put("directLastError", artNetDirectLastError == null ? "" : artNetDirectLastError);
                artNet.put("liveFrames", artNetLiveEngine.activeFrameCount());
                artNet.put("livePacketsSent", artNetLiveEngine.packetsSent());
                artNet.put("livePacketsFailed", artNetLiveEngine.packetsFailed());
                artNet.put("liveLastSendAtMs", artNetLiveEngine.lastSendAtMs());
                artNet.put("liveLastError", artNetLiveEngine.lastError());
                out.put("artNet", artNet);

                JSONObject sacn = new JSONObject();
                sacn.put("directSent", sacnDirectSent.get());
                sacn.put("directFailed", sacnDirectFailed.get());
                sacn.put("directLastAtMs", sacnDirectLastAtMs.get());
                sacn.put("directLastError", sacnDirectLastError == null ? "" : sacnDirectLastError);
                sacn.put("liveFrames", sacnLiveEngine == null ? 0 : sacnLiveEngine.activeFrameCount());
                sacn.put("livePacketsSent", sacnLiveEngine == null ? 0 : sacnLiveEngine.packetsSent());
                sacn.put("livePacketsFailed", sacnLiveEngine == null ? 0 : sacnLiveEngine.packetsFailed());
                sacn.put("liveLastSendAtMs", sacnLiveEngine == null ? 0 : sacnLiveEngine.lastSendAtMs());
                sacn.put("liveLastError", sacnLiveEngine == null ? "" : sacnLiveEngine.lastError());
                sacn.put("priority", sacnPriority.get());
                out.put("sacn", sacn);
                return out.toString();
            } catch (Exception e) {
                return "{}";
            }
        }

        @JavascriptInterface public void sacnSetPriority(int priority) {
            int value = SacnSender.normalizePriority(priority);
            sacnPriority.set(value);
            if (sacnLiveEngine == null) sacnLiveEngine = new SacnLiveEngine(sacnCid, "LightingAI");
            sacnLiveEngine.setPriority(value);
        }

        @JavascriptInterface public void sacnSendDmx(String requestId, int universe, String channelsJson) {
            final String id = requestId == null ? "" : requestId;
            final int u = Math.max(SacnSender.MIN_UNIVERSE, Math.min(SacnSender.MAX_UNIVERSE, universe));
            final String raw = channelsJson == null ? "[]" : channelsJson;
            new Thread(() -> {
                boolean ok = false;
                String message = "";
                try {
                    JSONArray a = new JSONArray(raw);
                    int count = Math.min(512, a.length());
                    int[] channels = new int[count];
                    for (int i = 0; i < count; i++) channels[i] = Math.max(0, Math.min(255, a.optInt(i, 0)));
                    int seq = sacnSequence.getAndUpdate(v -> v >= 255 ? 0 : v + 1);
                    SacnSender.sendDmx(u, channels, seq, sacnCid, "LightingAI", sacnPriority.get());
                    sacnDirectSent.incrementAndGet();
                    sacnDirectLastAtMs.set(System.currentTimeMillis());
                    sacnDirectLastError = "";
                    ok = true;
                } catch (Exception e) {
                    sacnDirectFailed.incrementAndGet();
                    sacnDirectLastError = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
                    message = e.getMessage() == null ? "sACN send failed" : e.getMessage();
                }
                notifyArtNetResult(id, ok, message);
            }, "LightingAI-sACN").start();
        }

        @JavascriptInterface public void sacnSetLiveDmx(String requestId, int universe, String channelsJson) {
            final String id = requestId == null ? "" : requestId;
            final int u = Math.max(SacnSender.MIN_UNIVERSE, Math.min(SacnSender.MAX_UNIVERSE, universe));
            final String raw = channelsJson == null ? "[]" : channelsJson;
            new Thread(() -> {
                boolean ok = false;
                String message = "";
                try {
                    JSONArray a = new JSONArray(raw);
                    int count = Math.min(512, a.length());
                    int[] channels = new int[count];
                    for (int i = 0; i < count; i++) channels[i] = Math.max(0, Math.min(255, a.optInt(i, 0)));
                    if (sacnLiveEngine == null) sacnLiveEngine = new SacnLiveEngine(sacnCid, "LightingAI");
                    sacnLiveEngine.setPriority(sacnPriority.get());
                    sacnLiveEngine.setFrame(u, channels);
                    ok = true;
                } catch (Exception e) {
                    message = e.getMessage() == null ? "sACN live refresh failed" : e.getMessage();
                }
                notifyArtNetResult(id, ok, message);
            }, "LightingAI-sACN-Live-Update").start();
        }

        @JavascriptInterface public void sacnStopLive(String requestId) {
            final String id = requestId == null ? "" : requestId;
            if (sacnLiveEngine != null) sacnLiveEngine.stopAll();
            notifyArtNetResult(id, true, "");
        }

        @JavascriptInterface public int sacnLiveFrameCount() {
            return sacnLiveEngine == null ? 0 : sacnLiveEngine.activeFrameCount();
        }

        @JavascriptInterface public void artNetDiscover(String requestId, int timeoutMs) {
            final String id = requestId == null ? "" : requestId;
            new Thread(() -> {
                JSONArray result = new JSONArray();
                String error = "";
                try {
                    for (ArtNetDiscovery.Node node : ArtNetDiscovery.discover(timeoutMs)) {
                        JSONObject item = new JSONObject();
                        item.put("ip", node.ip);
                        item.put("shortName", node.shortName);
                        item.put("longName", node.longName);
                        result.put(item);
                    }
                } catch (Exception e) {
                    error = e.getMessage() == null ? "Art-Net discovery failed" : e.getMessage();
                }
                notifyArtNetDiscovery(id, result, error);
            }, "LightingAI-ArtNet-Discovery").start();
        }

        @JavascriptInterface public void artNetSendDmx(String requestId, String targetIp, int universe, String channelsJson) {
            final String id = requestId == null ? "" : requestId;
            final String ip = targetIp == null ? "" : targetIp;
            final int u = Math.max(1, universe);
            final String raw = channelsJson == null ? "[]" : channelsJson;
            new Thread(() -> {
                boolean ok = false;
                String message = "";
                try {
                    JSONArray a = new JSONArray(raw);
                    int count = Math.min(512, a.length());
                    int[] channels = new int[count];
                    for (int i = 0; i < count; i++) channels[i] = Math.max(0, Math.min(255, a.optInt(i, 0)));
                    int seq = artNetSequence.getAndUpdate(v -> v >= 255 ? 1 : v + 1);
                    ArtNetSender.sendDmx(ip, u, channels, seq);
                    artNetDirectSent.incrementAndGet();
                    artNetDirectLastAtMs.set(System.currentTimeMillis());
                    artNetDirectLastError = "";
                    ok = true;
                } catch (Exception e) {
                    artNetDirectFailed.incrementAndGet();
                    artNetDirectLastError = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
                    message = e.getMessage() == null ? "Art-Net send failed" : e.getMessage();
                }
                notifyArtNetResult(id, ok, message);
            }, "LightingAI-ArtNet").start();
        }

        @JavascriptInterface public void artNetSetLiveDmx(String requestId, String targetIp, int universe, String channelsJson) {
            final String id = requestId == null ? "" : requestId;
            final String ip = targetIp == null ? "" : targetIp;
            final int u = Math.max(1, universe);
            final String raw = channelsJson == null ? "[]" : channelsJson;
            new Thread(() -> {
                boolean ok = false;
                String message = "";
                try {
                    JSONArray a = new JSONArray(raw);
                    int count = Math.min(512, a.length());
                    int[] channels = new int[count];
                    for (int i = 0; i < count; i++) channels[i] = Math.max(0, Math.min(255, a.optInt(i, 0)));
                    artNetLiveEngine.setFrame(ip, u, channels);
                    ok = true;
                } catch (Exception e) {
                    message = e.getMessage() == null ? "Art-Net live refresh failed" : e.getMessage();
                }
                notifyArtNetResult(id, ok, message);
            }, "LightingAI-ArtNet-Live-Update").start();
        }

        @JavascriptInterface public void artNetStopLive(String requestId) {
            final String id = requestId == null ? "" : requestId;
            artNetLiveEngine.stopAll();
            notifyArtNetResult(id, true, "");
        }

        @JavascriptInterface public int artNetLiveFrameCount() {
            return artNetLiveEngine.activeFrameCount();
        }
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == CAMERA_PERMISSION) {
            boolean granted = hasCameraPermission();
            notifySceneMeasureCameraPermission(granted);
            if (pendingPhotoCapturePermission) {
                pendingPhotoCapturePermission = false;
                if (granted && pendingFileChooser != null) openCameraForWebView();
                else finishFileChooser(null);
            }
        } else if (requestCode == LOCATION_PERMISSION) {
            if (pendingNativeSunLocation) {
                if (hasLocationPermission()) requestNativeSunLocation();
                else { pendingNativeSunLocation = false; notifyNativeSunLocationError(); }
            }
            if (webView != null) {
                webView.post(() -> webView.evaluateJavascript(
                    "window.LightingAIRefreshDeviceCapabilities&&window.LightingAIRefreshDeviceCapabilities();",
                    null));
            }
        } else if (requestCode == BLE_PERMISSION) {
            String pendingId = pendingBleDiscoveryRequestId;
            int pendingTimeout = pendingBleDiscoveryTimeoutMs;
            pendingBleDiscoveryRequestId = null;
            if (pendingId != null) {
                if (hasBlePermission()) startBleDiscovery(pendingId, pendingTimeout);
                else notifyBleDiscovery(pendingId, new JSONArray(), "ble_permission_denied");
            }
        } else if (requestCode == AUDIO_PERMISSION) {
            String target = pendingVoiceTarget;
            if (target != null) {
                if (hasAudioPermission()) {
                    webView.postDelayed(() -> startNativeSpeechInput(pendingVoiceLanguage, target), 250);
                } else {
                    pendingVoiceTarget = null;
                    notifyVoiceInputError(target, "denied");
                }
            }
        }
    }

    @Override protected void onPause() {
        stopNativeSunCompass();
        artNetLiveEngine.stopAll();
        if (sacnLiveEngine != null) sacnLiveEngine.stopAll();
        if (bleDeviceScanner != null) bleDeviceScanner.stop();
        super.onPause();
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == SPEECH_INPUT) {
            String target = pendingVoiceTarget;
            pendingVoiceTarget = null;
            if (resultCode == RESULT_OK && data != null) {
                ArrayList<String> results = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                if (results != null && !results.isEmpty() && results.get(0) != null && !results.get(0).trim().isEmpty()) {
                    notifyVoiceInputResult(target, results.get(0).trim());
                } else {
                    notifyVoiceInputError(target, "empty");
                }
            } else {
                notifyVoiceInputError(target, "cancelled");
            }
            return;
        }

        if (requestCode == MEASURE_SCENE) {
            if (resultCode == RESULT_OK && data != null && webView != null) {
                String target = data.getStringExtra("target");
                double distance = data.getDoubleExtra("distance", Double.NaN);
                double angle = data.getDoubleExtra("angle", Double.NaN);
                double cameraHeight = data.getDoubleExtra("cameraHeight", 1.50);
                if (target != null) {
                    String safeTarget = target.replace("'", "");
                    webView.post(() -> webView.evaluateJavascript(
                        "window.LightingAISceneMeasureNativeResult&&window.LightingAISceneMeasureNativeResult('" + safeTarget + "'," + distance + "," + angle + "," + cameraHeight + ");",
                        null));
                }
            }
            return;
        }

        if (requestCode == CHOOSE_IMAGE) {
            if (resultCode == RESULT_OK) {
                if (pendingCameraCapture && pendingCameraUri != null) {
                    Uri uri = pendingCameraUri;
                    pendingCameraUri = null;
                    finishFileChooser(new Uri[]{uri});
                } else {
                    Uri[] result = null;
                    if (data != null && data.getData() != null) {
                        result = new Uri[]{data.getData()};
                    }
                    if ((result == null || result.length == 0) && data != null && data.getClipData() != null) {
                        ClipData clip = data.getClipData();
                        ArrayList<Uri> picked = new ArrayList<>();
                        for (int i = 0; i < clip.getItemCount(); i++) {
                            Uri pickedUri = clip.getItemAt(i) == null ? null : clip.getItemAt(i).getUri();
                            if (pickedUri != null && !picked.contains(pickedUri)) picked.add(pickedUri);
                        }
                        if (!picked.isEmpty()) result = picked.toArray(new Uri[0]);
                    }
                    if (result == null || result.length == 0) {
                        result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
                    }
                    persistGalleryAccess(data, result);
                    finishFileChooser(result);
                }
            } else {
                deletePendingCameraUri();
                finishFileChooser(null);
            }
            return;
        }

        if (requestCode == CREATE_FILE && resultCode == RESULT_OK && data != null && pendingText != null) {
            Uri uri = data.getData();
            try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                if (out != null) out.write(pendingText.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            } catch (Exception ignored) {}
            pendingText = null;
        }
    }

    @Override protected void onDestroy() {
        artNetLiveEngine.stopAll();
        if (pendingFileChooser != null) finishFileChooser(null);
        if (nativeSunCompass != null) nativeSunCompass.stop();
        if (nativeSunLocation != null) nativeSunLocation.cancel();
        if (bleDeviceScanner != null) bleDeviceScanner.stop();
        if (speechRecognizer != null) {
            try { speechRecognizer.destroy(); } catch (Exception ignored) {}
            speechRecognizer = null;
        }
        super.onDestroy();
    }

    private void finishBackFallback() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        webView.evaluateJavascript(
            "(function(){try{return !!(window.LightingAIHandleBack&&window.LightingAIHandleBack());}catch(e){return false;}})();",
            value -> {
                if ("true".equals(value)) return;
                finishBackFallback();
            }
        );
    }
}
