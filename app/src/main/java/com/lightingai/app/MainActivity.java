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
                    String js = "(function(){" +
                        "function h(v){return String(v==null?'':v).replace(/[&<>\\\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\\\"':'&quot;',\"'\":'&#39;'}[c]||c;});}" +
                        "function parse(v){if(v&&typeof v==='object'&&v.plan!==undefined)v=v.plan;if(typeof v==='string'){var x=v.trim().replace(/^```(?:json)?\\s*/i,'').replace(/\\s*```$/,'');try{return JSON.parse(x);}catch(e){return {summary:x};}}return v||{};}" +
                        "window.renderLightingPlan=function(v,lang){var p=parse(v),sr=lang!=='en',labels=sr?{summary:'Sažetak',key:'Glavno svetlo',fill:'Fill svetlo',backlight:'Kontra / pozadinsko svetlo',negative_fill:'Negativni fill',camera_notes:'Kamera',color_notes:'Boja',safety_notes:'Bezbednost',equipment_list:'Oprema u planu'}:{summary:'Summary',key:'Key light',fill:'Fill light',backlight:'Backlight / background',negative_fill:'Negative fill',camera_notes:'Camera',color_notes:'Color',safety_notes:'Safety',equipment_list:'Equipment in plan'},order=['summary','key','fill','backlight','negative_fill','camera_notes','color_notes','safety_notes','equipment_list'],out='';order.forEach(function(k){var val=p[k];if(val==null||val===''||(Array.isArray(val)&&!val.length))return;out+='<div style=\\\"padding:13px 0;border-bottom:1px solid #292d33\\\"><h3 style=\\\"color:#f5c542;margin:0 0 7px;font-size:14px\\\">'+labels[k]+'</h3>';if(Array.isArray(val)){out+='<ul style=\\\"margin:0;padding-left:20px;line-height:1.5\\\">'+val.map(function(x){return '<li style=\\\"margin:5px 0\\\">'+h(x)+'</li>';}).join('')+'</ul>';}else out+='<div style=\\\"line-height:1.55;white-space:pre-wrap\\\">'+h(val)+'</div>';out+='</div>';});return out||'<div style=\\\"line-height:1.55\\\">'+h(typeof p==='string'?p:JSON.stringify(p))+'</div>';};" +
                        "window.generatePlan=async function(){var t=T[currentLang],p=payload();el('generateBtn').disabled=true;el('planArea').innerHTML='<div class=\\\"status warn\\\">'+t.connecting+'</div>';try{var r=await fetch(PRODUCTION_BACKEND+'/api/lighting-plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});if(!r.ok)throw new Error('HTTP '+r.status);var data=await r.json(),plan=parse(data.plan||data.result||data),saved={id:'p'+Date.now(),createdAt:new Date().toISOString(),...p,scenePhoto:scenePhoto,plan:plan};projects.unshift(saved);write(LS.projects,projects);renderProjects();el('planArea').innerHTML='<div class=\\\"card\\\"><h2 class=\\\"planTitle\\\">'+h(p.project||t.planner)+'</h2>'+window.renderLightingPlan(plan,currentLang)+'<p class=\\\"muted small\\\" style=\\\"margin-top:12px\\\">'+t.saved+'</p></div>';}catch(e){el('planArea').innerHTML='<div class=\\\"status warn\\\">'+t.serviceError+'</div>';}finally{el('generateBtn').disabled=false;}};" +
                        "})();";
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
