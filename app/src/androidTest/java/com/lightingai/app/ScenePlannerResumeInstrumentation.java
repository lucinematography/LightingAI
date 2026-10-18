package com.lightingai.app;

import android.app.Activity;
import android.app.Instrumentation;
import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebView;
import java.lang.reflect.Field;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/** Offline synthetic Issue 416 regression; installed only on the disposable emulator. */
public final class ScenePlannerResumeInstrumentation extends Instrumentation {
    private Activity activity;
    private WebView webView;
    private String phase;
    @Override public void onCreate(Bundle args) { super.onCreate(args);phase=args==null?null:args.getString("phase");start(); }
    @Override public void onStart() {
        Bundle result=new Bundle();
        try {
            if(getTargetContext().checkCallingOrSelfPermission(android.Manifest.permission.INTERNET)==android.content.pm.PackageManager.PERMISSION_GRANTED)
                throw new IllegalStateException("Offline test APK must not have INTERNET permission");
            activity=startActivitySync(getTargetContext().getPackageManager().getLaunchIntentForPackage(getTargetContext().getPackageName()));
            refreshWebView();waitFor("!!window.LightingAIScenePlannerDraft && !!window.LightingAIScenePlanner");
            if("prepare".equals(phase)) prepare();
            else if("restore".equals(phase)) {assertRestored();assertMissingVideo();}
            else throw new IllegalArgumentException("Expected prepare or restore");
            result.putString("stream","ISSUE416_PASS "+phase+"\n");finish(Activity.RESULT_OK,result);
        } catch(Exception e) {result.putString("stream","ISSUE416_FAIL "+phase+": "+e+"\n");finish(Activity.RESULT_CANCELED,result);}
    }
    private void refreshWebView() throws Exception {Field f=MainActivity.class.getDeclaredField("webView");f.setAccessible(true);webView=(WebView)f.get(activity);}
    private String js(String code) throws Exception {
        CountDownLatch latch=new CountDownLatch(1);AtomicReference<String> value=new AtomicReference<>();
        runOnMainSync(()->webView.evaluateJavascript(code,r->{value.set(r);latch.countDown();}));
        if(!latch.await(8,TimeUnit.SECONDS))throw new IllegalStateException("WebView did not answer");return value.get();
    }
    private void waitFor(String expression) throws Exception {
        long deadline=System.currentTimeMillis()+30000;
        while(System.currentTimeMillis()<deadline){if("true".equals(js("!!("+expression+")")))return;Thread.sleep(200);}
        throw new IllegalStateException("Timed out: "+expression+"; UI="+js("JSON.stringify({error:window.__issue416Error,disabled:document.getElementById('sp-local')&&document.getElementById('sp-local').disabled,status:document.getElementById('sp-status')&&document.getElementById('sp-status').textContent,video:document.getElementById('sp-video-note')&&document.getElementById('sp-video-note').textContent,history:localStorage.getItem('lighting_scene_planner_revisions_v1')&&JSON.parse(localStorage.getItem('lighting_scene_planner_revisions_v1')).length})"));
    }
    private void assertRestored() throws Exception {
        waitFor("document.getElementById('sp-description') && document.getElementById('sp-description').value==='Issue416 synthetic scene'");
        waitFor("JSON.parse(localStorage.getItem('lighting_scene_planner_revisions_v1')||'[]').length===1 && document.getElementById('sp-result').textContent.length>20");
        waitFor("document.getElementById('sp-iso').value==='1600' && document.getElementById('lightingai-scene-planner-overlay').scrollTop>=400");
        waitFor("document.getElementById('lightingai-scene-planner-overlay').getBoundingClientRect().height>100 && getComputedStyle(document.getElementById('lightingai-scene-planner-overlay')).visibility==='visible'");
    }
    private void assertMissingVideo() throws Exception {waitFor("document.getElementById('sp-video-note').textContent.indexOf('Prethodni video')==0");}
    private void prepare() throws Exception {
        js("window.addEventListener('unhandledrejection',function(e){window.__issue416Error=String(e.reason&&e.reason.stack||e.reason)});LightingAIScenePlanner.open()");waitFor("!!document.getElementById('sp-local') && !!window.LightingAIScenePlannerCore");
        // Generate a tiny synthetic video in memory. No camera, microphone, network or private file.
        js("(async function(){try{var c=document.createElement('canvas');c.width=64;c.height=64;var ctx=c.getContext('2d'),s=c.captureStream(12),chunks=[],r=new MediaRecorder(s,{mimeType:'video/webm'});"+
           "r.ondataavailable=function(e){if(e.data.size)chunks.push(e.data);};var done=new Promise(function(ok){r.onstop=ok;});r.start();var i=0,t=setInterval(function(){ctx.fillStyle=i++%2?'#aabbcc':'#334455';ctx.fillRect(0,0,64,64);},60);"+
           "await new Promise(function(ok){setTimeout(ok,1400);});r.stop();await done;clearInterval(t);s.getTracks().forEach(function(x){x.stop();});"+
           "document.getElementById('sp-video-input').onchange({target:{files:[new File(chunks,'synthetic.webm',{type:'video/webm'})],value:''}});window.__issue416VideoReady=true;}catch(e){window.__issue416VideoError=String(e);}})()");
        waitFor("window.__issue416VideoReady && document.getElementById('sp-video-note').textContent.indexOf('Izdvojena 6 ')==0");
        js("document.getElementById('sp-description').value='Issue416 synthetic scene';document.getElementById('sp-iso').value='1600';document.getElementById('sp-mode').value='best';document.getElementById('sp-local').click()");
        waitFor("JSON.parse(localStorage.getItem('lighting_scene_planner_revisions_v1')||'[]').length===1");
        js("document.getElementById('lightingai-scene-planner-overlay').scrollTop=500;LightingAIScenePlannerDraft.flush()");
        for(int i=0;i<2;i++) {
            final WebView original=webView;
            runOnMainSync(()->activity.moveTaskToBack(true));Thread.sleep(600);
            Intent intent=getTargetContext().getPackageManager().getLaunchIntentForPackage(getTargetContext().getPackageName());
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);getTargetContext().startActivity(intent);Thread.sleep(500);
            refreshWebView();if(original!=webView)throw new IllegalStateException("Normal return replaced live WebView");
            assertRestored();waitFor("document.getElementById('sp-video').src.indexOf('blob:')===0 && document.getElementById('sp-video-note').textContent.indexOf('Prethodni video')<0");
        }
        ActivityMonitor monitor=addMonitor(MainActivity.class.getName(),null,false);
        runOnMainSync(()->activity.recreate());Activity recreated=waitForMonitorWithTimeout(monitor,20000);removeMonitor(monitor);
        if(recreated==null)throw new IllegalStateException("Activity recreation failed");activity=recreated;refreshWebView();assertRestored();assertMissingVideo();
        final WebView failed=webView;
        runOnMainSync(()->{if(failed.getWebViewRenderProcess()==null||!failed.getWebViewRenderProcess().terminate())throw new IllegalStateException("Cannot terminate renderer");});
        long deadline=System.currentTimeMillis()+20000;
        do {Thread.sleep(200);refreshWebView();} while((webView==null||webView==failed)&&System.currentTimeMillis()<deadline);
        if(webView==null||webView==failed)throw new IllegalStateException("Renderer WebView not replaced");assertRestored();assertMissingVideo();
        waitFor("document.getElementById('lightingai-scene-planner-overlay').scrollTop>=400");Thread.sleep(500);
        runOnMainSync(()->((MainActivity)activity).onBackPressed());
        waitFor("!document.getElementById('lightingai-scene-planner-overlay') && !LightingAIScenePlannerDraft.shouldReopen()");
        waitFor("JSON.parse(localStorage.getItem('lighting_scene_planner_revisions_v1')||'[]').length===1");
        js("LightingAIScenePlanner.open()");assertRestored();assertMissingVideo();
        js("LightingAIScenePlannerDraft.flush()");
    }
}
