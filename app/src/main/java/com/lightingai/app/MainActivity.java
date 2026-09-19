package com.lightingai.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.location.Location;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.speech.RecognizerIntent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import org.json.JSONObject;
import org.json.JSONArray;
import java.io.OutputStream;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.ArrayList;

public class MainActivity extends Activity {
    private WebView webView;
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
    private final AtomicInteger artNetSequence = new AtomicInteger(1);
    private final ArtNetLiveEngine artNetLiveEngine = new ArtNetLiveEngine();

    private static final int CREATE_FILE = 501;
    private static final int CHOOSE_IMAGE = 502;
    private static final int LOCATION_PERMISSION = 503;
    private static final int CAMERA_PERMISSION = 504;
    private static final int MEASURE_SCENE = 505;
    private static final int SPEECH_INPUT = 506;

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(13, 15, 18));
        getWindow().setNavigationBarColor(Color.rgb(13, 15, 18));
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(13, 15, 18));
        setContentView(webView);
        nativeSunLocation = new NativeSunLocation(this);
        nativeSunCompass = new NativeSunCompass(this);
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
        webView.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                applyNavigationInset();
                installCatalogView();
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
                return openGalleryForWebView(fileChooserParams);
            }
        });
        webView.addJavascriptInterface(new AndroidBridge(), "Android");
        webView.addJavascriptInterface(new AIVisualImageBridge(this), "LightingAIImages");
        webView.loadUrl("file:///android_asset/index.html");
        webView.requestApplyInsets();
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

    private boolean openGalleryForWebView(WebChromeClient.FileChooserParams params) {
        pendingGalleryPersistable = false;
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("image/*");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        if (params != null && params.getMode() == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE) {
            intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
        }
        try {
            startActivityForResult(intent, CHOOSE_IMAGE);
            pendingGalleryPersistable = true;
            return true;
        } catch (ActivityNotFoundException e) {
            try {
                Intent fallback = new Intent(Intent.ACTION_GET_CONTENT);
                fallback.addCategory(Intent.CATEGORY_OPENABLE);
                fallback.setType("image/*");
                fallback.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                if (params != null && params.getMode() == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE) {
                    fallback.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                }
                startActivityForResult(fallback, CHOOSE_IMAGE);
                pendingGalleryPersistable = false;
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
            "if(!document.getElementById('lightingai-device-capabilities-script')){var d=document.createElement('script');d.id='lightingai-device-capabilities-script';d.src='file:///android_asset/device-capabilities.js';document.body.appendChild(d);}" +
            "if(!document.getElementById('lightingai-sun-native-bridge-script')){var n=document.createElement('script');n.id='lightingai-sun-native-bridge-script';n.src='file:///android_asset/sun-native-bridge.js';document.body.appendChild(n);}" +
            "if(!document.getElementById('lightingai-artnet-control-script')){var a=document.createElement('script');a.id='lightingai-artnet-control-script';a.src='file:///android_asset/artnet-control.js';document.body.appendChild(a);}" +
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
        final String targetJs = JSONObject.quote(targetId == null ? "aiv-dp-request" : targetId);
        final String textJs = JSONObject.quote(text == null ? "" : text);
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAIVoiceInputResult&&window.LightingAIVoiceInputResult(" + targetJs + "," + textJs + ");",
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
        final String targetJs = JSONObject.quote(targetId == null ? "aiv-dp-request" : targetId);
        final String codeJs = JSONObject.quote(code == null ? "error" : code);
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAIVoiceInputError&&window.LightingAIVoiceInputError(" + targetJs + "," + codeJs + ");",
            null));
    }

    private void startSpeechInput(String language, String targetId) {
        String target = (targetId == null || targetId.trim().isEmpty()) ? "aiv-dp-request" : targetId.trim();
        String locale = "en".equals(language) ? "en-US" : "sr-RS";
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, locale);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
        boolean sceneDescription = "aiv-desc".equals(target);
        intent.putExtra(RecognizerIntent.EXTRA_PROMPT,
            sceneDescription
                ? ("en".equals(language) ? "Describe the scene look" : "Opiši izgled scene")
                : ("en".equals(language) ? "Describe the DP lighting request" : "Izgovori zahtev DP-a za rasvetu"));
        pendingVoiceTarget = target;
        try {
            startActivityForResult(intent, SPEECH_INPUT);
        } catch (ActivityNotFoundException e) {
            pendingVoiceTarget = null;
            notifyVoiceInputError(target, "unavailable");
        } catch (Exception e) {
            pendingVoiceTarget = null;
            notifyVoiceInputError(target, "error");
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
                    ok = true;
                } catch (Exception e) {
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
        } else if (requestCode == LOCATION_PERMISSION && pendingNativeSunLocation) {
            if (hasLocationPermission()) requestNativeSunLocation();
            else { pendingNativeSunLocation = false; notifyNativeSunLocationError(); }
        }
    }

    @Override protected void onPause() {
        stopNativeSunCompass();
        artNetLiveEngine.stopAll();
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
                    Uri[] result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
                    if ((result == null || result.length == 0) && data != null && data.getData() != null) {
                        result = new Uri[]{data.getData()};
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
        super.onDestroy();
    }

    @Override public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
}
