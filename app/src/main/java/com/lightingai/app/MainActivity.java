package com.lightingai.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
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
    private static final int CREATE_FILE = 501;
    private int navigationInset = 0;

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setNavigationBarColor(Color.rgb(13, 15, 18));

        webView = new WebView(this);
        setContentView(webView);

        webView.setOnApplyWindowInsetsListener((View v, WindowInsets insets) -> {
            navigationInset = Math.max(0, insets.getSystemWindowInsetBottom());
            applyNavigationInset();
            return insets;
        });

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        webView.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                applyNavigationInset();
            }
        });
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new AndroidBridge(), "Android");
        webView.loadUrl("file:///android_asset/index.html");
        webView.requestApplyInsets();
    }

    private void applyNavigationInset() {
        if (webView == null) return;
        final int px = navigationInset;
        webView.post(() -> webView.evaluateJavascript(
            "(function(){var n=document.querySelector('nav');var a=document.querySelector('.app');" +
            "if(n){n.style.bottom='" + px + "px';n.style.zIndex='9999';}" +
            "if(a){a.style.paddingBottom='calc(84px + " + px + "px)';}})();", null));
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
        if (requestCode == CREATE_FILE && resultCode == RESULT_OK && data != null && pendingText != null) {
            Uri uri = data.getData();
            try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                if (out != null) out.write(pendingText.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            } catch (Exception ignored) {}
            pendingText = null;
        }
    }

    @Override public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
}
