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
import android.webkit.RenderProcessGoneDetail;
import android.widget.Toast;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.style.ForegroundColorSpan;
import android.util.Base64;
import android.util.AtomicFile;
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
    private volatile boolean recoveryOriginTrusted = false;
    private AIVisualDraftStore aiVisualDraftStore;
    private AIVisualDraftStore visualDraftStore() { if(aiVisualDraftStore==null)aiVisualDraftStore=new AIVisualDraftStore(getNoBackupFilesDir());return aiVisualDraftStore; }
    private WebView webView;
    private boolean recoveringWebView;
    private long plannerFocusGeneration;
    private long plannerFocusVisualReady;
    private int rendererRecoveryAttempts;
    private TextView rendererRecoveryNotice;
    private FrameLayout rootView;
    private View startupSplash;
    private String pendingText = null;
    private String pendingAiMp4TaskId = null;
    private String pendingAiMp4AccessToken = null;
    private ValueCallback<Uri[]> pendingFileChooser = null;
    private Uri pendingCameraUri = null;
    private final ArrayList<Uri> scenePlannerCaptureUris = new ArrayList<>();
    private boolean pendingCameraCapture = false;
    private boolean pendingVideoCapture = false;
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
    // First release: retain transport implementations, but reject every JS control entry point.
    private boolean isDirectLightingControlEnabled() { return false; }
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
    private static final int SAVE_AI_SCENE_MP4 = 509;
    private static final int SAVE_SCENE_BACKUP = 510;
    private String pendingSceneBackupText = null;
    private String pendingSceneBackupRequest = null;
    private volatile BackupPasswordJob backupPasswordJob;
    private android.app.AlertDialog backupPasswordDialog;
    private static final long MAX_AI_MP4_BYTES = 140L * 1024L * 1024L;

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        cleanupExpiredScenePlannerCaptures();
        getWindow().setStatusBarColor(Color.rgb(13, 15, 18));
        getWindow().setNavigationBarColor(Color.rgb(13, 15, 18));
        rootView = new FrameLayout(this);
        rootView.setBackgroundColor(Color.BLACK);
        startupSplash = createStartupSplash();
        rootView.addView(startupSplash, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));
        setContentView(rootView);
        nativeSunLocation = new NativeSunLocation(this);
        nativeSunCompass = new NativeSunCompass(this);
        // Do not initialize fixture-control transports in the first release.
        if (isDirectLightingControlEnabled()) {
            sacnCid = loadOrCreateSacnCid();
            sacnLiveEngine = new SacnLiveEngine(sacnCid, "LightingAI");
            sacnLiveEngine.setPriority(sacnPriority.get());
            bleDeviceScanner = new BleDeviceScanner(this);
        }
        createPlannerWebView(true);
    }

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    private void createPlannerWebView(boolean initialLaunch) {
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(13, 15, 18));
        rootView.addView(webView, 0, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ));
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
            @Override public void onPageStarted(WebView view, String url, Bitmap favicon) {
                recoveryOriginTrusted = "file:///android_asset/index.html".equals(url) ||
                    (url != null && url.startsWith("file:///android_asset/index.html?"));
                super.onPageStarted(view, url, favicon);
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (view != webView) return;
                super.onPageFinished(view, url);
                applyNavigationInset();
                installCatalogView();
                hideStartupSplashAfterDelay();
                resumePlannerView();
                view.postVisualStateCallback(0, new WebView.VisualStateCallback() {
                    @Override public void onComplete(long requestId) {
                        if (view != webView) return;
                        recoveringWebView = false;
                        if (rendererRecoveryNotice != null) {
                            rootView.removeView(rendererRecoveryNotice);
                            rendererRecoveryNotice = null;
                        }
                    }
                });
            }
            @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                if (view == webView && !isFinishing() && !isDestroyed()) recoverPlannerRenderer(view);
                return true;
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
                pendingVideoCapture = false;
                if (fileChooserParams != null && fileChooserParams.getAcceptTypes() != null) {
                    for (String mime : fileChooserParams.getAcceptTypes()) {
                        if (mime != null && mime.toLowerCase(java.util.Locale.US).contains("video")) {
                            pendingVideoCapture = true;
                            break;
                        }
                    }
                }
                pendingGalleryPersistable = false;

                if (pendingCameraCapture) {
                    if (!hasCameraPermission()) {
                        pendingPhotoCapturePermission = true;
                        requestCameraPermission();
                        return true;
                    }
                    return pendingVideoCapture ? openVideoForWebView() : openCameraForWebView();
                }
                if (fileChooserParams != null && fileChooserParams.getAcceptTypes() != null) {
                    for (String accept : fileChooserParams.getAcceptTypes()) {
                        if (accept != null && (accept.contains("application/json") || accept.contains(".json"))) {
                            try {
                                Intent document = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                                document.addCategory(Intent.CATEGORY_OPENABLE); document.setType("application/json");
                                document.putExtra(Intent.EXTRA_LOCAL_ONLY, true);
                                document.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                                startActivityForResult(document, CHOOSE_IMAGE);
                                return true;
                            } catch (RuntimeException error) { finishFileChooser(null); return false; }
                        }
                    }
                }
                return openGalleryForWebView(fileChooserParams);
            }
        });
        webView.addJavascriptInterface(new AndroidBridge(), "Android");
        webView.addJavascriptInterface(new AIVisualImageBridge(this), "LightingAIImages");
        final WebView created = webView;
        created.postDelayed(() -> {
            if (created == webView && !isFinishing() && !isDestroyed())
                created.loadUrl("file:///android_asset/index.html?rev=lightai-native-splash-v4");
        }, initialLaunch ? 3350 : 0);
        created.requestApplyInsets();
    }

    private void resumePlannerView() {
        if (webView == null) return;
        webView.onResume();
        webView.requestApplyInsets();
        webView.requestLayout();
        webView.invalidate();
        if (recoveryOriginTrusted) webView.evaluateJavascript(
            "(function(){var p=window.LightingAIScenePlanner;if(p&&p.resume)p.resume();})()", null);
    }

    @Override public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        final long generation = ++plannerFocusGeneration;
        if (!hasFocus || webView == null) return;
        final WebView target = webView;
        // onResume may precede the new window surface. Wait for its focus/frame boundary.
        target.postOnAnimation(() -> requestPlannerFocusFrame(target, generation, 0));
    }

    private boolean isPlannerFocusCurrent(WebView target, long generation) {
        return generation == plannerFocusGeneration && target == webView &&
            !isFinishing() && !isDestroyed() && !recoveringWebView &&
            hasWindowFocus() && target.isAttachedToWindow() && target.isShown() &&
            target.getWidth() > 0 && target.getHeight() > 0;
    }

    private void requestPlannerFocusFrame(WebView target, long generation, int attempt) {
        if (!isPlannerFocusCurrent(target, generation) || plannerFocusVisualReady == generation) return;
        // This acknowledges DOM readiness for a draw, NOT video pixels or display presentation.
        target.postVisualStateCallback(generation, new WebView.VisualStateCallback() {
            @Override public void onComplete(long requestId) {
                if (!isPlannerFocusCurrent(target, generation) || plannerFocusVisualReady == generation) return;
                plannerFocusVisualReady = generation;
                rootView.postInvalidateOnAnimation();
                target.postInvalidateOnAnimation();
            }
        });
        target.postDelayed(() -> {
            if (!isPlannerFocusCurrent(target, generation) || plannerFocusVisualReady == generation) return;
            if (attempt == 0) requestPlannerFocusFrame(target, generation, 1);
            else android.util.Log.w("LightingAIView", "Focus visual-state acknowledgement timed out");
        }, 1500);
    }

    private void recoverPlannerRenderer(WebView failed) {
        ++plannerFocusGeneration;
        recoveringWebView = true;
        recoveryOriginTrusted = false;
        rootView.removeView(failed);
        webView = null;
        failed.destroy();
        if (rendererRecoveryNotice == null) {
            rendererRecoveryNotice = new TextView(this);
            rendererRecoveryNotice.setBackgroundColor(Color.rgb(13, 15, 18));
            rendererRecoveryNotice.setTextColor(Color.WHITE);
            rendererRecoveryNotice.setGravity(Gravity.CENTER);
            rootView.addView(rendererRecoveryNotice, new FrameLayout.LayoutParams(-1, -1));
        }
        rendererRecoveryNotice.setText("Obnavljam prikaz scene… / Restoring scene view…");
        if (++rendererRecoveryAttempts > 2) {
            rendererRecoveryNotice.setText("Prikaz nije dostupan. Sačuvani podaci nisu obrisani. Dodirni za ponovni pokušaj. / View unavailable. Saved data was preserved. Tap to retry.");
            rendererRecoveryNotice.setOnClickListener(v -> {
                rendererRecoveryAttempts = 0;
                rendererRecoveryNotice.setOnClickListener(null);
                createPlannerWebView(false);
            });
            return;
        }
        createPlannerWebView(false);
    }

    @Override protected void onResume() {
        super.onResume();
        resumePlannerView();
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
        pendingVideoCapture = false;
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

    private boolean openGalleryForWebView(WebChromeClient.FileChooserParams params) {
        pendingGalleryPersistable = false;
        boolean video = pendingVideoCapture;
        String mime = video ? "video/*" : "image/*";
        Intent intent;
        if (Build.VERSION.SDK_INT >= 33) {
            intent = new Intent(MediaStore.ACTION_PICK_IMAGES);
            intent.setType(mime);
        } else {
            intent = new Intent(Intent.ACTION_PICK,
                video ? MediaStore.Video.Media.EXTERNAL_CONTENT_URI : MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            intent.setType(mime);
        }
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        try {
            startActivityForResult(intent, CHOOSE_IMAGE);
            return true;
        } catch (ActivityNotFoundException primaryError) {
            try {
                Intent fallback = new Intent(Intent.ACTION_GET_CONTENT);
                fallback.setType(mime);
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


    private boolean openVideoForWebView() {
        pendingPhotoCapturePermission = false;
        pendingGalleryPersistable = false;
        deletePendingCameraUri();
        Intent record = new Intent(MediaStore.ACTION_VIDEO_CAPTURE);
        try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                // No WRITE_EXTERNAL_STORAGE permission is required for app-owned storage.
                // Grant the camera write access to the specific private provider URI only.
                java.io.File folder = AIVisualImageProvider.captureDirectory(this);
                if (!folder.isDirectory() && !folder.mkdirs())
                    throw new IllegalStateException("Scene video folder unavailable");
                java.io.File output = new java.io.File(folder,
                    "scene_capture_" + System.currentTimeMillis() + ".mp4");
                if (!output.createNewFile()) throw new IllegalStateException("Cannot prepare scene clip");
                pendingCameraUri = Uri.parse("content://" + getPackageName() +
                    ".ai.preview/" + Uri.encode(output.getName()));
            } else {
                ContentValues values = new ContentValues();
                values.put(MediaStore.Video.Media.DISPLAY_NAME, "LightingAI_scene_" +
                    System.currentTimeMillis() + ".mp4");
                values.put(MediaStore.Video.Media.MIME_TYPE, "video/mp4");
                values.put(MediaStore.Video.Media.RELATIVE_PATH, "Movies/LightingAI");
                pendingCameraUri = getContentResolver().insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, values);
                if (pendingCameraUri == null) throw new IllegalStateException("Could not prepare video URI");
            }
            record.putExtra(MediaStore.EXTRA_OUTPUT, pendingCameraUri);
            // The camera chooses clip duration; do not force a 120-second cut.
            record.setClipData(ClipData.newRawUri("LightingAI scene video", pendingCameraUri));
            record.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            for (ResolveInfo info : getPackageManager().queryIntentActivities(record, PackageManager.MATCH_DEFAULT_ONLY)) {
                if (info != null && info.activityInfo != null && info.activityInfo.packageName != null) {
                    grantUriPermission(info.activityInfo.packageName, pendingCameraUri,
                        Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                }
            }
            startActivityForResult(record, CHOOSE_IMAGE);
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
        pendingVideoCapture = false;
        pendingPhotoCapturePermission = false;
        pendingGalleryPersistable = false;
        if (callback != null) callback.onReceiveValue(result);
    }

    private void deletePendingCameraUri() {
        if (pendingCameraUri == null) return;
        try { getContentResolver().delete(pendingCameraUri, null, null); } catch (Exception ignored) {}
        pendingCameraUri = null;
    }

    private void releaseScenePlannerCaptures(boolean keepLatest) {
        int keep = keepLatest && !scenePlannerCaptureUris.isEmpty() ? 1 : 0;
        while (scenePlannerCaptureUris.size() > keep) {
            Uri uri = scenePlannerCaptureUris.remove(0);
            try { getContentResolver().delete(uri, null, null); } catch (Exception ignored) {}
        }
    }

    private void cleanupExpiredScenePlannerCaptures() {
        // Only our legacy app-owned captures; never gallery selections or MediaStore exports.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) return;
        try {
            ScenePlannerCaptureCleanup.prune(AIVisualImageProvider.captureDirectory(this), System.currentTimeMillis());
        } catch (java.io.IOException ignored) {}
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
            "/* Direct fixture control scripts disabled in first release. */" +
            "if(!document.getElementById('lightingai-dmx-patch-script')){var x1=document.createElement('script');x1.id='lightingai-dmx-patch-script';x1.src='file:///android_asset/dmx-patch-planner.js';document.body.appendChild(x1);}if(!document.getElementById('lightingai-dmx-export-script')){var x2=document.createElement('script');x2.id='lightingai-dmx-export-script';x2.src='file:///android_asset/dmx-export.js';document.body.appendChild(x2);}if(!document.getElementById('lightingai-dof-script')){var x3=document.createElement('script');x3.id='lightingai-dof-script';x3.src='file:///android_asset/dof-planner.js';document.body.appendChild(x3);}if(!document.getElementById('lightingai-flicker-script')){var x4=document.createElement('script');x4.id='lightingai-flicker-script';x4.src='file:///android_asset/flicker-shutter-planner.js';document.body.appendChild(x4);}if(!document.getElementById('lightingai-continuity-script')){var x5=document.createElement('script');x5.id='lightingai-continuity-script';x5.src='file:///android_asset/continuity-match-shot.js';document.body.appendChild(x5);}if(!document.getElementById('lightingai-shot-list-script')){var x6=document.createElement('script');x6.id='lightingai-shot-list-script';x6.src='file:///android_asset/shot-list-planner.js';document.body.appendChild(x6);}if(!document.getElementById('lightingai-shot-list-export-script')){var x7=document.createElement('script');x7.id='lightingai-shot-list-export-script';x7.src='file:///android_asset/shot-list-export.js';document.body.appendChild(x7);}if(!document.getElementById('lightingai-cue-script')){var x8=document.createElement('script');x8.id='lightingai-cue-script';x8.src='file:///android_asset/lighting-cue-planner.js';document.body.appendChild(x8);}if(!document.getElementById('lightingai-cue-export-script')){var x9=document.createElement('script');x9.id='lightingai-cue-export-script';x9.src='file:///android_asset/lighting-cue-export.js';document.body.appendChild(x9);}if(!document.getElementById('lightingai-beam-report-script')){var x10=document.createElement('script');x10.id='lightingai-beam-report-script';x10.src='file:///android_asset/beam-coverage-report.js';document.body.appendChild(x10);}if(!document.getElementById('lightingai-camera-snapshots-script')){var x11=document.createElement('script');x11.id='lightingai-camera-snapshots-script';x11.src='file:///android_asset/camera-setup-snapshots.js';document.body.appendChild(x11);}if(!document.getElementById('lightingai-camera-report-script')){var x12=document.createElement('script');x12.id='lightingai-camera-report-script';x12.src='file:///android_asset/camera-setup-report.js';document.body.appendChild(x12);}if(!document.getElementById('lightingai-ratio-script')){var x13=document.createElement('script');x13.id='lightingai-ratio-script';x13.src='file:///android_asset/lighting-ratio.js';document.body.appendChild(x13);}if(!document.getElementById('lightingai-shot-setup-report-script')){var x14=document.createElement('script');x14.id='lightingai-shot-setup-report-script';x14.src='file:///android_asset/shot-setup-report.js';document.body.appendChild(x14);}if(!document.getElementById('lightingai-backup-script')){var x15=document.createElement('script');x15.id='lightingai-backup-script';x15.src='file:///android_asset/project-backup-export.js';document.body.appendChild(x15);}" +
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


    private static final class BackupPasswordJob {
        final String request;
        final boolean encrypt;
        final java.util.concurrent.atomic.AtomicBoolean cancelled = new java.util.concurrent.atomic.AtomicBoolean(false);
        volatile Thread worker;
        boolean submitted;
        BackupPasswordJob(String request, boolean encrypt) { this.request = request; this.encrypt = encrypt; }
    }

    private static byte[] encryptedBackupData(String text) throws org.json.JSONException {
        JSONObject envelope = new JSONObject(text);
        if (envelope.length() != 3 || !"LightingAI.EncryptedSceneBackup".equals(envelope.getString("format")) ||
            !Integer.valueOf(1).equals(envelope.get("version")))
            throw new IllegalArgumentException("Unsupported encrypted backup");
        return java.util.Base64.getDecoder().decode(envelope.getString("data"));
    }

    private synchronized boolean beginBackupPasswordJob(String request, String text, boolean encrypt) {
        if (request == null || !request.matches("^backup-[a-z0-9-]{1,80}$") || backupPasswordJob != null ||
            pendingSceneBackupRequest != null) return false;
        BackupPasswordJob job = new BackupPasswordJob(request, encrypt);
        backupPasswordJob = job;
        runOnUiThread(() -> showBackupPasswordDialog(job, text));
        return true;
    }

    private android.widget.EditText backupPasswordField(String hint) {
        android.widget.EditText field = new android.widget.EditText(this);
        field.setHint(hint);
        field.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);
        field.setImeOptions(android.view.inputmethod.EditorInfo.IME_FLAG_NO_PERSONALIZED_LEARNING);
        field.setImportantForAutofill(View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS);
        field.setSaveEnabled(false); field.setSaveFromParentEnabled(false); field.setFreezesText(false);
        field.setFilters(new android.text.InputFilter[]{new android.text.InputFilter.LengthFilter(1024)});
        return field;
    }

    private static char[] backupPasswordChars(android.widget.EditText field) {
        android.text.Editable value = field.getText();
        char[] chars = new char[value.length()]; value.getChars(0, value.length(), chars, 0);
        return chars;
    }

    private void showBackupPasswordDialog(BackupPasswordJob job, String text) {
        if (job.cancelled.get() || isFinishing() || isDestroyed()) { cancelBackupPasswordJob(job); return; }
        android.widget.LinearLayout content = new android.widget.LinearLayout(this);
        content.setOrientation(android.widget.LinearLayout.VERTICAL); content.setPadding(32, 12, 32, 12);
        android.widget.TextView note = new android.widget.TextView(this);
        note.setText(job.encrypt ?
            "Unesi posebnu lozinku od najmanje 12 znakova, najbolje dugu frazu. Sačuvaj je odvojeno: bez nje kopija ne može da se otvori ni na drugom telefonu. Lozinku ne čuvamo." :
            "Unesi lozinku ove kopije. Tek posle provere autentičnosti prikazaćemo pregled; scena se još ne uvozi.");
        android.widget.EditText password = backupPasswordField("Lozinka kopije");
        android.widget.EditText repeat = job.encrypt ? backupPasswordField("Ponovi lozinku") : null;
        content.addView(note); content.addView(password); if (repeat != null) content.addView(repeat);
        android.app.AlertDialog dialog = new android.app.AlertDialog.Builder(this)
            .setTitle(job.encrypt ? "ŠIFRUJ KOPIJU SCENE" : "OTKLJUČAJ KOPIJU SCENE")
            .setView(content).setPositiveButton(job.encrypt ? "ŠIFRUJ I SAČUVAJ" : "OTKLJUČAJ ZA PREGLED", null)
            .setNegativeButton("OTKAŽI", (d, which) -> cancelBackupPasswordJob(job)).create();
        backupPasswordDialog = dialog;
        dialog.setOnDismissListener(d -> {
            password.getText().clear(); if (repeat != null) repeat.getText().clear();
            if (backupPasswordDialog == dialog) backupPasswordDialog = null;
            if (!job.submitted) cancelBackupPasswordJob(job);
        });
        dialog.setOnShowListener(d -> {
            if (dialog.getWindow() != null) {
                dialog.getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE);
                dialog.getWindow().setSoftInputMode(android.view.WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_VISIBLE);
            }
            password.requestFocus();
            dialog.getButton(android.app.AlertDialog.BUTTON_POSITIVE).setOnClickListener(v -> {
                char[] chars = backupPasswordChars(password);
                char[] confirmation = repeat == null ? null : backupPasswordChars(repeat);
                boolean valid = chars.length >= (job.encrypt ? 12 : 1) &&
                    (confirmation == null || java.util.Arrays.equals(chars, confirmation));
                if (confirmation != null) java.util.Arrays.fill(confirmation, '\0');
                if (!valid) {
                    java.util.Arrays.fill(chars, '\0');
                    password.setError(job.encrypt ? "Najmanje 12 znakova; oba unosa moraju biti ista." : "Unesi lozinku.");
                    return;
                }
                job.submitted = true;
                password.getText().clear(); if (repeat != null) repeat.getText().clear();
                dialog.dismiss();
                Thread worker = new Thread(() -> processPasswordBackup(job, text, chars), "LightingAI-BackupCrypto");
                job.worker = worker; worker.start();
            });
        });
        dialog.show();
    }

    private synchronized void finishBackupPasswordJob(BackupPasswordJob job) {
        if (backupPasswordJob == job) backupPasswordJob = null;
    }

    private void cancelBackupPasswordJob(BackupPasswordJob job) {
        if (job == null || job.cancelled.getAndSet(true)) return;
        if (job.worker != null) job.worker.interrupt();
        if (backupPasswordDialog != null) backupPasswordDialog.dismiss();
        if (job.worker == null) finishBackupPasswordJob(job);
        if (job.encrypt) notifySceneBackupSaved(job.request, false);
        else notifySceneBackupUnlocked(job, "", "cancelled");
    }

    private void processPasswordBackup(BackupPasswordJob job, String text, char[] password) {
        byte[] plain = null;
        try {
            if (job.cancelled.get()) return;
            if (job.encrypt) {
                plain = text.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                byte[] encrypted = SceneBackupCrypto.encrypt(plain, password);
                if (job.cancelled.get()) return;
                String envelope = new JSONObject().put("format", "LightingAI.EncryptedSceneBackup")
                    .put("version", 1).put("data", java.util.Base64.getEncoder().encodeToString(encrypted)).toString();
                if (job.cancelled.get()) return;
                saveEncryptedSceneBackup(job, envelope);
            } else {
                plain = SceneBackupCrypto.decrypt(encryptedBackupData(text), password);
                if (!job.cancelled.get()) notifySceneBackupUnlocked(job,
                    new String(plain, java.nio.charset.StandardCharsets.UTF_8), "ok");
            }
        } catch (java.security.GeneralSecurityException | org.json.JSONException | RuntimeException error) {
            // Deliberately do not log exceptions, content, credentials or provider messages.
            if (!job.cancelled.get()) {
                if (job.encrypt) notifySceneBackupSaved(job.request, false);
                else notifySceneBackupUnlocked(job, "", "error");
            }
        } finally {
            java.util.Arrays.fill(password, '\0');
            if (plain != null) java.util.Arrays.fill(plain, (byte) 0);
            finishBackupPasswordJob(job);
        }
    }

    private void saveEncryptedSceneBackup(BackupPasswordJob job, String envelope) {
        String filename = "LightingAI_SceneBackup_" + System.currentTimeMillis() + ".encrypted.json";
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (job.cancelled.get()) return;
            boolean saved = saveTextDirectlyToDownloads(filename, envelope);
            if (!job.cancelled.get()) notifySceneBackupSaved(job.request, saved);
        } else {
            runOnUiThread(() -> {
                if (job.cancelled.get()) return;
                if (pendingSceneBackupText != null) { notifySceneBackupSaved(job.request, false); return; }
                pendingSceneBackupText = envelope; pendingSceneBackupRequest = job.request;
                try {
                    Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE); intent.setType("application/json");
                    intent.putExtra(Intent.EXTRA_TITLE, filename); intent.putExtra(Intent.EXTRA_LOCAL_ONLY, true);
                    startActivityForResult(intent, SAVE_SCENE_BACKUP);
                } catch (RuntimeException error) {
                    pendingSceneBackupText = null; pendingSceneBackupRequest = null;
                    notifySceneBackupSaved(job.request, false);
                }
            });
        }
    }

    private void notifySceneBackupUnlocked(BackupPasswordJob job, String text, String status) {
        if (webView == null || !recoveryOriginTrusted) return;
        webView.post(() -> {
            if (recoveryOriginTrusted && !(job.cancelled.get() && "ok".equals(status))) webView.evaluateJavascript(
                "window.LightingAIScenePlanner&&LightingAIScenePlanner.onBackupUnlocked(" +
                JSONObject.quote(job.request) + "," + JSONObject.quote(text) + "," + JSONObject.quote(status) + ");", null);
        });
    }

    private void notifySceneBackupSaved(String request, boolean success) {
        if (webView == null || !recoveryOriginTrusted) return;
        webView.post(() -> {
            if (recoveryOriginTrusted) webView.evaluateJavascript(
                "window.LightingAIScenePlanner&&window.LightingAIScenePlanner.onBackupSaved(" +
                JSONObject.quote(request) + "," + success + ");", null);
        });
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


    // Android Storage Access Framework: compatible with API 26+ without storage permissions.
    // Paid Runway credentials never enter the app; this accepts only the user's backend token.
    private void requestScenePlannerMp4Save(String taskId, String accessToken) {
        if (pendingAiMp4TaskId != null) {
            notifyScenePlannerMp4Save(false);
            return;
        }
        if (taskId == null || !taskId.matches("[a-fA-F0-9-]{36}") ||
            accessToken == null || !accessToken.matches("[A-Za-z0-9._~+/=-]{24,512}")) {
            notifyScenePlannerMp4Save(false);
            return;
        }
        pendingAiMp4TaskId = taskId;
        pendingAiMp4AccessToken = accessToken;
        try {
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("video/mp4");
            intent.putExtra(Intent.EXTRA_TITLE, "LightingAI_AI_Relight.mp4");
            startActivityForResult(intent, SAVE_AI_SCENE_MP4);
        } catch (Exception error) {
            pendingAiMp4TaskId = null;
            pendingAiMp4AccessToken = null;
            notifyScenePlannerMp4Save(false);
        }
    }

    private void notifyScenePlannerMp4Save(boolean success) {
        if (webView == null) return;
        webView.post(() -> webView.evaluateJavascript(
            "window.LightingAIScenePlanner&&window.LightingAIScenePlanner.onNativeVideoSaved(" +
            (success ? "true" : "false") + ");", null));
    }

    private void downloadScenePlannerMp4ToUri(String taskId, String accessToken, Uri destination) {
        new Thread(() -> {
            java.net.HttpURLConnection connection = null;
            boolean success = false;
            try {
                // Fixed HTTPS origin prevents arbitrary downloads or access-token exfiltration.
                java.net.URL url = new java.net.URL(
                    "https://lightingai.onrender.com/api/scene-planner/video/download/" + taskId);
                connection = (java.net.HttpURLConnection) url.openConnection();
                connection.setInstanceFollowRedirects(false);
                connection.setConnectTimeout(20000);
                connection.setReadTimeout(120000);
                connection.setRequestProperty("Authorization", "Bearer " + accessToken);
                connection.setRequestProperty("Accept", "video/mp4");
                if (connection.getResponseCode() != 200) throw new java.io.IOException("Video unavailable");
                String type = connection.getContentType();
                if (type == null || !type.toLowerCase(java.util.Locale.US).startsWith("video/mp4"))
                    throw new java.io.IOException("Unexpected video MIME type");
                long declared = connection.getContentLengthLong();
                if (declared > MAX_AI_MP4_BYTES) throw new java.io.IOException("Video exceeds limit");
                try (InputStream input = connection.getInputStream()) {
                    byte[] header = new byte[12];
                    int filled = 0;
                    while (filled < header.length) {
                        int read = input.read(header, filled, header.length - filled);
                        if (read < 0) throw new java.io.IOException("Truncated MP4");
                        filled += read;
                    }
                    if (header[4] != 'f' || header[5] != 't' || header[6] != 'y' || header[7] != 'p')
                        throw new java.io.IOException("Not an MP4 container");
                    try (OutputStream output = getContentResolver().openOutputStream(destination, "w")) {
                        if (output == null) throw new java.io.IOException("Document destination unavailable");
                        output.write(header);
                        byte[] buffer = new byte[65536];
                        long total = header.length;
                        int bytes;
                        while ((bytes = input.read(buffer)) != -1) {
                            total += bytes;
                            if (total > MAX_AI_MP4_BYTES) throw new java.io.IOException("Video exceeds limit");
                            output.write(buffer, 0, bytes);
                        }
                        output.flush();
                    }
                }
                success = true;
            } catch (Exception ignored) {
                // No credentials, server responses, or media content are logged.
            } finally {
                if (connection != null) connection.disconnect();
                if (!success) {
                    try { getContentResolver().delete(destination, null, null); }
                    catch (Exception ignored) {}
                }
                notifyScenePlannerMp4Save(success);
            }
        }, "LightingAI-scene-planner-mp4-save").start();
    }

    private synchronized boolean writeRecoveryFile(String name, String data, int maxBytes) {
        if (data == null || data.length() > maxBytes) return false;
        byte[] bytes = data.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        if (bytes.length > maxBytes) return false;
        AtomicFile file = new AtomicFile(new java.io.File(getFilesDir(), name));
        java.io.FileOutputStream output = null;
        try {
            output = file.startWrite();
            output.write(bytes);
            output.getFD().sync();
            file.finishWrite(output);
            return true;
        } catch (java.io.IOException error) {
            if (output != null) file.failWrite(output);
            return false;
        }
    }

    private synchronized String readRecoveryFile(String name, int maxBytes) {
        AtomicFile file = new AtomicFile(new java.io.File(getFilesDir(), name));
        try (InputStream input = file.openRead(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192]; int count, total = 0;
            while ((count = input.read(buffer)) != -1) {
                total += count; if (total > maxBytes) return "";
                output.write(buffer, 0, count);
            }
            return output.toString(java.nio.charset.StandardCharsets.UTF_8.name());
        } catch (java.io.IOException error) { return ""; }
    }

    private boolean validSceneWorkspace(String data) {
            try {
                if (data == null || data.length() > 8 * 1024 * 1024) return false;
                JSONObject snapshot = new JSONObject(data);
                if (snapshot.length() != 3 || snapshot.getInt("version") != 1 || snapshot.getLong("checkpoint") < 0) return false;
                JSONObject values = snapshot.getJSONObject("values");
                java.util.Iterator<String> keys = values.keys();
                while (keys.hasNext()) {
                    String key = keys.next();
                    if (!key.equals("lighting_scene_planner_draft_v1") &&
                        !key.equals("lighting_scene_planner_revisions_v1") &&
                        !key.equals("lighting_scene_planner_prelight_reviews_v1") &&
                        !key.equals("lighting_scene_planner_last_v1")) return false;
                    if (!(values.get(key) instanceof String)) return false;
                }
                return true;
            } catch (org.json.JSONException error) { return false; }
        }
    private boolean validScenePhoto(String data) {
            try {
                if (data == null || data.length() > 12100000) return false;
                JSONObject record = new JSONObject(data);
                String value = record.getString("value");
                if (record.length() != 3 || record.getInt("version") != 2 || record.getLong("sequence") < 0 || value.length() > 12000000 ||
                    !value.matches("^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=\\r\\n]+$")) return false;
                return true;
            } catch (org.json.JSONException error) { return false; }
        }

    private boolean readableBackupPhoto(String value) {
            if (!recoveryOriginTrusted || value == null || value.length() > 12000000 ||
                !value.matches("^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=\\r\\n]+$")) return false;
            try {
                byte[] bytes = android.util.Base64.decode(value.substring(value.indexOf(',') + 1), android.util.Base64.DEFAULT);
                android.graphics.BitmapFactory.Options options = new android.graphics.BitmapFactory.Options();
                options.inJustDecodeBounds = true;
                android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.length, options);
                return options.outWidth > 0 && options.outHeight > 0 && options.outWidth <= 8192 &&
                    options.outHeight <= 8192 && 1L * options.outWidth * options.outHeight <= 16000000 &&
                    ("image/png".equals(options.outMimeType) || "image/jpeg".equals(options.outMimeType) ||
                     "image/webp".equals(options.outMimeType));
            } catch (IllegalArgumentException error) { return false; }
        }

    private boolean validBackupPhotoRecord(String data) {
        try { return readableBackupPhoto(new JSONObject(data).getString("value")); }
        catch (org.json.JSONException error) { return false; }
    }

    private String sceneFile(String scene, String kind) {
        if (scene == null || !scene.matches("^s-[a-z0-9]{8,64}$") ||
            (!"workspace".equals(kind) && !"photo".equals(kind))) return null;
        return "scene-planner-" + scene + "-" + kind + "-v1.json";
    }
    private String readSceneFile(String name, int maxBytes) {
        String value = readRecoveryFile(name, maxBytes);
        if (value.isEmpty() && (new java.io.File(getFilesDir(), name).exists() ||
            new java.io.File(getFilesDir(), name + ".bak").exists())) return "!unreadable";
        return value;
    }
    private boolean registeredScene(String id) {
        try {
            org.json.JSONArray scenes = new JSONObject(readRecoveryFile("scene-planner-scenes-v1.json", 65536)).getJSONArray("scenes");
            for (int i = 0; i < scenes.length(); i++) if (id.equals(scenes.getJSONObject(i).getString("id"))) return true;
        } catch (org.json.JSONException ignored) { }
        return false;
    }

    public class AndroidBridge {
        @JavascriptInterface public String sceneBackupSha256(String text) {
            if (!recoveryOriginTrusted || text == null || text.length() > 24 * 1024 * 1024) return "";
            try {
                byte[] bytes = text.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                if (bytes.length > 24 * 1024 * 1024) return "";
                byte[] digest = java.security.MessageDigest.getInstance("SHA-256").digest(bytes);
                StringBuilder hex = new StringBuilder(64);
                for (byte value : digest) hex.append(String.format(java.util.Locale.ROOT, "%02x", value & 255));
                return hex.toString();
            } catch (java.security.NoSuchAlgorithmException error) { return ""; }
        }
        @JavascriptInterface public boolean validateScenePlannerBackupPhoto(String value) {
            return readableBackupPhoto(value);
        }

        private final ThreadLocal<String> pendingImportedVisual=new ThreadLocal<>();
        @JavascriptInterface public String importScenePlannerBackupWithVisual(String name,String workspace,String photo,String expectedIndex,String visual) {
            if(!recoveryOriginTrusted||visual==null||visual.length()>12200000)return "";
            try {if(!validAIVisualDraft(new JSONObject(visual),true))return "";
                pendingImportedVisual.set(visual);
                return importScenePlannerBackup(name,workspace,photo,expectedIndex);
            }catch(org.json.JSONException error){return "";}finally{pendingImportedVisual.remove();}
        }
        @JavascriptInterface public String importScenePlannerBackup(String name, String workspace, String photo, String expectedIndex) {
            if (!recoveryOriginTrusted || name == null || name.trim().isEmpty() || name.length() > 80 ||
                !validSceneWorkspace(workspace) || photo == null || (!photo.isEmpty() && (!validScenePhoto(photo) || !validBackupPhotoRecord(photo))) ||
                expectedIndex == null || expectedIndex.length() > 65536) return "";
            synchronized (MainActivity.this) {
                String workspaceFile = null, photoFile = null, importedId = null;
                boolean published = false;
                try {
                    String current = readSceneFile("scene-planner-scenes-v1.json", 65536);
                    JSONObject index = new JSONObject(expectedIndex);
                    org.json.JSONArray entries = index.getJSONArray("scenes");
                    if (current.isEmpty()) {
                        if (entries.length() != 1 || !"legacy".equals(entries.getJSONObject(0).getString("id")) ||
                            !"legacy".equals(index.getString("activeId"))) return "";
                    } else if (!current.equals(expectedIndex)) return "";
                    if (entries.length() >= 100) return "";
                    String id = "s-" + UUID.randomUUID().toString().replace("-", "");
                    importedId=id;
                    workspaceFile = sceneFile(id, "workspace"); photoFile = sceneFile(id, "photo");
                    for (String file : new String[]{workspaceFile, photoFile}) {
                        if (new java.io.File(getFilesDir(), file).exists() ||
                            new java.io.File(getFilesDir(), file + ".bak").exists() ||
                            new java.io.File(getFilesDir(), file + ".new").exists()) {
                            workspaceFile = null; photoFile = null; return "";
                        }
                    }
                    // Publish metadata only after BOTH new files have durable writes.
                    if (!writeRecoveryFile(workspaceFile, workspace, 8 * 1024 * 1024) ||
                        (!photo.isEmpty() && !writeRecoveryFile(photoFile, photo, 12100000))) return "";
                    entries.put(new JSONObject().put("id", id).put("name", name));
                    String pendingVisual=pendingImportedVisual.get();
                    if(pendingVisual!=null&&!visualDraftStore().save(id,new JSONObject(pendingVisual)))return "";
                    if (!saveScenePlannerSceneIndex(index.toString())) return "";
                    published = true;
                    return id;
                } catch (org.json.JSONException | RuntimeException error) { return ""; }
                finally {
                    // Only unregistered files created by this failed import are removed.
                    if (!published && workspaceFile != null) new AtomicFile(new java.io.File(getFilesDir(), workspaceFile)).delete();
                    if (!published && photoFile != null) new AtomicFile(new java.io.File(getFilesDir(), photoFile)).delete();
                    if(!published&&importedId!=null)visualDraftStore().discardNewScene(importedId);
                }
            }
        }
        @JavascriptInterface public boolean exportScenePlannerBackup(String request, String text) {
            if (!recoveryOriginTrusted || text == null || text.length() > SceneBackupCrypto.MAX_PLAIN_BYTES ||
                text.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > SceneBackupCrypto.MAX_PLAIN_BYTES) return false;
            return beginBackupPasswordJob(request, text, true);
        }
        @JavascriptInterface public boolean unlockScenePlannerBackup(String request, String text) {
            if (!recoveryOriginTrusted || text == null || text.length() > SceneBackupCrypto.MAX_FILE_BYTES ||
                text.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > SceneBackupCrypto.MAX_FILE_BYTES) return false;
            try { encryptedBackupData(text); }
            catch (org.json.JSONException | IllegalArgumentException error) { return false; }
            return beginBackupPasswordJob(request, text, false);
        }
        @JavascriptInterface public void cancelSceneBackupOperation() {
            if (!recoveryOriginTrusted) return;
            runOnUiThread(() -> cancelBackupPasswordJob(backupPasswordJob));
        }

        @JavascriptInterface public String loadScenePlannerSceneIndex() {
            if (!recoveryOriginTrusted) return "";
            return readSceneFile("scene-planner-scenes-v1.json", 65536);
        }
        @JavascriptInterface public boolean saveScenePlannerSceneIndex(String data) {
            if (!recoveryOriginTrusted || data == null || data.length() > 65536) return false;
            try {
                JSONObject index = new JSONObject(data);
                if (index.length() != 3 || index.getInt("version") != 1) return false;
                org.json.JSONArray scenes = index.getJSONArray("scenes");
                if (scenes.length() < 1 || scenes.length() > 100) return false;
                java.util.HashSet<String> ids = new java.util.HashSet<>();
                for (int i = 0; i < scenes.length(); i++) {
                    JSONObject scene = scenes.getJSONObject(i);
                    String id = scene.getString("id"), name = scene.getString("name");
                    if (scene.length() != 2 || !("legacy".equals(id) || id.matches("^s-[a-z0-9]{8,64}$")) ||
                        !ids.add(id) || name.trim().isEmpty() || name.length() > 80) return false;
                }
                if (!ids.contains("legacy") || !ids.contains(index.getString("activeId"))) return false;
                String previous = readSceneFile("scene-planner-scenes-v1.json", 65536);
                if (!previous.isEmpty()) {
                    org.json.JSONArray old = new JSONObject(previous).getJSONArray("scenes");
                    for (int i = 0; i < old.length(); i++) if (!ids.contains(old.getJSONObject(i).getString("id"))) return false;
                }
                return writeRecoveryFile("scene-planner-scenes-v1.json", data, 65536);
            } catch (org.json.JSONException error) { return false; }
        }
        @JavascriptInterface public String loadScenePlannerSceneData(String scene, String kind) {
            String name = sceneFile(scene, kind);
            if (!recoveryOriginTrusted || name == null || !registeredScene(scene)) return "";
            return readSceneFile(name, "photo".equals(kind) ? 12100000 : 8 * 1024 * 1024);
        }
        @JavascriptInterface public boolean saveScenePlannerSceneData(String scene, String kind, String data) {
            String name = sceneFile(scene, kind);
            if (!recoveryOriginTrusted || name == null || !registeredScene(scene) ||
                !("photo".equals(kind) ? validScenePhoto(data) : validSceneWorkspace(data))) return false;
            return writeRecoveryFile(name, data, "photo".equals(kind) ? 12100000 : 8 * 1024 * 1024);
        }
        // One private atomic record per scene; never WebView storage or a copy of the Planner photo.
        private String aiVisualDraftFile(String scene) {
            if (!recoveryOriginTrusted || scene == null ||
                !("legacy".equals(scene) || (scene.matches("^s-[a-z0-9]{8,64}$") && registeredScene(scene)))) return null;
            return "ai-visual-draft-" + scene + "-v1.json";
        }
        @JavascriptInterface public String loadAIVisualDraft(String scene) {
            String file = aiVisualDraftFile(scene);
            if(file==null)return ""; synchronized(MainActivity.this){ return visualDraftStore().load(scene,readSceneFile(file,12200000)); }
        }
        @JavascriptInterface public boolean saveAIVisualDraft(String scene, String data) {
            String file = aiVisualDraftFile(scene);
            if (file == null || data == null || data.length() > 12200000) return false;
            try { JSONObject x=new JSONObject(data);if(!validAIVisualDraft(x,true))return false;
                synchronized(MainActivity.this){return visualDraftStore().save(scene,x);}
            } catch (org.json.JSONException error) { return false; }
        }
        private boolean validAIVisualDraft(JSONObject x, boolean withPhoto) {
            try {
                if (x.length() != (withPhoto ? 6 : 5) || x.getInt("version") != 1 ||
                    !(x.get("description") instanceof String) || x.getString("description").length() > 20000 ||
                    !(x.get("dpRequest") instanceof String) || x.getString("dpRequest").length() > 20000 ||
                    (withPhoto && !(x.get("photo") instanceof String))) return false;
                String photo = withPhoto ? x.getString("photo") : "";
                if (!photo.isEmpty() && !readableBackupPhoto(photo)) return false;
                org.json.JSONArray ids = x.getJSONArray("selectedIds");
                if (ids.length() > 1000) return false;
                for (int i = 0; i < ids.length(); i++)
                    if (!(ids.get(i) instanceof String) || ids.getString(i).isEmpty() || ids.getString(i).length() > 200) return false;
                JSONObject settings = x.getJSONObject("settings");
                if (settings.length() != 4 || !(settings.get("look") instanceof String) || settings.getString("look").length() > 80) return false;
                for (String key : new String[]{"useMeasurements", "useSun", "useDmx"})
                    if (!(settings.get(key) instanceof Boolean)) return false;
                return true;
            } catch(org.json.JSONException error) { return false; }
        }
        @JavascriptInterface public boolean saveAIVisualDraftMetadata(String scene,String data) {
            if(aiVisualDraftFile(scene)==null||data==null||data.length()>1200000)return false;
            try {JSONObject x=new JSONObject(data);if(!validAIVisualDraft(x,false))return false;
                synchronized(MainActivity.this){return visualDraftStore().saveMetadata(scene,x);}
            }catch(org.json.JSONException error){return false;}
        }

        @JavascriptInterface public boolean saveScenePlannerWorkspace(String data) {
            return recoveryOriginTrusted && validSceneWorkspace(data) &&
                writeRecoveryFile("scene-planner-workspace-v1.json", data, 8 * 1024 * 1024);
        }
        @JavascriptInterface public String loadScenePlannerWorkspace() {
            if (!recoveryOriginTrusted) return "";
            return readRecoveryFile("scene-planner-workspace-v1.json", 8 * 1024 * 1024);
        }
        @JavascriptInterface public boolean saveScenePlannerPhoto(String data) {
            return recoveryOriginTrusted && validScenePhoto(data) &&
                writeRecoveryFile("scene-planner-photo-v2.json", data, 12100000);
        }
        @JavascriptInterface public String loadScenePlannerPhoto() {
            if (!recoveryOriginTrusted) return "";
            return readRecoveryFile("scene-planner-photo-v2.json", 12100000);
        }
        @JavascriptInterface public void releaseScenePlannerCaptures(boolean keepLatest) {
            runOnUiThread(() -> MainActivity.this.releaseScenePlannerCaptures(keepLatest));
        }
        @JavascriptInterface public void saveAiVideo(String taskId, String backendAccessToken) {
            runOnUiThread(() -> requestScenePlannerMp4Save(taskId, backendAccessToken));
        }

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
            if (!isDirectLightingControlEnabled()) return false;
            return MainActivity.this.hasBlePermission();
        }

        @JavascriptInterface public void bleDiscover(String requestId, int timeoutMs) {
            if (!isDirectLightingControlEnabled()) return;
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
            if (!isDirectLightingControlEnabled()) return;
            int value = SacnSender.normalizePriority(priority);
            sacnPriority.set(value);
            if (sacnLiveEngine == null) sacnLiveEngine = new SacnLiveEngine(sacnCid, "LightingAI");
            sacnLiveEngine.setPriority(value);
        }

        @JavascriptInterface public void sacnSendDmx(String requestId, int universe, String channelsJson) {
            if (!isDirectLightingControlEnabled()) return;
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
            if (!isDirectLightingControlEnabled()) return;
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
            if (!isDirectLightingControlEnabled()) return;
            final String id = requestId == null ? "" : requestId;
            if (sacnLiveEngine != null) sacnLiveEngine.stopAll();
            notifyArtNetResult(id, true, "");
        }

        @JavascriptInterface public int sacnLiveFrameCount() {
            if (!isDirectLightingControlEnabled()) return 0;
            return sacnLiveEngine == null ? 0 : sacnLiveEngine.activeFrameCount();
        }

        @JavascriptInterface public void artNetDiscover(String requestId, int timeoutMs) {
            if (!isDirectLightingControlEnabled()) return;
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
            if (!isDirectLightingControlEnabled()) return;
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
            if (!isDirectLightingControlEnabled()) return;
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
            if (!isDirectLightingControlEnabled()) return;
            final String id = requestId == null ? "" : requestId;
            artNetLiveEngine.stopAll();
            notifyArtNetResult(id, true, "");
        }

        @JavascriptInterface public int artNetLiveFrameCount() {
            if (!isDirectLightingControlEnabled()) return 0;
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
                if (granted && pendingFileChooser != null) {
                    if (pendingVideoCapture) openVideoForWebView();
                    else openCameraForWebView();
                }
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

    private void checkpointScenePlanner() {
        if (webView != null) webView.evaluateJavascript(
            "(function(){var d=window.LightingAIScenePlannerDraft;if(d)d.flush();if(window.LightingAIVisualFlush)window.LightingAIVisualFlush();})()", null);
    }

    @Override protected void onSaveInstanceState(Bundle outState) {
        checkpointScenePlanner();
        super.onSaveInstanceState(outState);
    }

    @Override protected void onStop() {
        cancelBackupPasswordJob(backupPasswordJob);
        checkpointScenePlanner();
        super.onStop();
    }

    @Override protected void onPause() {
        ++plannerFocusGeneration;
        checkpointScenePlanner();
        if (webView != null) webView.onPause();
        stopNativeSunCompass();
        artNetLiveEngine.stopAll();
        if (sacnLiveEngine != null) sacnLiveEngine.stopAll();
        if (bleDeviceScanner != null) bleDeviceScanner.stop();
        super.onPause();
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == SAVE_SCENE_BACKUP) {
            String text = pendingSceneBackupText, request = pendingSceneBackupRequest;
            pendingSceneBackupText = null; pendingSceneBackupRequest = null;
            Uri uri = resultCode == RESULT_OK && data != null ? data.getData() : null;
            if (text == null || request == null || uri == null) {
                if (request != null) notifySceneBackupSaved(request, false);
            } else {
                new Thread(() -> {
                    boolean saved = false;
                    try (OutputStream out = getContentResolver().openOutputStream(uri, "w")) {
                        if (out != null) { out.write(text.getBytes(java.nio.charset.StandardCharsets.UTF_8)); out.flush(); saved = true; }
                    } catch (Exception ignored) { saved = false; }
                    if (!saved) { try { getContentResolver().delete(uri, null, null); } catch (Exception ignored) { } }
                    notifySceneBackupSaved(request, saved);
                }, "LightingAI-SceneBackupSave").start();
            }
            return;
        }

        if (requestCode == SAVE_AI_SCENE_MP4) {
            String taskId = pendingAiMp4TaskId;
            String backendToken = pendingAiMp4AccessToken;
            pendingAiMp4TaskId = null;
            pendingAiMp4AccessToken = null;
            Uri destination = resultCode == RESULT_OK && data != null ? data.getData() : null;
            if (destination == null || taskId == null || backendToken == null) {
                notifyScenePlannerMp4Save(false);
            } else {
                downloadScenePlannerMp4ToUri(taskId, backendToken, destination);
            }
            return;
        }

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
                    if (pendingVideoCapture && data != null && data.getData() != null) {
                        Uri returned = data.getData();
                        if (!returned.equals(pendingCameraUri)) {
                            deletePendingCameraUri();
                            uri = returned;
                        }
                    }
                    if (pendingVideoCapture && Build.VERSION.SDK_INT < Build.VERSION_CODES.Q &&
                        pendingCameraUri != null && pendingCameraUri.equals(uri) &&
                        (getPackageName() + ".ai.preview").equals(uri.getAuthority())) {
                        scenePlannerCaptureUris.add(uri);
                    }
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
        ++plannerFocusGeneration;
        releaseScenePlannerCaptures(false);
        cancelBackupPasswordJob(backupPasswordJob);
        if (isFinishing() && pendingVideoCapture && Build.VERSION.SDK_INT < Build.VERSION_CODES.Q)
            deletePendingCameraUri();
        pendingAiMp4AccessToken = null;
        artNetLiveEngine.stopAll();
        if (pendingFileChooser != null) finishFileChooser(null);
        if (nativeSunCompass != null) nativeSunCompass.stop();
        if (nativeSunLocation != null) nativeSunLocation.cancel();
        if (bleDeviceScanner != null) bleDeviceScanner.stop();
        if (speechRecognizer != null) {
            try { speechRecognizer.destroy(); } catch (Exception ignored) {}
            speechRecognizer = null;
        }
        if (webView != null) {
            rootView.removeView(webView);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    private void finishBackFallback() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override public void onBackPressed() {
        // A dead renderer cannot answer JS Back; do not navigate away during recovery.
        if (recoveringWebView) return;
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
