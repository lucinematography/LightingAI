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
            else if("focus-stress".equals(phase)) focusStress();
            else throw new IllegalArgumentException("Expected prepare, restore or focus-stress");
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
    private void loadSyntheticVideo(int durationMs,int width,int height) throws Exception {
        // Encoded synthetic media only; no microphone, network or private file.
        js("window.__issue416VideoReady=false");
        js("(async function(){try{var c=document.createElement('canvas');c.width="+width+";c.height="+height+";var ctx=c.getContext('2d'),s=c.captureStream(12),chunks=[],r=new MediaRecorder(s,{mimeType:'video/webm'});"+
           "r.ondataavailable=function(e){if(e.data.size)chunks.push(e.data);};var done=new Promise(function(ok){r.onstop=ok;});r.start();var i=0,t=setInterval(function(){ctx.fillStyle=i++%2?'#aabbcc':'#334455';ctx.fillRect(0,0,c.width,c.height);},60);"+
           "await new Promise(function(ok){setTimeout(ok,"+durationMs+");});r.stop();await done;clearInterval(t);s.getTracks().forEach(function(x){x.stop();});"+
           "document.getElementById('sp-video-input').onchange({target:{files:[new File(chunks,'synthetic.webm',{type:'video/webm'})],value:''}});window.__issue416VideoReady=true;}catch(e){window.__issue416VideoError=String(e);}})()");
        waitFor("window.__issue416VideoReady && document.getElementById('sp-video-note').textContent.indexOf('Izdvojena 6 ')==0");
    }
    private long focusField(String name) throws Exception {
        Field field=MainActivity.class.getDeclaredField(name);field.setAccessible(true);
        java.util.concurrent.atomic.AtomicLong value=new java.util.concurrent.atomic.AtomicLong();
        runOnMainSync(()->{try{value.set(field.getLong(activity));}catch(IllegalAccessException e){throw new IllegalStateException(e);}});
        return value.get();
    }
    private void shell(String command) throws Exception {
        try(android.os.ParcelFileDescriptor pipe=getUiAutomation().executeShellCommand(command);
            java.io.InputStream in=new android.os.ParcelFileDescriptor.AutoCloseInputStream(pipe)) {
            byte[] buffer=new byte[1024];while(in.read(buffer)>=0) {}
        }
    }
    private static void assertFocusScreenshot(android.graphics.Bitmap shot,android.graphics.Bitmap reference) {
        if(shot.getWidth()!=reference.getWidth()||shot.getHeight()!=reference.getHeight())throw new IllegalStateException("Window size changed");
        int bright=0,matching=0,total=0;
        // Exclude system bars; compare the ENTIRE app region, including video and native overlays.
        for(int y=shot.getHeight()/10;y<shot.getHeight()*9/10;y+=8)for(int x=0;x<shot.getWidth();x+=8){
            int pixel=shot.getPixel(x,y),expected=reference.getPixel(x,y);total++;
            int r=android.graphics.Color.red(pixel),g=android.graphics.Color.green(pixel),b=android.graphics.Color.blue(pixel);
            if(Math.max(r,Math.max(g,b))>80)bright++;
            if(Math.abs(r-android.graphics.Color.red(expected))+Math.abs(g-android.graphics.Color.green(expected))+Math.abs(b-android.graphics.Color.blue(expected))<90)matching++;
        }
        if(total==0||bright*100<total)throw new IllegalStateException("Whole app window black/blank");
        if(matching*100<total*55)throw new IllegalStateException("Window does not match Planner; possible recents/overlay capture");
    }
    private void focusStress() throws Exception {
        // A separate synthetic scene preserves every existing scene/revision.
        js("LightingAIScenePlanner.open()");waitFor("document.getElementById('sp-scene-create') && !document.getElementById('sp-scene-create').disabled");
        js("document.getElementById('sp-scene-name').value='Focus stress synthetic';document.getElementById('sp-scene-create').click()");
        waitFor("!document.getElementById('sp-scene-create').disabled");loadSyntheticVideo(20000,640,360);
        js("document.getElementById('sp-description').value='Issue416 synthetic scene';document.getElementById('sp-iso').value='1600';document.getElementById('sp-local').click()");
        waitFor("!document.getElementById('sp-result').hidden");
        String saved=js("JSON.stringify({scene:LightingAIScenePlannerDraft.activeSceneId(),revisions:localStorage.getItem('lighting_scene_planner_revisions_v1'),description:document.getElementById('sp-description').value,video:document.getElementById('sp-video').src})");
        js("document.getElementById('sp-video').muted=true;document.getElementById('sp-video').loop=true;document.getElementById('sp-video').scrollIntoView({block:'center'})");
        String scroll=js("document.getElementById('lightingai-scene-planner-overlay').scrollTop");
        java.io.File folder=new java.io.File(getTargetContext().getExternalFilesDir(null),"issue416-focus-stress-"+System.currentTimeMillis());
        if(!folder.mkdirs())throw new IllegalStateException("Cannot create screenshot folder");
        Thread.sleep(1400);android.graphics.Bitmap reference=getUiAutomation().takeScreenshot();
        if(reference==null)throw new IllegalStateException("Reference screenshot unavailable");
        try {
        for(int mode=0;mode<2;mode++) for(int i=0;i<30;i++) {
            js(mode==0?"document.getElementById('sp-video').pause()":"document.getElementById('sp-video').play().catch(function(e){window.__focusPlaybackError=String(e)})");
            if(mode==1)waitFor("!document.getElementById('sp-video').paused && !window.__focusPlaybackError");
            final WebView original=webView;long before=focusField("plannerFocusGeneration");
            shell("am start -a android.settings.SETTINGS");Thread.sleep(1400);
            shell("input keyevent KEYCODE_APP_SWITCH");Thread.sleep(1000);
            android.graphics.Point size=new android.graphics.Point();activity.getWindowManager().getDefaultDisplay().getRealSize(size);
            // Portrait emulator recents: previous app card at the left edge. Fail if it is not selected.
            if(size.x>=size.y)throw new IllegalStateException("Portrait recents layout required");
            shell("input tap "+Math.max(1,size.x/25)+" "+size.y/2);
            long retryAt=System.currentTimeMillis()+2500;boolean retried=false;
            long deadline=System.currentTimeMillis()+10000;
            while(System.currentTimeMillis()<deadline){
                final boolean[] focused={false};runOnMainSync(()->focused[0]=activity.hasWindowFocus());
                if(focused[0]&&focusField("plannerFocusGeneration")>before&&focusField("plannerFocusVisualReady")==focusField("plannerFocusGeneration"))break;
                if(!retried&&System.currentTimeMillis()>=retryAt){
                    android.view.accessibility.AccessibilityNodeInfo foreground=getUiAutomation().getRootInActiveWindow();
                    if(foreground!=null&&foreground.getPackageName()!=null&&foreground.getPackageName().toString().contains("launcher")){
                        shell("input tap "+Math.max(1,size.x/25)+" "+size.y/2);retried=true;
                    }
                }
                Thread.sleep(100);
            }
            if(focusField("plannerFocusGeneration")<=before||focusField("plannerFocusVisualReady")!=focusField("plannerFocusGeneration"))throw new IllegalStateException("No NEW focus visual acknowledgement");
            Thread.sleep(1400);
            android.view.accessibility.AccessibilityNodeInfo active=getUiAutomation().getRootInActiveWindow();
            if(active==null||active.getPackageName()==null||!getTargetContext().getPackageName().contentEquals(active.getPackageName()))throw new IllegalStateException("Target app is not the active window");
            refreshWebView();if(original!=webView)throw new IllegalStateException("Live return replaced WebView");
            // Capture the whole Android window BEFORE a JS query can affect its drawing.
            android.graphics.Bitmap shot=getUiAutomation().takeScreenshot();
            if(shot==null)throw new IllegalStateException("Whole-window screenshot unavailable");
            try {
                try(java.io.FileOutputStream out=new java.io.FileOutputStream(new java.io.File(folder,(mode==0?"paused-":"playing-")+i+".png"))){
                    if(!shot.compress(android.graphics.Bitmap.CompressFormat.PNG,100,out))throw new IllegalStateException("Screenshot write failed");
                }
                assertFocusScreenshot(shot,reference);
            } finally {shot.recycle();}
            String now=js("JSON.stringify({scene:LightingAIScenePlannerDraft.activeSceneId(),revisions:localStorage.getItem('lighting_scene_planner_revisions_v1'),description:document.getElementById('sp-description').value,video:document.getElementById('sp-video').src})");
            if(!saved.equals(now)||!scroll.equals(js("document.getElementById('lightingai-scene-planner-overlay').scrollTop")))throw new IllegalStateException("Scene, revision, media or scroll changed");
            waitFor("!document.getElementById('sp-result').hidden && document.visibilityState==='visible'");
            double mediaBefore=Double.parseDouble(js("document.getElementById('sp-video').currentTime"));Thread.sleep(500);
            double mediaAfter=Double.parseDouble(js("document.getElementById('sp-video').currentTime"));
            if(mode==0&&Math.abs(mediaAfter-mediaBefore)>0.02)throw new IllegalStateException("Paused video moved");
            if(mode==1&&Math.abs(mediaAfter-mediaBefore)<0.02)throw new IllegalStateException("Playing video froze");
        }
        } finally {reference.recycle();}
        js("document.getElementById('sp-video').pause();LightingAIScenePlannerDraft.flush()");
    }
    private void prepare() throws Exception {
        js("window.addEventListener('unhandledrejection',function(e){window.__issue416Error=String(e.reason&&e.reason.stack||e.reason)});LightingAIScenePlanner.open()");waitFor("!!document.getElementById('sp-local') && !!window.LightingAIScenePlannerCore");
        loadSyntheticVideo(1400,64,64);
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
