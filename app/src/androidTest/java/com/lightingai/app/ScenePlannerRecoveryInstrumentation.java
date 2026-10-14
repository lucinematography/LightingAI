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

/** Runs only in the disposable CI emulator, in two sessions separated by am force-stop. */
public final class ScenePlannerRecoveryInstrumentation extends Instrumentation {
    private String phase;
    private Activity activity;
    private WebView webView;

    @Override public void onCreate(Bundle arguments) {
        super.onCreate(arguments);
        phase = arguments == null ? null : arguments.getString("phase");
        start();
    }

    @Override public void onStart() {
        Bundle result = new Bundle();
        try {
            Intent launch = getTargetContext().getPackageManager()
                .getLaunchIntentForPackage(getTargetContext().getPackageName());
            if (launch == null) throw new IllegalStateException("Missing launch activity");
            activity = startActivitySync(launch);
            Field field = MainActivity.class.getDeclaredField("webView");
            field.setAccessible(true);
            webView = (WebView) field.get(activity);
            waitFor("!!window.LightingAIScenePlanner && !!window.LightingAIScenePlannerDraft");
            if ("prepare".equals(phase)) prepare();
            else if ("restore".equals(phase)) restore();
            else throw new IllegalArgumentException("Expected prepare or restore phase");
            result.putString("stream", "SCENE_PLANNER_RECOVERY_PASS " + phase + "\n");
            finish(Activity.RESULT_OK, result);
        } catch (Exception error) {
            result.putString("stream", "SCENE_PLANNER_RECOVERY_FAIL " + phase + ": " + error + "\n");
            finish(Activity.RESULT_CANCELED, result);
        }
    }

    private String evaluate(String script) throws Exception {
        CountDownLatch done = new CountDownLatch(1);
        AtomicReference<String> result = new AtomicReference<>();
        runOnMainSync(() -> webView.evaluateJavascript(script, value -> {
            result.set(value); done.countDown();
        }));
        if (!done.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("WebView callback timed out");
        return result.get();
    }

    private void waitFor(String expression) throws Exception {
        long deadline = System.currentTimeMillis() + 25000;
        while (System.currentTimeMillis() < deadline) {
            if ("true".equals(evaluate("!!(" + expression + ")"))) return;
            Thread.sleep(200);
        }
        throw new IllegalStateException("Recovery assertion timed out: " + expression);
    }

    private void prepare() throws Exception {
        // Seed a tiny generated fixture photo; no camera, video, masks or provider calls.
        evaluate("(function(){var c=document.createElement('canvas');c.width=2;c.height=2;" +
            "c.getContext('2d').fillRect(0,0,2,2);" +
            "window.__recoveryPhoto=c.toDataURL('image/png');" +
            "LightingAIScenePlannerDraft.savePhoto(window.__recoveryPhoto).then(function(ok){" +
            "window.__recoveryPhotoSaved=ok;LightingAIScenePlanner.open();});})()");
        waitFor("window.__recoveryPhotoSaved && document.getElementById('sp-image') && " +
            "document.getElementById('sp-image').src===window.__recoveryPhoto && window.LightingAIScenePlannerCore");
        evaluate("(function(){function edit(id,v){var f=document.getElementById(id);f.value=v;" +
            "f.dispatchEvent(new Event('input',{bubbles:true}));}" +
            "edit('sp-description','Recovery fixture before background');edit('sp-iso','1600');" +
            "edit('sp-mode','best');document.getElementById('sp-local').click();})()");
        waitFor("JSON.parse(localStorage.getItem('lighting_scene_planner_revisions_v1')||'[]').length===1");
        evaluate("(function(){['motivation','fill','separation'].forEach(function(id){" +
            "document.getElementById('sp-prelight-'+id).value='reviewed';});" +
            "document.getElementById('sp-prelight-save').click();" +
            "var f=document.getElementById('sp-prelight-fill');f.value='needs_adjustment';" +
            "f.dispatchEvent(new Event('change',{bubbles:true}));})()");
        evaluate("LightingAIScenePlanner.close();LightingAIScenePlanner.open();");
        waitFor("document.getElementById('sp-prelight-fill') && " +
            "document.getElementById('sp-prelight-fill').value==='needs_adjustment'");
        evaluate("document.getElementById('sp-description').value='Recovery fixture after background';");
        runOnMainSync(() -> activity.moveTaskToBack(true));
        // onStop/visibility checkpoint must save the latest DOM before the CI host kills the process.
        waitFor("JSON.parse(localStorage.getItem('lighting_scene_planner_draft_v1')).fields['sp-description']==='Recovery fixture after background'");
        Intent resume = getTargetContext().getPackageManager()
            .getLaunchIntentForPackage(getTargetContext().getPackageName());
        resume.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        getTargetContext().startActivity(resume);
        waitFor("document.getElementById('sp-description').value==='Recovery fixture after background'");
        assertRecovered();
    }

    private void restore() throws Exception {
        // Startup must reopen the interrupted overlay without clicking its entry button.
        waitFor("document.getElementById('sp-description') && " +
            "document.getElementById('sp-description').value==='Recovery fixture after background'");
        waitFor("document.getElementById('sp-image').src.indexOf('data:image/png;base64,')===0");
        assertRecovered();
    }

    private void assertRecovered() throws Exception {
        waitFor("document.getElementById('sp-iso').value==='1600' && " +
            "document.getElementById('sp-prelight-fill').value==='needs_adjustment'");
        waitFor("(function(){var h=LightingAIScenePlannerCore.restoreRevisions(JSON.parse(" +
            "localStorage.getItem('lighting_scene_planner_revisions_v1')));" +
            "var r=LightingAIScenePlannerCore.restorePrelightReviews(JSON.parse(" +
            "localStorage.getItem('lighting_scene_planner_prelight_reviews_v1')),h);" +
            "return h.length===1 && h[0].plan.cameraSettings.iso===1600 && " +
            "r.length===1 && r[0].decisions.fill==='reviewed';})()");
    }
}
