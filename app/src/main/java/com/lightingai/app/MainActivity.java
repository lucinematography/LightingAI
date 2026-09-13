package com.lightingai.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.ClipData;
import android.provider.MediaStore;
import android.webkit.ValueCallback;
import android.widget.Toast;
import androidx.core.content.FileProvider;
import java.io.File;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.OutputStream;

public class MainActivity extends Activity {
    private WebView webView;
    private String pendingText = null;
    private int navigationInsetCssPx = 0;
    private static final int CREATE_FILE = 501;
    private static final int PICK_PHOTO = 502;
    private ValueCallback<Uri[]> photoCallback;
    private Uri cameraUri;
    private File cameraFile;

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
            @Override public void onPageFinished(WebView view, String url) { super.onPageFinished(view, url); applyNavigationInset(); installCatalogView(); }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                                       FileChooserParams params) {
                finishPhoto(null);
                photoCallback = callback;
                try {
                    Intent intent;
                    if (params.isCaptureEnabled()) {
                        File dir = new File(getCacheDir(), "scene-photos");
                        if (!dir.exists() && !dir.mkdirs()) throw new java.io.IOException("Photo directory");
                        cameraFile = File.createTempFile("scene-", ".jpg", dir);
                        cameraUri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".photos", cameraFile);
                        intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                        intent.putExtra(MediaStore.EXTRA_OUTPUT, cameraUri);
                        intent.setClipData(ClipData.newRawUri("Scene photo", cameraUri));
                        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                    } else {
                        intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                        intent.addCategory(Intent.CATEGORY_OPENABLE);
                        intent.setType("image/*");
                        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    }
                    startActivityForResult(intent, PICK_PHOTO);
                } catch (Exception e) {
                    finishPhoto(null);
                    Toast.makeText(MainActivity.this, "Nije moguće otvoriti slike ili kameru / Unable to open photos or camera", Toast.LENGTH_LONG).show();
                }
                return true;
            }
        });
        webView.addJavascriptInterface(new AndroidBridge(), "Android");
        webView.loadUrl("file:///android_asset/index.html");
        webView.requestApplyInsets();
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
        if (requestCode == PICK_PHOTO) {
            Uri uri = null;
            if (resultCode == RESULT_OK) {
                uri = cameraUri != null ? cameraUri : (data == null ? null : data.getData());
            }
            finishPhoto(uri == null ? null : new Uri[]{uri});
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

    private void finishPhoto(Uri[] result) {
        if (photoCallback != null) {
            photoCallback.onReceiveValue(result);
            photoCallback = null;
        }
        if (result == null && cameraFile != null) cameraFile.delete();
        cameraUri = null;
        cameraFile = null;
    }

    @Override protected void onDestroy() {
        finishPhoto(null);
        super.onDestroy();
    }

    @Override public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
}
