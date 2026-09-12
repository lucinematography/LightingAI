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
    private int navigationInsetCssPx = 0;
    private static final int CREATE_FILE = 501;

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
                installCatalogView();
            }
        });
        webView.setWebChromeClient(new WebChromeClient());
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
        String js = "(function(){" +
            "window.catalogFixtures=[];window.catalogAccessories=[];" +
            "function esc(v){return String(v==null?'':v).replace(/[&<>\\\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\\\"':'&quot;',\"'\":'&#39;'}[c]||c;});}" +
            "window.renderFullCatalog=function(){var box=document.getElementById('equipmentList');if(!box)return;" +
            "var q=(document.getElementById('catalogSearch')||{}).value||'';q=q.toLowerCase();" +
            "var fs=window.catalogFixtures.filter(function(x){return JSON.stringify(x).toLowerCase().indexOf(q)>=0;});" +
            "var as=window.catalogAccessories.filter(function(x){return JSON.stringify(x).toLowerCase().indexOf(q)>=0;});" +
            "var sr=(window.currentLang||'sr')==='sr';" +
            "var h='<div class=\\\"card\\\"><b>'+(sr?'KOMPLETAN APUTURE KATALOG':'COMPLETE APUTURE CATALOG')+'</b><div class=\\\"muted small\\\">'+window.catalogFixtures.length+' '+(sr?'rasvetnih tela • ':'fixtures • ')+window.catalogAccessories.length+' '+(sr?'dodataka':'accessories')+'</div><input id=\\\"catalogSearch\\\" placeholder=\\\"'+(sr?'Pretraži svetla, kablove, klape, softboxe, dodatke...':'Search fixtures, cables, barn doors, softboxes, accessories...')+'\\\" value=\\\"'+esc(q)+'\\\" oninput=\\\"renderFullCatalog()\\\"></div>';" +
            "h+='<h2>'+(sr?'Rasvetna tela':'Fixtures')+' ('+fs.length+')</h2>';" +
            "fs.forEach(function(f){h+='<div class=\\\"card\\\"><b>'+esc((f.manufacturer||'Aputure')+' '+(f.model||f.id))+'</b><div class=\\\"muted small\\\">'+esc([f.sourceType,f.mount,f.powerDrawW?f.powerDrawW+' W':''].filter(Boolean).join(' • '))+'</div></div>';});" +
            "h+='<h2>'+(sr?'Dodaci':'Accessories')+' ('+as.length+')</h2>';" +
            "as.forEach(function(a){var compat=(a.compatibleWith||[]).join(', ');var st=a.includedWithFixture?'UKLJUČENO UZ SVETLO':'OPCIONI DODATAK';h+='<div class=\\\"card\\\"><b>'+esc((a.manufacturer||'Aputure')+' '+(a.model||a.id))+'</b><div class=\\\"muted small\\\">'+esc([a.category,a.mount,st].filter(Boolean).join(' • '))+'</div>'+(compat?'<div class=\\\"small\\\" style=\\\"margin-top:8px\\\"><b>'+(sr?'Kompatibilno sa: ':'Compatible with: ')+'</b>'+esc(compat)+'</div>':'')+(a.effectOnLight?'<div class=\\\"muted small\\\" style=\\\"margin-top:6px\\\">'+esc(a.effectOnLight)+'</div>':'')+'</div>';});box.innerHTML=h;};" +
            "window.renderEquipment=function(){var checks=document.getElementById('equipmentChecks');if(checks)checks.innerHTML=(window.equipment||[]).map(function(e){return '<label class=\\\"chip\\\"><input type=\\\"checkbox\\\" value=\\\"'+esc(e.id)+'\\\" checked> '+esc(e.name)+' × '+(e.qty||1)+'</label>';}).join('');window.renderFullCatalog();};" +
            "Promise.all([fetch('https://lightingai.onrender.com/api/fixtures').then(function(r){return r.json();}),fetch('https://lightingai.onrender.com/api/accessories').then(function(r){return r.json();})]).then(function(v){window.catalogFixtures=Array.isArray(v[0])?v[0]:[];window.catalogAccessories=Array.isArray(v[1])?v[1]:[];window.equipment=window.catalogFixtures.map(function(f){return {id:f.id,name:(f.manufacturer||'Aputure')+' '+(f.model||f.id),qty:1,fixtureId:f.id};});renderEquipment();}).catch(function(){var box=document.getElementById('equipmentList');if(box)box.innerHTML='<div class=\\\"status warn\\\">Pravi katalog trenutno nije moguće učitati. Probaj ponovo kada postoji internet veza.</div>';});" +
            "})();";
        webView.evaluateJavascript(js, null);
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
