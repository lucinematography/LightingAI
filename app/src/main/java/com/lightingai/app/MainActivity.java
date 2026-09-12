package com.lightingai.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.OutputStream;

public class MainActivity extends Activity {
    private WebView webView;
    private String pendingText = null;
    private String pendingName = "lighting-ai-export.json";
    private static final int CREATE_FILE = 501;
    private static final String PRODUCTION_BACKEND = "https://lightingai.onrender.com";

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        setContentView(webView);
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
                if (url != null && url.startsWith("file:///android_asset/")) {
                    String backend = PRODUCTION_BACKEND.replace("\\", "\\\\").replace("'", "\\'");
                    String js = "(function(){try{" +
                        "var key='lighting_settings_v1',cfg={};try{cfg=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(e){}" +
                        "if(!cfg.backendUrl){cfg.backendUrl='" + backend + "';localStorage.setItem(key,JSON.stringify(cfg));}" +
                        "if(typeof settings!=='undefined')settings.backendUrl=cfg.backendUrl;" +
                        "var planner=document.getElementById('planner'),caps=planner.querySelectorAll('label.caption');" +
                        "if(caps.length>=8){caps[0].id='lblProject';caps[1].id='lblScene';caps[2].id='lblType';caps[3].id='lblLook';caps[4].id='lblSpace';caps[5].id='lblCamera';caps[6].id='lblDescription';caps[7].id='lblAvailable';}" +
                        "var oldInput=document.getElementById('scenePhotoInput');if(oldInput)oldInput.setAttribute('capture','environment');" +
                        "var box=document.querySelector('.cameraActions');if(box&&!document.getElementById('galleryBtn')){var gi=document.createElement('input');gi.id='galleryPhotoInput';gi.type='file';gi.accept='image/*';gi.style.display='none';gi.onchange=handleScenePhoto;box.parentNode.insertBefore(gi,box);var gb=document.createElement('button');gb.className='btn secondary';gb.id='galleryBtn';gb.type='button';gb.onclick=function(){gi.click();};box.insertBefore(gb,box.firstChild);}" +
                        "var baseSetLanguage=setLanguage;setLanguage=function(lang){baseSetLanguage(lang);var sr=lang==='sr',q=function(id,t){var e=document.getElementById(id);if(e)e.textContent=t;};" +
                        "q('lblProject',sr?'PROJEKAT':'PROJECT');q('lblScene',sr?'SCENA':'SCENE');q('lblType',sr?'TIP':'TYPE');q('lblLook',sr?'IZGLED':'LOOK');q('lblSpace',sr?'PROSTOR':'SPACE');q('lblCamera',sr?'KAMERA':'CAMERA');q('lblDescription',sr?'OPIS SCENE':'SCENE DESCRIPTION');q('lblAvailable',sr?'DOSTUPNA OPREMA':'AVAILABLE EQUIPMENT');q('galleryBtn',sr?'🖼 DODAJ SLIKU':'🖼 ADD PHOTO');q('cameraBtn',sr?'📷 SLIKAJ SCENU':'📷 CAPTURE SCENE');" +
                        "var pn=document.getElementById('projectName'),sn=document.getElementById('sceneName'),d=document.getElementById('description');if(pn)pn.placeholder=sr?'Naziv projekta':'Project name';if(sn)sn.placeholder=sr?'Scena 01':'Scene 01';if(d)d.placeholder=sr?'Opiši kadar, prozore, pozadinu, prirodno svetlo i željeni izgled...':'Describe the shot, windows, background, available natural light and desired look...';" +
                        "var eq=document.getElementById('eqQty');if(eq)eq.placeholder=sr?'Količina':'Qty';" +
                        "var add=document.querySelector('#equipment .btn.primary');if(add)add.textContent=sr?'DODAJ OPREMU':'ADD EQUIPMENT';" +
                        "var sh=document.querySelector('#settings .card h3');if(sh)sh.textContent='AI backend';var save=document.querySelector('#settings .actions .btn.primary');if(save)save.textContent=sr?'SAČUVAJ':'SAVE';var test=document.querySelector('#settings .actions .btn.secondary');if(test)test.textContent=sr?'TESTIRAJ':'TEST';" +
                        "if(typeof renderStatus==='function')renderStatus();if(sr){var st=document.getElementById('apiStatus');if(st&&settings&&settings.backendUrl)st.innerHTML='<div class=\"status ok\">AI režim podešen • backend se koristi kada je dostupan.</div>';else if(st)st.innerHTML='<div class=\"status warn\">Demo režim • unesi backend URL u Podešavanjima za pravi AI.</div>';}};" +
                        "setLanguage(localStorage.getItem('lighting_language_v1')||'sr');" +
                        "}catch(e){console.log(e);}})();";
                    view.evaluateJavascript(js, null);
                }
            }
        });
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new AndroidBridge(), "Android");
        webView.loadUrl("file:///android_asset/index.html");
    }

    public class AndroidBridge {
        @JavascriptInterface public void saveText(String filename, String text) {
            runOnUiThread(() -> {
                pendingName = filename; pendingText = text;
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
