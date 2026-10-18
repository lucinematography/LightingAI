import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

// Execute the production Java focus methods with a deterministic Android scheduling double.
// This tests callback ordering; it does not pretend to test Android GPU/display output.
const java=fs.readFileSync(new URL('../app/src/main/java/com/lightingai/app/MainActivity.java',import.meta.url),'utf8');
const start=java.indexOf('    @Override public void onWindowFocusChanged(boolean hasFocus)');
const end=java.indexOf('    private void recoverPlannerRenderer(',start);
assert(start>=0&&end>start,'Focus recovery methods missing');
const methods=java.slice(start,end);
assert(!/loadUrl|reload\(|destroy\(|evaluateJavascript|setLayerType|clearCache|clearHistory|setVisibility|scrollTo|seekTo/.test(methods),'Focus recovery must preserve page/media state');
for(const lifecycle of ['onPause()','onDestroy()','recoverPlannerRenderer(WebView failed)']){
 const block=java.slice(java.indexOf(lifecycle),java.indexOf(lifecycle)+140);
 assert(block.includes('++plannerFocusGeneration;'),lifecycle+' must cancel old focus callbacks');
}
const instrumentation=fs.readFileSync(new URL('../app/src/androidTest/java/com/lightingai/app/ScenePlannerResumeInstrumentation.java',import.meta.url),'utf8');
const imageStart=instrumentation.indexOf('    private static void assertFocusScreenshot(');
const imageEnd=instrumentation.indexOf('    private void focusStress()',imageStart);
assert(imageStart>=0&&imageEnd>imageStart,'Whole-window screenshot assertion missing');
const screenshotMethod=instrumentation.slice(imageStart,imageEnd);
const src=`import java.util.*;
class Parent { void onWindowFocusChanged(boolean focus){} }
class android {
 static class util {static class Log {static int warnings;static void w(String tag,String text){warnings++;}}}
 static class graphics {
  static class Color {static int red(int p){return (p>>16)&255;}static int green(int p){return (p>>8)&255;}static int blue(int p){return p&255;}}
  static class Bitmap {int mode;Bitmap(int m){mode=m;}int getWidth(){return 320;}int getHeight(){return 640;}int getPixel(int x,int y){if(mode==1)return 0;if(mode==2)return 0xffffff;if(mode==3&&x>50&&x<270&&y>200&&y<340)return 0xbb9944;return x%32<8&&y%32<8?0xffffff:0x161e28;}}
 }
}
class Frame {int invalidations;void postInvalidateOnAnimation(){invalidations++;}}
class WebView extends Frame {
 static abstract class VisualStateCallback {public abstract void onComplete(long id);}
 List<Runnable> frames=new ArrayList<>(),timers=new ArrayList<>();List<VisualStateCallback> callbacks=new ArrayList<>();
 boolean attached=true,shown=true;int width=100,height=200;
 boolean isAttachedToWindow(){return attached;}boolean isShown(){return shown;}int getWidth(){return width;}int getHeight(){return height;}
 void postOnAnimation(Runnable r){frames.add(r);}void postDelayed(Runnable r,long ms){if(ms!=1500)throw new AssertionError();timers.add(r);}
 void postVisualStateCallback(long id,VisualStateCallback callback){callbacks.add(callback);}
 void frame(){List<Runnable> q=new ArrayList<>(frames);frames.clear();q.forEach(Runnable::run);}
 void timeout(){List<Runnable> q=new ArrayList<>(timers);timers.clear();q.forEach(Runnable::run);}
}
public class FocusHarness extends Parent {
 WebView webView=new WebView();Frame rootView=new Frame();boolean recoveringWebView,focus=true,finishing,destroyed;
 long plannerFocusGeneration,plannerFocusVisualReady;
 boolean hasWindowFocus(){return focus;}boolean isFinishing(){return finishing;}boolean isDestroyed(){return destroyed;}
 ${methods}
 ${screenshotMethod}
 static int passed;
 static void check(boolean value){if(!value)throw new AssertionError("case "+(passed+1));}
 static void pass(String name){passed++;System.out.println("PASS "+name);}
 public static void main(String[] args){
 FocusHarness h=new FocusHarness();WebView v=h.webView;
 h.onWindowFocusChanged(true);check(v.callbacks.isEmpty());v.frame();check(v.callbacks.size()==1&&v.invalidations==0);v.callbacks.get(0).onComplete(1);check(v.invalidations==1&&h.rootView.invalidations==1);v.timeout();check(v.callbacks.size()==1);pass("focus waits for frame and visual acknowledgement before redraw");
 v.callbacks.get(0).onComplete(1);check(v.invalidations==1);pass("duplicate visual acknowledgement cannot redraw twice");
 h=new FocusHarness();v=h.webView;h.onWindowFocusChanged(true);v.frame();h.focus=false;h.onWindowFocusChanged(false);v.callbacks.get(0).onComplete(1);v.timeout();check(v.invalidations==0&&v.callbacks.size()==1);pass("lost focus cancels callback and retry");
 h=new FocusHarness();v=h.webView;h.onWindowFocusChanged(true);v.frame();h.webView=new WebView();v.callbacks.get(0).onComplete(1);v.timeout();check(v.invalidations==0&&h.webView.invalidations==0);pass("replaced renderer view rejects old callback");
 h=new FocusHarness();v=h.webView;h.onWindowFocusChanged(true);v.frame();v.timeout();check(v.callbacks.size()==2);v.timeout();v.timeout();check(v.callbacks.size()==2&&android.util.Log.warnings==1&&v.invalidations==0);pass("missing acknowledgement retries once then stops without reloading");
 h=new FocusHarness();v=h.webView;h.onWindowFocusChanged(true);v.frame();h.onWindowFocusChanged(false);h.onWindowFocusChanged(true);v.frame();v.callbacks.get(0).onComplete(1);check(v.invalidations==0);v.callbacks.get(1).onComplete(3);check(v.invalidations==1&&h.plannerFocusVisualReady==3);pass("alternating return rejects previous generation");
 for(int mode=0;mode<7;mode++){h=new FocusHarness();v=h.webView;h.onWindowFocusChanged(true);if(mode==0)v.attached=false;if(mode==1)v.shown=false;if(mode==2)v.width=0;if(mode==3)h.recoveringWebView=true;if(mode==4)h.finishing=true;if(mode==5)h.destroyed=true;if(mode==6)h.focus=false;v.frame();check(v.callbacks.isEmpty());}pass("detached hidden zero-size recovering finishing destroyed unfocused views are skipped");
 h=new FocusHarness();v=h.webView;for(int i=0;i<60;i++){h.focus=false;h.onWindowFocusChanged(false);h.focus=true;h.onWindowFocusChanged(true);v.frame();v.callbacks.get(v.callbacks.size()-1).onComplete(h.plannerFocusGeneration);v.timeout();}check(v.invalidations==60&&h.rootView.invalidations==60);pass("60 consecutive focus returns acknowledge exactly one redraw each");
 h=new FocusHarness();v=h.webView;h.onWindowFocusChanged(true);v.frame();++h.plannerFocusGeneration;v.callbacks.get(0).onComplete(1);v.timeout();check(v.invalidations==0&&v.callbacks.size()==1);pass("pause/destroy generation invalidates queued work");
 assertFocusScreenshot(new android.graphics.Bitmap(3),new android.graphics.Bitmap(0));pass("whole-window check accepts stable Planner with changing video pixels");
 try{assertFocusScreenshot(new android.graphics.Bitmap(1),new android.graphics.Bitmap(0));throw new AssertionError("Black screenshot accepted");}catch(IllegalStateException expected){}pass("whole-window check rejects black screen even with valid JS state");
 try{assertFocusScreenshot(new android.graphics.Bitmap(2),new android.graphics.Bitmap(0));throw new AssertionError("Recents screenshot accepted");}catch(IllegalStateException expected){}pass("whole-window check rejects recents/covering overlay");
 System.out.println(passed+" Java focus and screenshot groups passed");
 }
}`;
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'lightingai-focus-'));
const executable=name=>process.env.JAVA_HOME?path.join(process.env.JAVA_HOME,'bin',name+(process.platform==='win32'?'.exe':'')):name;
function run(command,args){const r=spawnSync(command,args,{encoding:'utf8',timeout:60000,windowsHide:true});if(r.error)throw r.error;assert.equal(r.status,0,r.stdout+'\n'+r.stderr);return r.stdout;}
try{
 fs.writeFileSync(path.join(temp,'FocusHarness.java'),src);
 run(executable('javac'),['-d',temp,path.join(temp,'FocusHarness.java')]);
 console.log(run(executable('java'),['-cp',temp,'FocusHarness']));
 console.log('PASS production focus path preserves DOM, media and storage; lifecycle cancellation is present');
}finally{
 assert.equal(path.dirname(path.resolve(temp)),path.resolve(os.tmpdir()));
 assert(path.basename(temp).startsWith('lightingai-focus-'));
 fs.rmSync(temp,{recursive:true,force:true});
}
