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
        s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true); s.setAllowContentAccess(true); s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) { super.onPageFinished(view, url); applyNavigationInset(); installCatalogView(); }
        });
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new AndroidBridge(), "Android");
        webView.loadUrl("file:///android_asset/index.html");
        webView.requestApplyInsets();
    }

    private void applyNavigationInset() {
        if (webView == null) return;
        final int cssPx = navigationInsetCssPx;
        webView.post(() -> webView.evaluateJavascript("(function(){var n=document.querySelector('nav');var a=document.querySelector('.app');if(n){n.style.bottom='" + cssPx + "px';n.style.zIndex='9999';}if(a){a.style.paddingBottom='calc(84px + " + cssPx + "px)';}})();", null));
    }

    private void installCatalogView() {
        if (webView == null) return;
        String js = "(function(){" +
            "window.catalogFixtures=[];window.catalogAccessories=[];window.equipment=[];window.catalogArmed=null;window.catalogOpen={aputure:false,aputureFixtures:false,aputureAccessories:false,arri:false,arriFixtures:false,arriAccessories:false};" +
            "function esc(v){return String(v==null?'':v).replace(/[&<>\\\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\\\"':'&quot;',\"'\":'&#39;'}[c]||c;});}" +
            "function nameFixture(f){return (f.manufacturer||'Aputure')+' '+(f.model||f.id);}" +
            "function nameAccessory(a){return (a.manufacturer||'Aputure')+' '+(a.model||a.id);}" +
            "function maker(x){return String(x.manufacturer||'Aputure').toLowerCase();}" +
            "function isSelected(id){return window.equipment.some(function(e){return e.id===id;});}" +
            "function accessoryMatchesFixture(a,fid){var c=a.compatibleWith||[];if(c.indexOf(fid)>=0)return true;return JSON.stringify(a).indexOf(fid)>=0;}" +
            "function saveOpen(){document.querySelectorAll('#equipmentList details[data-open-key]').forEach(function(x){window.catalogOpen[x.getAttribute('data-open-key')]=x.open;});}" +
            "function openAttr(k){return window.catalogOpen[k]?' open':'';}" +
            "function hint(id,sr){return window.catalogArmed===id?'<div class=\\\"muted small\\\" style=\\\"padding:3px 8px;color:#f5c542\\\">'+(sr?'Klikni još jednom za izbor':'Tap once more to select')+'</div>':'';}" +
            "function fixtureRows(list,sr,accent){var h='';list.forEach(function(f){var on=isSelected(f.id);h+='<div style=\\\"margin-bottom:8px\\\"><button class=\\\"btn '+(on?'primary':'secondary')+'\\\" style=\\\"width:100%;text-align:left;margin:5px 0\\\" onclick=\\\"confirmCatalogItem(\\\'fixture\\\',\\\''+esc(f.id)+'\\\')\\\">'+(on?'✓ ':'＋ ')+esc(nameFixture(f))+'</button>'+hint(f.id,sr);if(on){var own=window.catalogAccessories.filter(function(a){return maker(a)===maker(f)&&accessoryMatchesFixture(a,f.id);});h+='<div style=\\\"margin:4px 0 12px 12px;padding:10px;border-left:2px solid '+accent+'\\\"><div class=\\\"muted small\\\" style=\\\"margin-bottom:6px\\\">'+(sr?'DODACI ZA ':'ACCESSORIES FOR ')+esc(nameFixture(f))+' ('+own.length+')</div>';own.forEach(function(a){var aon=isSelected(a.id);h+='<button class=\\\"btn '+(aon?'primary':'secondary')+'\\\" style=\\\"width:100%;text-align:left;margin:4px 0\\\" onclick=\\\"confirmCatalogItem(\\\'accessory\\\',\\\''+esc(a.id)+'\\\')\\\">'+(aon?'✓ ':'＋ ')+esc(nameAccessory(a))+'</button>'+hint(a.id,sr);});h+='</div>';}h+='</div>';});return h;}" +
            "function accessoryRows(list,sr){var h='';list.forEach(function(a){var on=isSelected(a.id),compat=(a.compatibleWith||[]).join(', ');h+='<div style=\\\"margin-bottom:8px\\\"><button class=\\\"btn '+(on?'primary':'secondary')+'\\\" style=\\\"width:100%;text-align:left\\\" onclick=\\\"confirmCatalogItem(\\\'accessory\\\',\\\''+esc(a.id)+'\\\')\\\">'+(on?'✓ ':'＋ ')+esc(nameAccessory(a))+'</button>'+hint(a.id,sr)+(compat?'<div class=\\\"muted small\\\" style=\\\"padding:4px 8px\\\">'+(sr?'Kompatibilno sa: ':'Compatible with: ')+esc(compat)+'</div>':'')+'</div>';});return h;}" +
            "window.confirmCatalogItem=function(kind,id){saveOpen();if(window.catalogArmed!==id){window.catalogArmed=id;renderFullCatalog();return;}window.catalogArmed=null;var src=kind==='fixture'?window.catalogFixtures:window.catalogAccessories,x=src.find(function(v){return v.id===id;});if(!x)return;var i=window.equipment.findIndex(function(e){return e.id===id;});if(i>=0)window.equipment.splice(i,1);else window.equipment.push({id:x.id,name:kind==='fixture'?nameFixture(x):nameAccessory(x),qty:1,fixtureId:kind==='fixture'?x.id:undefined,accessoryId:kind==='accessory'?x.id:undefined});renderEquipment();};" +
            "window.renderFullCatalog=function(){saveOpen();var box=document.getElementById('equipmentList');if(!box)return;var old=document.getElementById('catalogSearch'),q=(old?old.value:'').toLowerCase(),sr=(window.currentLang||'sr')==='sr';var allF=window.catalogFixtures.filter(function(x){return JSON.stringify(x).toLowerCase().indexOf(q)>=0;}),allA=window.catalogAccessories.filter(function(x){return JSON.stringify(x).toLowerCase().indexOf(q)>=0;});var af=allF.filter(function(x){return maker(x).indexOf('aputure')>=0;}),aa=allA.filter(function(x){return maker(x).indexOf('aputure')>=0;}),rf=allF.filter(function(x){return maker(x).indexOf('arri')>=0;}),ra=allA.filter(function(x){return maker(x).indexOf('arri')>=0;});var h='<div class=\\\"card\\\"><b>'+(sr?'PRETRAGA KATALOGA':'CATALOG SEARCH')+'</b><input id=\\\"catalogSearch\\\" style=\\\"margin-top:10px\\\" placeholder=\\\"'+(sr?'Pretraži proizvođača, svetla i opremu...':'Search manufacturer, fixtures and equipment...')+'\\\" value=\\\"'+esc(q)+'\\\" oninput=\\\"catalogArmed=null;renderFullCatalog()\\\"></div>';" +
            "h+='<details data-open-key=\\\"aputure\\\" class=\\\"card\\\"'+openAttr('aputure')+' style=\\\"border:1px solid #6f6f6f;background:linear-gradient(135deg,#191919,#292929);\\\"><summary style=\\\"font-weight:900;font-size:21px;cursor:pointer;letter-spacing:.5px;color:#f2f2f2\\\"><span style=\\\"display:inline-block;border:1px solid #d8d8d8;border-radius:6px;padding:3px 8px;margin-right:8px;font-size:13px;color:#fff\\\">APUTURE</span> Aputure <span style=\\\"font-size:12px;opacity:.75\\\">('+(af.length+aa.length)+')</span></summary><div style=\\\"margin-top:12px\\\"><details data-open-key=\\\"aputureFixtures\\\" class=\\\"card\\\"'+openAttr('aputureFixtures')+' style=\\\"background:#222;border-color:#555\\\"><summary style=\\\"font-weight:800;font-size:18px;cursor:pointer\\\">'+(sr?'RASVETNA TELA':'FIXTURES')+' ('+af.length+')</summary><div style=\\\"margin-top:12px\\\">'+fixtureRows(af,sr,'#f5c542')+'</div></details><details data-open-key=\\\"aputureAccessories\\\" class=\\\"card\\\"'+openAttr('aputureAccessories')+' style=\\\"background:#222;border-color:#555\\\"><summary style=\\\"font-weight:800;font-size:18px;cursor:pointer\\\">'+(sr?'DODATNA OPREMA':'ACCESSORIES')+' ('+aa.length+')</summary><div style=\\\"margin-top:12px\\\">'+accessoryRows(aa,sr)+'</div></details></div></details>';" +
            "h+='<details data-open-key=\\\"arri\\\" class=\\\"card\\\"'+openAttr('arri')+' style=\\\"border:1px solid #60758a;background:linear-gradient(135deg,#17212b,#253443);\\\"><summary style=\\\"font-weight:900;font-size:21px;cursor:pointer;color:#b9cee0\\\"><span style=\\\"display:inline-block;border:1px solid #8da6ba;border-radius:6px;padding:3px 8px;margin-right:8px;font-size:13px\\\">ARRI</span> ARRI <span style=\\\"font-size:12px;opacity:.75\\\">('+(rf.length+ra.length)+')</span></summary><div style=\\\"margin-top:12px\\\"><details data-open-key=\\\"arriFixtures\\\" class=\\\"card\\\"'+openAttr('arriFixtures')+'><summary style=\\\"font-weight:800;font-size:18px;cursor:pointer;color:#c8d8e5\\\">'+(sr?'RASVETNA TELA':'FIXTURES')+' ('+rf.length+')</summary><div style=\\\"margin-top:12px\\\">'+fixtureRows(rf,sr,'#8da6ba')+'</div></details><details data-open-key=\\\"arriAccessories\\\" class=\\\"card\\\"'+openAttr('arriAccessories')+'><summary style=\\\"font-weight:800;font-size:18px;cursor:pointer;color:#c8d8e5\\\">'+(sr?'DODATNA OPREMA':'ACCESSORIES')+' ('+ra.length+')</summary><div style=\\\"margin-top:12px\\\">'+accessoryRows(ra,sr)+'</div></details></div></details>';box.innerHTML=h;};" +
            "window.renderEquipment=function(){var checks=document.getElementById('equipmentChecks');if(checks){checks.innerHTML=window.equipment.length?window.equipment.map(function(e){return '<label class=\\\"chip\\\"><input type=\\\"checkbox\\\" value=\\\"'+esc(e.id)+'\\\" checked> '+esc(e.name)+' × '+(e.qty||1)+'</label>';}).join(''):'<div class=\\\"muted small\\\" style=\\\"grid-column:1/-1;padding:10px 0\\\">'+((window.currentLang||'sr')==='sr'?'Nema izabrane opreme. Izaberi je u katalogu Oprema.':'No equipment selected. Choose it in Equipment catalog.')+'</div>';}renderFullCatalog();};window.selected=function(){return window.equipment.slice();};" +
            "Promise.all([fetch('https://lightingai.onrender.com/api/fixtures').then(function(r){return r.json();}),fetch('https://lightingai.onrender.com/api/accessories').then(function(r){return r.json();})]).then(function(v){window.catalogFixtures=Array.isArray(v[0])?v[0]:[];window.catalogAccessories=Array.isArray(v[1])?v[1]:[];window.equipment=[];renderEquipment();}).catch(function(){var box=document.getElementById('equipmentList');if(box)box.innerHTML='<div class=\\\"status warn\\\">Pravi katalog trenutno nije moguće učitati. Probaj ponovo kada postoji internet veza.</div>';});})();";
        webView.evaluateJavascript(js, null);
    }

    public class AndroidBridge {
        @JavascriptInterface public void saveText(String filename, String text) { runOnUiThread(() -> { pendingText = text; Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT); intent.addCategory(Intent.CATEGORY_OPENABLE); intent.setType("application/json"); intent.putExtra(Intent.EXTRA_TITLE, filename); startActivityForResult(intent, CREATE_FILE); }); }
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == CREATE_FILE && resultCode == RESULT_OK && data != null && pendingText != null) {
            Uri uri = data.getData();
            try (OutputStream out = getContentResolver().openOutputStream(uri)) { if (out != null) out.write(pendingText.getBytes(java.nio.charset.StandardCharsets.UTF_8)); } catch (Exception ignored) {}
            pendingText = null;
        }
    }

    @Override public void onBackPressed() { if (webView.canGoBack()) webView.goBack(); else super.onBackPressed(); }
}
