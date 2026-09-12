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
            "window.catalogFixtures=[];window.catalogAccessories=[];window.equipment=[];" +
            "function esc(v){return String(v==null?'':v).replace(/[&<>\\\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\\\"':'&quot;',\"'\":'&#39;'}[c]||c;});}" +
            "function nameFixture(f){return (f.manufacturer||'Aputure')+' '+(f.model||f.id);}" +
            "function nameAccessory(a){return (a.manufacturer||'Aputure')+' '+(a.model||a.id);}" +
            "function isSelected(id){return window.equipment.some(function(e){return e.id===id;});}" +
            "window.toggleCatalogItem=function(kind,id){var src=kind==='fixture'?window.catalogFixtures:window.catalogAccessories;var x=src.find(function(v){return v.id===id;});if(!x)return;var i=window.equipment.findIndex(function(e){return e.id===id;});if(i>=0){window.equipment.splice(i,1);}else{window.equipment.push({id:x.id,name:kind==='fixture'?nameFixture(x):nameAccessory(x),qty:1,fixtureId:kind==='fixture'?x.id:undefined,accessoryId:kind==='accessory'?x.id:undefined});}renderEquipment();};" +
            "window.renderFullCatalog=function(){var box=document.getElementById('equipmentList');if(!box)return;var old=document.getElementById('catalogSearch');var q=old?old.value:'';q=q.toLowerCase();var sr=(window.currentLang||'sr')==='sr';var fs=window.catalogFixtures.filter(function(x){return JSON.stringify(x).toLowerCase().indexOf(q)>=0;});var as=window.catalogAccessories.filter(function(x){return JSON.stringify(x).toLowerCase().indexOf(q)>=0;});" +
            "var h='<div class=\\\"card\\\"><b>'+(sr?'PRETRAGA KATALOGA':'CATALOG SEARCH')+'</b><input id=\\\"catalogSearch\\\" style=\\\"margin-top:10px\\\" placeholder=\\\"'+(sr?'Pretraži proizvođača, svetla i opremu...':'Search manufacturer, fixtures and equipment...')+'\\\" value=\\\"'+esc(q)+'\\\" oninput=\\\"renderFullCatalog()\\\"></div>';" +
            "h+='<details class=\\\"card\\\" open><summary style=\\\"font-weight:900;font-size:21px;cursor:pointer;letter-spacing:.5px\\\"><span style=\\\"display:inline-block;border:1px solid currentColor;border-radius:6px;padding:3px 8px;margin-right:8px;font-size:13px\\\">APUTURE</span> Aputure <span class=\\\"muted small\\\">('+(fs.length+as.length)+')</span></summary><div style=\\\"margin-top:12px\\\">';" +
            "h+='<details class=\\\"card\\\"><summary style=\\\"font-weight:800;font-size:18px;cursor:pointer\\\">'+(sr?'RASVETNA TELA':'FIXTURES')+' ('+fs.length+')</summary><div style=\\\"margin-top:12px\\\">';fs.forEach(function(f){var on=isSelected(f.id);h+='<button class=\\\"btn '+(on?'primary':'secondary')+'\\\" style=\\\"width:100%;text-align:left;margin:5px 0\\\" onclick=\\\"toggleCatalogItem(\\\'fixture\\\',\\\''+esc(f.id)+'\\\')\\\">'+(on?'✓ ':'＋ ')+esc(nameFixture(f))+'</button>';});h+='</div></details>';" +
            "h+='<details class=\\\"card\\\"><summary style=\\\"font-weight:800;font-size:18px;cursor:pointer\\\">'+(sr?'DODATNA OPREMA':'ACCESSORIES')+' ('+as.length+')</summary><div style=\\\"margin-top:12px\\\">';as.forEach(function(a){var on=isSelected(a.id);var compat=(a.compatibleWith||[]).join(', ');h+='<div style=\\\"margin-bottom:8px\\\"><button class=\\\"btn '+(on?'primary':'secondary')+'\\\" style=\\\"width:100%;text-align:left\\\" onclick=\\\"toggleCatalogItem(\\\'accessory\\\',\\\''+esc(a.id)+'\\\')\\\">'+(on?'✓ ':'＋ ')+esc(nameAccessory(a))+'</button>'+(compat?'<div class=\\\"muted small\\\" style=\\\"padding:4px 8px\\\">'+(sr?'Kompatibilno sa: ':'Compatible with: ')+esc(compat)+'</div>':'')+'</div>';});h+='</div></details></div></details>';box.innerHTML=h;};" +
            "window.renderEquipment=function(){var checks=document.getElementById('equipmentChecks');if(checks){checks.innerHTML=window.equipment.length?window.equipment.map(function(e){return '<label class=\\\"chip\\\"><input type=\\\"checkbox\\\" value=\\\"'+esc(e.id)+'\\\" checked> '+esc(e.name)+' × '+(e.qty||1)+'</label>';}).join(''):'<div class=\\\"muted small\\\" style=\\\"grid-column:1/-1;padding:10px 0\\\">'+((window.currentLang||'sr')==='sr'?'Nema izabrane opreme. Izaberi je u katalogu Oprema.':'No equipment selected. Choose it in Equipment catalog.')+'</div>';}window.renderFullCatalog();};" +
            "window.selected=function(){return window.equipment.slice();};" +
            "Promise.all([fetch('https://lightingai.onrender.com/api/fixtures').then(function(r){return r.json();}),fetch('https://lightingai.onrender.com/api/accessories').then(function(r){return r.json();})]).then(function(v){window.catalogFixtures=Array.isArray(v[0])?v[0]:[];window.catalogAccessories=Array.isArray(v[1])?v[1]:[];window.equipment=[];renderEquipment();}).catch(function(){var box=document.getElementById('equipmentList');if(box)box.innerHTML='<div class=\\\"status warn\\\">Pravi katalog trenutno nije moguće učitati. Probaj ponovo kada postoji internet veza.</div>';});" +
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
