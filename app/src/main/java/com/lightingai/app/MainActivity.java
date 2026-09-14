package com.lightingai.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
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
import java.io.OutputStream;

public class MainActivity extends Activity {
    private WebView webView;
    private String pendingText = null;
    private ValueCallback<Uri[]> pendingFileChooser = null;
    private Uri pendingCameraUri = null;
    private boolean pendingCameraCapture = false;

    private static final int CREATE_FILE = 501;
    private static final int CHOOSE_IMAGE = 502;
    private static final int LOCATION_PERMISSION = 503;
    private static final int CAMERA_PERMISSION = 504;
    private static final int MEASURE_SCENE = 505;

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(13, 15, 18));
        getWindow().setNavigationBarColor(Color.rgb(13, 15, 18));
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(13, 15, 18));
        setContentView(webView);
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

                if (pendingCameraCapture) {
                    return openCameraForWebView();
                }
                return openGalleryForWebView(fileChooserParams);
            }
        });
        webView.addJavascriptInterface(new AndroidBridge(), "Android");
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

    private boolean openGalleryForWebView(WebChromeClient.FileChooserParams params) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("image/*");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        try {
            startActivityForResult(intent, CHOOSE_IMAGE);
            return true;
        } catch (ActivityNotFoundException e) {
            try {
                Intent fallback = params != null ? params.createIntent() : new Intent(Intent.ACTION_GET_CONTENT);
                if (fallback.getType() == null) fallback.setType("image/*");
                fallback.addCategory(Intent.CATEGORY_OPENABLE);
                startActivityForResult(fallback, CHOOSE_IMAGE);
                return true;
            } catch (Exception ignored) {
                finishFileChooser(null);
                return false;
            }
        }
    }

    private boolean openCameraForWebView() {
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
            camera.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
            startActivityForResult(camera, CHOOSE_IMAGE);
            return true;
        } catch (Exception e) {
            deletePendingCameraUri();
            finishFileChooser(null);
            return false;
        }
    }

    private void finishFileChooser(Uri[] result) {
        ValueCallback<Uri[]> callback = pendingFileChooser;
        pendingFileChooser = null;
        pendingCameraCapture = false;
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
            "})();", null);
    }

    public class AndroidBridge {
        @JavascriptInterface public void saveText(String filename, String text) {
            runOnUiThread(() -> {
                pendingText = text;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("application/json");
                intent.putExtra(Intent.EXTRA_TITLE, filename);
                startActivityForResult(intent, CREATE_FILE);
            });
        }

        @JavascriptInterface public void requestLocationPermission() {
            runOnUiThread(() -> MainActivity.this.requestLocationPermission());
        }

        @JavascriptInterface public boolean hasLocationPermission() {
            return MainActivity.this.hasLocationPermission();
        }

        @JavascriptInterface public void requestCameraPermission() {
            runOnUiThread(() -> MainActivity.this.requestCameraPermission());
        }

        @JavascriptInterface public boolean hasCameraPermission() {
            return MainActivity.this.hasCameraPermission();
        }

        @JavascriptInterface public void startSceneMeasure(double cameraHeight, String language) {
            runOnUiThread(() -> {
                Intent intent = new Intent(MainActivity.this, MeasureActivity.class);
                intent.putExtra("cameraHeight", cameraHeight);
                intent.putExtra("lang", "en".equals(language) ? "en" : "sr");
                startActivityForResult(intent, MEASURE_SCENE);
            });
        }
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == CAMERA_PERMISSION) {
            notifySceneMeasureCameraPermission(hasCameraPermission());
        }
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

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
        if (pendingFileChooser != null) finishFileChooser(null);
        super.onDestroy();
    }

    @Override public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
}
