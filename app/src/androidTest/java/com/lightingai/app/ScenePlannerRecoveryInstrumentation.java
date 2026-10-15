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
            String diagnostic = "";
            try { if (webView != null) diagnostic = evaluate("JSON.stringify({" +
                "hasOverlay:!!document.getElementById('sp-description')," +
                "shotAPI:!!window.LightingAIShotList,snapshotAPI:typeof LightingAIScenePlannerDraft.readSceneSnapshot," +
                "shotRows:localStorage.getItem('lighting_shot_list_v1')," +
                "sceneStatus:document.getElementById('sp-status')&&document.getElementById('sp-status').textContent," +
                "draft:LightingAIScenePlannerDraft.readWorkspaceValue('lighting_scene_planner_draft_v1')," +
                "nativeSaved:!!Android.loadScenePlannerWorkspace()})"); } catch (Exception ignored) { }
            result.putString("stream", "SCENE_PLANNER_RECOVERY_FAIL " + phase + ": " + error + "\n" + diagnostic + "\n");
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
            "window.equipment=[{id:'ci-fixture',fixtureId:'ci-fixture',name:'CI fixture',qty:1}];" +
            "edit('sp-mode','own');document.getElementById('sp-local').click();})()");
        waitFor("JSON.parse(localStorage.getItem('lighting_scene_planner_revisions_v1')||'[]').length===1");
        evaluate("(function(){['motivation','fill','separation'].forEach(function(id){" +
            "document.getElementById('sp-prelight-'+id).value='reviewed';});" +
            "document.getElementById('sp-prelight-save').click();" +
            "var f=document.getElementById('sp-prelight-fill');f.value='needs_adjustment';" +
            "f.dispatchEvent(new Event('change',{bubbles:true}));})()");
        evaluate("LightingAIScenePlanner.close();LightingAIScenePlanner.open();");
        waitFor("document.getElementById('sp-prelight-fill') && " +
            "document.getElementById('sp-prelight-fill').value==='needs_adjustment'");
        prepareSecondScene();
        prepareContinuity();
        prepareBackupImport();
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
        // Kill the Android process while a local password is partially entered.
        evaluate("document.getElementById('sp-backup-export').click();");
        fillBackupPassword("unfinished-synthetic-input", false);
    }

    private void restore() throws Exception {
        // Startup must reopen the interrupted overlay without clicking its entry button.
        waitFor("document.getElementById('sp-description') && " +
            "document.getElementById('sp-description').value==='Recovery fixture after background'");
        waitFor("document.getElementById('sp-image').src.indexOf('data:image/png;base64,')===0");
        assertRecovered();
        Field dialogField = MainActivity.class.getDeclaredField("backupPasswordDialog");
        dialogField.setAccessible(true);
        if (dialogField.get(activity) != null) throw new IllegalStateException("Password dialog restored after process death");
        selectSceneByName("CI Scene B", "Recovery fixture scene B");
        waitFor("document.getElementById('sp-iso').value==='800' && " +
            "document.getElementById('sp-distance-L1').value==='7.5' && " +
            "!document.getElementById('sp-distance-verified-L1').checked && " +
            "document.getElementById('sp-prelight-fill').value==='reviewed'");
        waitFor("(function(){var h=JSON.parse(LightingAIScenePlannerDraft.readWorkspaceValue(" +
            "'lighting_scene_planner_revisions_v1'));var r=JSON.parse(LightingAIScenePlannerDraft.readWorkspaceValue(" +
            "'lighting_scene_planner_prelight_reviews_v1'));return h.length===1 && " +
            "h[0].plan.cameraSettings.iso===800 && r.length===1 && r[0].decisions.fill==='not_applicable';})()");
        assertPhoto("red");
        selectSceneByName("Postojeća scena (uvoz)", "Recovery fixture before background");
        assertRecovered();
        waitFor("!document.getElementById('sp-measured').checked && " +
            "document.getElementById('sp-imported-note').textContent.length>0");
        selectLegacyScene();
        assertRecovered();
        compareSavedShots();
    }


    private void prepareContinuity() throws Exception {
        evaluate("document.getElementById('sp-continuity-shot-name').value='CI Shot A';" +
            "document.getElementById('sp-continuity-shot').click();");
        waitFor("window.LightingAIShotList && (JSON.parse(localStorage.getItem('lighting_shot_list_v1')||\'{\\\"rows\\\":[]}\').rows||[]).some(function(s){return s.name===\'CI Shot A\';})");
        selectSceneByName("CI Scene B", "Recovery fixture scene B");
        evaluate("document.getElementById('sp-continuity-shot-name').value='CI Shot B';" +
            "document.getElementById('sp-continuity-shot').click();");
        waitFor("(JSON.parse(localStorage.getItem('lighting_shot_list_v1')||\'{\\\"rows\\\":[]}\').rows||[]).some(function(s){return s.name===\'CI Shot B\';})");
        selectLegacyScene();
        String workspace = stableSceneWorkspace();
        String index = evaluate("Android.loadScenePlannerSceneIndex()");
        evaluate("document.getElementById('sp-continuity-open').click();");
        waitFor("document.querySelector('#sp-continuity-panel [data-cont=current]')");
        evaluate("(function(){var box=document.getElementById('sp-continuity-panel');" +
            "var b=LightingAIScenePlannerDraft.listScenes().find(function(s){return s.name==='CI Scene B';});" +
            "var a=box.querySelector('[data-cont=reference]'),c=box.querySelector('[data-cont=current]');" +
            "a.value='scene:legacy';c.value='scene:'+b.id;" +
            "a.dispatchEvent(new Event('change',{bubbles:true}));c.dispatchEvent(new Event('change',{bubbles:true}));" +
            "box.querySelector('[data-cont=compare]').click();})()");
        waitFor("(function(){var text=document.querySelector('#sp-continuity-panel [data-cont=result]').textContent;" +
            "return text.indexOf('1600')>=0 && text.indexOf('800')>=0 && text.indexOf('PROMENJENO')>=0 && " +
            "text.indexOf('NEPOZNATO')>=0 && text.indexOf('NEPROVERENO')>=0;})()");
        if (!workspace.equals(stableSceneWorkspace()) || !index.equals(evaluate("Android.loadScenePlannerSceneIndex()")))
            throw new IllegalStateException("Continuity changed source scenes");
        compareSavedShots();
    }

    private void compareSavedShots() throws Exception {
        if ("false".equals(evaluate("!!document.querySelector('#sp-continuity-panel [data-cont=current]')")))
            evaluate("document.getElementById('sp-continuity-open').click();");
        waitFor("document.querySelector('#sp-continuity-panel [data-cont=current]')");
        String workspace = stableSceneWorkspace();
        String index = evaluate("Android.loadScenePlannerSceneIndex()");
        evaluate("(function(){var box=document.getElementById('sp-continuity-panel');" +
            "var rows=JSON.parse(localStorage.getItem('lighting_shot_list_v1')).rows;" +
            "var a=box.querySelector('[data-cont=reference]'),b=box.querySelector('[data-cont=current]');" +
            "a.value='shot:'+rows.find(function(s){return s.name==='CI Shot A';}).id;" +
            "b.value='shot:'+rows.find(function(s){return s.name==='CI Shot B';}).id;" +
            "a.dispatchEvent(new Event('change',{bubbles:true}));b.dispatchEvent(new Event('change',{bubbles:true}));" +
            "box.querySelector('[data-cont=compare]').click();})()");
        waitFor("(function(){var text=document.querySelector('#sp-continuity-panel [data-cont=result]').textContent;" +
            "return text.indexOf('CI Shot A')>=0 && text.indexOf('CI Shot B')>=0 && text.indexOf('PROMENJENO')>=0;})()");
        if (!workspace.equals(stableSceneWorkspace()) || !index.equals(evaluate("Android.loadScenePlannerSceneIndex()")))
            throw new IllegalStateException("Saved-shot comparison changed original scene");
    }

    private void prepareBackupImport() throws Exception {
        // Exercise the real Downloads writer, FileReader preview and native transaction, synthetic data only.
        waitFor("document.getElementById('sp-backup-export') && !document.getElementById('sp-backup-export').disabled");
        evaluate("document.getElementById('sp-video-auth').value='synthetic-not-for-backup';" +
            "document.getElementById('sp-measured').checked=true;" +
            "document.getElementById('sp-backup-export').click();");
        fillBackupPassword("synthetic-password-Ž-2026", true);
        waitFor("document.getElementById('sp-backup-status').textContent.indexOf('sačuvana lokalno')>=0");
        String backup = null;
        try (android.database.Cursor cursor = getTargetContext().getContentResolver().query(
                android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI,
                new String[]{android.provider.MediaStore.MediaColumns._ID},
                android.provider.MediaStore.MediaColumns.DISPLAY_NAME + " LIKE ?",
                new String[]{"LightingAI_SceneBackup_%.json"},
                android.provider.MediaStore.MediaColumns.DATE_ADDED + " DESC")) {
            if (cursor != null && cursor.moveToFirst()) {
                android.net.Uri uri = android.content.ContentUris.withAppendedId(
                    android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI, cursor.getLong(0));
                try (java.io.InputStream in = getTargetContext().getContentResolver().openInputStream(uri);
                     java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
                    if (in == null) throw new IllegalStateException("Missing synthetic backup stream");
                    byte[] buffer = new byte[4096]; int count;
                    while ((count = in.read(buffer)) != -1) {
                        out.write(buffer, 0, count);
                        if (out.size() > 1024 * 1024) throw new IllegalStateException("Unexpected synthetic fixture size");
                    }
                    backup = out.toString("UTF-8");
                }
            }
        }
        if (backup == null || backup.contains("Recovery fixture") || backup.contains("synthetic-not-for-backup") ||
            !"LightingAI.EncryptedSceneBackup".equals(new org.json.JSONObject(backup).getString("format")))
            throw new IllegalStateException("Backup absent or plaintext written");
        String indexBefore = evaluate("Android.loadScenePlannerSceneIndex()");
        String workspaceBefore = stableSceneWorkspace();
        previewBackupFile(backup);
        fillBackupPassword("wrong-synthetic-password", true);
        waitFor("document.getElementById('sp-backup-status').textContent.indexOf('Lozinka nije ispravna')>=0");
        assertBackupFailureUnchanged(indexBefore, workspaceBefore);
        org.json.JSONObject damaged = new org.json.JSONObject(backup);
        byte[] bytes = java.util.Base64.getDecoder().decode(damaged.getString("data"));
        bytes[bytes.length - 1] ^= 1;
        damaged.put("data", java.util.Base64.getEncoder().encodeToString(bytes));
        previewBackupFile(damaged.toString());
        fillBackupPassword("synthetic-password-Ž-2026", true);
        waitFor("document.getElementById('sp-backup-status').textContent.indexOf('Lozinka nije ispravna')>=0");
        assertBackupFailureUnchanged(indexBefore, workspaceBefore);
        // Leaving the app cancels an unsubmitted password and clears native input buffers.
        previewBackupFile(backup);
        fillBackupPassword("partial-synthetic-input", false);
        runOnMainSync(() -> activity.moveTaskToBack(true));
        waitFor("document.getElementById('sp-backup-status').textContent.indexOf('otkazano')>=0");
        Intent resume = getTargetContext().getPackageManager().getLaunchIntentForPackage(getTargetContext().getPackageName());
        resume.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        getTargetContext().startActivity(resume);
        assertBackupFailureUnchanged(indexBefore, workspaceBefore);
        // Old plaintext JSON remains readable in memory, with an explicit warning, never rewritten to Downloads.
        evaluate("LightingAIScenePlannerDraft.exportSceneBackup().then(function(text){window.__legacyBackup=text;});");
        waitFor("!!window.__legacyBackup");
        evaluate("(function(){var file=new File([window.__legacyBackup],'legacy.json',{type:'application/json'});" +
            "document.getElementById('sp-backup-file').onchange({target:{files:[file],value:''}});window.__legacyBackup=null;})()");
        waitFor("document.getElementById('sp-backup-preview').textContent.indexOf('NEŠIFROVANA')>=0 && " +
            "document.getElementById('sp-backup-apply').disabled");
        evaluate("document.getElementById('sp-backup-cancel').click();");
        previewBackupFile(backup);
        fillBackupPassword("synthetic-password-Ž-2026", true);
        waitFor("document.getElementById('sp-backup-confirm') && document.getElementById('sp-backup-photo') && " +
            "document.getElementById('sp-backup-photo').complete && document.getElementById('sp-backup-photo').naturalWidth>0 && " +
            "!document.getElementById('sp-scene-select').disabled");
        waitFor("LightingAIScenePlannerDraft.listScenes().length===2 && " +
            "document.getElementById('sp-backup-apply').disabled");
        evaluate("document.getElementById('sp-backup-confirm').checked=true;" +
            "document.getElementById('sp-backup-confirm').dispatchEvent(new Event('change'));" +
            "document.getElementById('sp-backup-apply').click();");
        waitFor("LightingAIScenePlannerDraft.listScenes().length===3 && " +
            "LightingAIScenePlannerDraft.activeSceneId()==='legacy'");
        // A malformed native transaction must not change any registered scene.
        waitFor("(function(){var index=Android.loadScenePlannerSceneIndex(),old=Android.loadScenePlannerWorkspace();" +
            "return Android.importScenePlannerBackup('Invalid','broken-json','',index)==='' && " +
            "Android.loadScenePlannerSceneIndex()===index && Android.loadScenePlannerWorkspace()===old;})()");
    }


    private void previewBackupFile(String backup) throws Exception {
        waitFor("!document.getElementById('sp-backup-import').disabled");
        evaluate("(function(){var file=new File([" + org.json.JSONObject.quote(backup) +
            "],'synthetic-scene.encrypted.json',{type:'application/json'});" +
            "document.getElementById('sp-backup-file').onchange({target:{files:[file],value:''}});})()");
    }

    private String stableSceneWorkspace() throws Exception {
        return evaluate("(function(){var s=JSON.parse(Android.loadScenePlannerWorkspace());" +
            "var d=JSON.parse(s.values.lighting_scene_planner_draft_v1);delete d.checkpoint;" +
            "s.values.lighting_scene_planner_draft_v1=d;return LightingAIScenePlannerCore.canonicalJson(s.values);})()");
    }

    private void assertBackupFailureUnchanged(String index, String workspace) throws Exception {
        if (!index.equals(evaluate("Android.loadScenePlannerSceneIndex()")) ||
            !workspace.equals(stableSceneWorkspace()))
            throw new IllegalStateException("Failed unlock modified stored scenes");
        waitFor("LightingAIScenePlannerDraft.listScenes().length===2 && " +
            "!document.getElementById('sp-backup-confirm')");
    }

    private void collectPasswordInputs(android.view.View view, java.util.List<android.widget.EditText> fields) {
        if (view instanceof android.widget.EditText) fields.add((android.widget.EditText) view);
        if (view instanceof android.view.ViewGroup) {
            android.view.ViewGroup group = (android.view.ViewGroup) view;
            for (int j = 0; j < group.getChildCount(); j++) collectPasswordInputs(group.getChildAt(j), fields);
        }
    }

    private void fillBackupPassword(String value, boolean submit) throws Exception {
        Field field = MainActivity.class.getDeclaredField("backupPasswordDialog");
        field.setAccessible(true);
        long deadline = System.currentTimeMillis() + 25000;
        while (field.get(activity) == null && System.currentTimeMillis() < deadline) Thread.sleep(100);
        if (field.get(activity) == null) throw new IllegalStateException("Local password dialog missing");
        runOnMainSync(() -> {
            try {
                android.app.AlertDialog dialog = (android.app.AlertDialog) field.get(activity);
                java.util.List<android.widget.EditText> inputs = new java.util.ArrayList<>();
                collectPasswordInputs(dialog.getWindow().getDecorView(), inputs);
                if (inputs.isEmpty()) throw new IllegalStateException("Password input missing");
                for (android.widget.EditText input : inputs) {
                    if (input.isSaveEnabled() || input.isSaveFromParentEnabled() ||
                        input.getImportantForAutofill() != android.view.View.IMPORTANT_FOR_AUTOFILL_NO_EXCLUDE_DESCENDANTS)
                        throw new IllegalStateException("Password input permits persistence");
                    input.setText(value);
                }
                if (submit) {
                    dialog.getButton(android.app.AlertDialog.BUTTON_POSITIVE).performClick();
                    for (android.widget.EditText input : inputs)
                        if (input.length() != 0) throw new IllegalStateException("Password input was not cleared");
                }
            } catch (ReflectiveOperationException error) { throw new IllegalStateException("Password fixture setup failed"); }
        });
    }

    private void assertRecovered() throws Exception {
        waitFor("document.getElementById('sp-distance-L1') && " +
            "document.getElementById('sp-distance-L1').value==='3.25' && " +
            "!document.getElementById('sp-distance-verified-L1').checked");
        assertPhoto("black");
        waitFor("document.getElementById('sp-iso').value==='1600' && " +
            "document.getElementById('sp-prelight-fill').value==='needs_adjustment'");
        waitFor("(function(){var h=LightingAIScenePlannerCore.restoreRevisions(JSON.parse(" +
            "localStorage.getItem('lighting_scene_planner_revisions_v1')));" +
            "var r=LightingAIScenePlannerCore.restorePrelightReviews(JSON.parse(" +
            "localStorage.getItem('lighting_scene_planner_prelight_reviews_v1')),h);" +
            "return h.length===1 && h[0].plan.cameraSettings.iso===1600 && " +
            "r.length===1 && r[0].decisions.fill==='reviewed';})()");
    }
    private void assertPhoto(String color) throws Exception {
        waitFor("(function(){var c=document.createElement('canvas');c.width=2;c.height=2;" +
            "var x=c.getContext('2d');x.fillStyle='" + color + "';x.fillRect(0,0,2,2);" +
            "return document.getElementById('sp-image').src===c.toDataURL('image/png');})()");
    }

    private void selectSceneByName(String name, String description) throws Exception {
        waitFor("document.getElementById('sp-scene-select') && !document.getElementById('sp-scene-select').disabled");
        evaluate("(function(){var item=LightingAIScenePlannerDraft.listScenes().find(function(s){return s.name==='" +
            name + "';});var f=document.getElementById('sp-scene-select');f.value=item.id;" +
            "f.dispatchEvent(new Event('change',{bubbles:true}));})()");
        waitFor("document.getElementById('sp-description') && document.getElementById('sp-description').value==='" +
            description + "' && !document.getElementById('sp-scene-select').disabled");
    }

    private void selectLegacyScene() throws Exception {
        waitFor("document.getElementById('sp-scene-select') && !document.getElementById('sp-scene-select').disabled");
        evaluate("(function(){var f=document.getElementById('sp-scene-select');f.value='legacy';" +
            "f.dispatchEvent(new Event('change',{bubbles:true}));})()");
        waitFor("document.getElementById('sp-scene-select') && document.getElementById('sp-scene-select').value==='legacy' && " +
            "!document.getElementById('sp-scene-select').disabled");
    }

    private void prepareSecondScene() throws Exception {
        waitFor("document.getElementById('sp-distance-L1') && !document.getElementById('sp-scene-select').disabled");
        evaluate("(function(){var d=document.getElementById('sp-distance-L1');d.value='3.25';" +
            "d.dispatchEvent(new Event('input',{bubbles:true}));" +
            "document.getElementById('sp-scene-name').value='CI Scene B';document.getElementById('sp-scene-create').click();})()");
        waitFor("document.getElementById('sp-scene-select') && document.getElementById('sp-scene-select').value!=='legacy' && " +
            "!document.getElementById('sp-scene-select').disabled && document.getElementById('sp-description').value===''");
        waitFor("document.getElementById('sp-image').hidden");
        evaluate("(function(){var c=document.createElement('canvas');c.width=2;c.height=2;" +
            "var x=c.getContext('2d');x.fillStyle='red';x.fillRect(0,0,2,2);" +
            "LightingAIScenePlannerDraft.savePhoto(c.toDataURL('image/png')).then(function(ok){" +
            "if(ok){LightingAIScenePlanner.close();LightingAIScenePlanner.open();}});})()");
        assertPhoto("red");
        evaluate("(function(){function edit(id,v){var f=document.getElementById(id);f.value=v;" +
            "f.dispatchEvent(new Event('input',{bubbles:true}));}" +
            "edit('sp-description','Recovery fixture scene B');edit('sp-iso','800');edit('sp-mode','own');" +
            "document.getElementById('sp-local').click();})()");
        waitFor("document.getElementById('sp-distance-L1') && !document.getElementById('sp-scene-select').disabled");
        evaluate("(function(){['motivation','fill','separation'].forEach(function(id){" +
            "document.getElementById('sp-prelight-'+id).value='not_applicable';});" +
            "document.getElementById('sp-prelight-save').click();" +
            "var p=document.getElementById('sp-prelight-fill');p.value='reviewed';p.dispatchEvent(new Event('change',{bubbles:true}));" +
            "var d=document.getElementById('sp-distance-L1');d.value='7.5';d.dispatchEvent(new Event('input',{bubbles:true}));})()");
        selectLegacyScene();
        waitFor("document.getElementById('sp-description').value==='Recovery fixture before background'");
        waitFor("document.getElementById('sp-distance-L1').value==='3.25'");
        assertPhoto("black");
        waitFor("Android.saveScenePlannerSceneData('../escape','workspace','{}')===false && " +
            "Android.saveScenePlannerSceneData(LightingAIScenePlannerDraft.listScenes()[1].id,'invalid','{}')===false");
    }

}
