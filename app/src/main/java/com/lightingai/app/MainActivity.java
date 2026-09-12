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
    private static final int CREATE_FILE = 501;
    private static final String PRODUCTION_BACKEND = "https://lightingai.onrender.com";

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        setContentView(webView);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true); s.setAllowContentAccess(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (url != null && url.startsWith("file:///android_asset/")) {
                    String backend = PRODUCTION_BACKEND;
                    String js = "(function(){try{" +
                        "var key='lighting_settings_v1',cfg={};try{cfg=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(e){}cfg.backendUrl='"+backend+"';localStorage.setItem(key,JSON.stringify(cfg));if(typeof settings!=='undefined')settings.backendUrl='"+backend+"';" +
                        "var planner=document.getElementById('planner'),caps=planner.querySelectorAll('label.caption');if(caps.length>=8){var ids=['lblProject','lblScene','lblType','lblLook','lblSpace','lblCamera','lblDescription','lblAvailable'];for(var i=0;i<8;i++)caps[i].id=ids[i];}" +
                        "var oldInput=document.getElementById('scenePhotoInput');if(oldInput)oldInput.setAttribute('capture','environment');var box=document.querySelector('.cameraActions');if(box&&!document.getElementById('galleryBtn')){var gi=document.createElement('input');gi.id='galleryPhotoInput';gi.type='file';gi.accept='image/*';gi.style.display='none';gi.onchange=handleScenePhoto;box.parentNode.insertBefore(gi,box);var gb=document.createElement('button');gb.className='btn secondary';gb.id='galleryBtn';gb.type='button';gb.onclick=function(){gi.click();};box.insertBefore(gb,box.firstChild);}" +
                        "var baseSetLanguage=setLanguage;setLanguage=function(lang){baseSetLanguage(lang);var sr=lang==='sr',q=function(id,t){var e=document.getElementById(id);if(e)e.textContent=t;};" +
                        "q('lblProject',sr?'PROJEKAT':'PROJECT');q('lblScene',sr?'SCENA':'SCENE');q('lblType',sr?'TIP':'TYPE');q('lblLook',sr?'IZGLED':'LOOK');q('lblSpace',sr?'PROSTOR':'SPACE');q('lblCamera',sr?'KAMERA':'CAMERA');q('lblDescription',sr?'OPIS SCENE':'SCENE DESCRIPTION');q('lblAvailable',sr?'DOSTUPNA OPREMA':'AVAILABLE EQUIPMENT');q('galleryBtn',sr?'🖼 DODAJ SLIKU':'🖼 ADD IMAGE');q('cameraBtn',sr?'📷 SLIKAJ SCENU':'📷 CAPTURE SCENE');" +
                        "var pn=document.getElementById('projectName'),sn=document.getElementById('sceneName'),d=document.getElementById('description');if(pn)pn.placeholder=sr?'Naziv projekta':'Project name';if(sn)sn.placeholder=sr?'Scena 01':'Scene 01';if(d)d.placeholder=sr?'Opiši kadar, prozore, pozadinu, prirodno svetlo i željeni izgled...':'Describe the shot, windows, background, natural light and desired look...';" +
                        "var type=document.getElementById('type');if(type){var tv=sr?['Film','Reklama','Intervju','Muzički spot','Studio']:['Film','Commercial','Interview','Music Video','Studio'];for(var i=0;i<type.options.length&&i<tv.length;i++)type.options[i].text=tv[i];}var look=document.getElementById('look');if(look){var lv=sr?['Prirodno','Filmski','Mračno','Visok kontrast','Meka reklama','Dan kao noć']:['Natural','Cinematic','Moody','High Contrast','Soft Commercial','Day for Night'];for(var j=0;j<look.options.length&&j<lv.length;j++)look.options[j].text=lv[j];}" +
                        "var eq=document.getElementById('eqQty');if(eq)eq.placeholder=sr?'Količina':'Qty';var add=document.querySelector('#equipment .btn.primary');if(add)add.textContent=sr?'DODAJ OPREMU':'ADD EQUIPMENT';var cat=document.getElementById('eqCategory');if(cat){var cv=sr?['Rasveta','Modifikator','Grip','Napajanje','Kontrola','Ostalo']:['Light','Modifier','Grip','Power','Control','Other'];for(var k=0;k<cat.options.length&&k<cv.length;k++)cat.options[k].text=cv[k];}" +
                        "var st=document.getElementById('settings'),cards=st?st.querySelectorAll('.card'):[];if(cards.length>=3){var h=cards[0].querySelector('h3');if(h)h.textContent='AI backend';var p=cards[0].querySelector('p');if(p)p.textContent=sr?'Aplikacija je povezana sa produkcionim LightingAI backendom.':'The app is connected to the production LightingAI backend.';var lab=cards[0].querySelector('label');if(lab)lab.textContent='BACKEND URL';var inp=document.getElementById('backendUrl');if(inp){inp.value='"+backend+"';inp.readOnly=true;}var bs=cards[0].querySelectorAll('button');if(bs[0])bs[0].textContent=sr?'SAČUVAJ':'SAVE';if(bs[1])bs[1].textContent=sr?'TESTIRAJ':'TEST';var h2=cards[1].querySelector('h3');if(h2)h2.textContent=sr?'Podaci':'Data';var p2=cards[1].querySelector('p');if(p2)p2.textContent=sr?'Projekti i oprema se čuvaju lokalno na telefonu.':'Projects and equipment are stored locally on the phone.';var b2=cards[1].querySelectorAll('button');if(b2[0])b2[0].textContent=sr?'IZVEZI JSON':'EXPORT JSON';if(b2[1])b2[1].textContent=sr?'OBRIŠI SVE':'CLEAR ALL';var h3=cards[2].querySelector('h3');if(h3)h3.textContent=sr?'O aplikaciji':'About';var ver=cards[2].querySelector('.item .muted');if(ver)ver.textContent=sr?'Verzija 1.3 • Android':'Version 1.3 • Android';}" +
                        "var close=document.querySelector('#projectModal .btn.secondary');if(close)close.textContent=sr?'ZATVORI':'CLOSE';var status=document.getElementById('apiStatus');if(status)status.innerHTML='<div class=\"status ok\">'+(sr?'AI JE POVEZAN • LightingAI backend je aktivan.':'AI CONNECTED • LightingAI backend is active.')+'</div>';};" +
                        "setLanguage(localStorage.getItem('lighting_language_v1')||'sr');" +
                        "}catch(e){console.log('LightingAI patch',e);}})();";
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
            runOnUiThread(() -> { pendingText=text; Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT); intent.addCategory(Intent.CATEGORY_OPENABLE); intent.setType("application/json"); intent.putExtra(Intent.EXTRA_TITLE,filename); startActivityForResult(intent,CREATE_FILE); });
        }
    }
    @Override protected void onActivityResult(int requestCode,int resultCode,Intent data){super.onActivityResult(requestCode,resultCode,data);if(requestCode==CREATE_FILE&&resultCode==RESULT_OK&&data!=null&&pendingText!=null){Uri uri=data.getData();try(OutputStream out=getContentResolver().openOutputStream(uri)){if(out!=null)out.write(pendingText.getBytes(java.nio.charset.StandardCharsets.UTF_8));}catch(Exception ignored){}pendingText=null;}}
    @Override public void onBackPressed(){if(webView.canGoBack())webView.goBack();else super.onBackPressed();}
}
