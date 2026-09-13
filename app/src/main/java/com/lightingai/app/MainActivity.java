package com.lightingai.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.OutputStream;

public class MainActivity extends Activity {
    private WebView webView;
    private String pendingText = null;
    private int navigationInsetCssPx = 0;
    private ValueCallback<Uri[]> pendingFileChooser = null;
    private Uri pendingCameraUri = null;
    private boolean pendingCameraCapture = false;

    private static final int CREATE_FILE = 501;
    private static final int CHOOSE_IMAGE = 502;

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
            float density = getResources().getDisplayMetrics().density;
            navigationInsetCssPx = Math.max(0, Math.round(bottomPx / density));
            v.setPadding(0, topPx, 0, 0);
            applyNavigationInset();
            return insets;
        });
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true); s.setAllowContentAccess(true); s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                applyNavigationInset();
                installCatalogView();
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
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
        final int cssPx = navigationInsetCssPx;
        webView.post(() -> webView.evaluateJavascript(
            "(function(){var n=document.querySelector('nav');var a=document.querySelector('.app');" +
            "if(n){n.style.bottom='" + cssPx + "px';n.style.zIndex='9999';}" +
            "if(a){a.style.paddingBottom='calc(84px + " + cssPx + "px)';}})();", null));
    }

    private void installCatalogView() {
        if (webView == null) return;
        webView.evaluateJavascript(
            "(function(){if(document.getElementById('lightingai-catalog-script'))return;" +
            "var s=document.createElement('script');s.id='lightingai-catalog-script';" +
            "s.src='file:///android_asset/catalog.js';document.body.appendChild(s);})();", null);
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
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

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
