package com.lightingai.app;

import android.app.Instrumentation;
import android.os.Bundle;
import org.json.JSONObject;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

/** Offline native regression tests, using only a separate synthetic test directory. */
public final class AIVisualDraftInstrumentation extends Instrumentation {
    @Override public void onCreate(Bundle args) { super.onCreate(args);start(); }
    private void require(boolean value,String name){if(!value)throw new AssertionError(name);}
    @Override public void onStart(){Bundle result=new Bundle();try{
        for(String name:new String[]{"private_backup_rules","private_data_extraction_rules"}){
            int resource=getTargetContext().getResources().getIdentifier(name,"xml",getTargetContext().getPackageName());require(resource!=0,"compiled backup resource");
            android.content.res.XmlResourceParser xml=getTargetContext().getResources().getXml(resource);int count=0;
            while(xml.next()!=org.xmlpull.v1.XmlPullParser.END_DOCUMENT)if(xml.getEventType()==org.xmlpull.v1.XmlPullParser.START_TAG&&"exclude".equals(xml.getName()))count++;
            xml.close();require(count==(name.equals("private_backup_rules")?3:6),"installed cloud/transfer exclusions");
        }
        File test=new File(getTargetContext().getNoBackupFilesDir(),"step56-synthetic-"+System.nanoTime());
        AIVisualDraftStore store=new AIVisualDraftStore(test);
        String photo="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRXsAAAAASUVORK5CYII=";
        JSONObject draft=new JSONObject().put("version",1).put("photo",photo).put("description","Synthetic scene ČĆŠŽĐ").put("dpRequest","Only selected fixtures").put("selectedIds",new org.json.JSONArray()).put("settings",new JSONObject().put("look","Natural").put("useDmx",false).put("useSun",false).put("useMeasurements",false));
        require(store.save("legacy",draft),"first durable save");require(new JSONObject(new AIVisualDraftStore(test).load("legacy","")).getString("photo").equals(photo),"restart restores photo");
        File dir=new File(test,"ai-visual-drafts");File blob=null;for(File f:dir.listFiles())if(f.getName().startsWith("photo-"))blob=f;
        long modified=blob.lastModified();JSONObject meta=new JSONObject(draft.toString());meta.remove("photo");meta.put("description","Immediate last input");
        require(store.saveMetadata("legacy",meta),"metadata durable");require(blob.lastModified()==modified,"photo not rewritten");
        String preserved=store.load("legacy","");AIVisualDraftStore full=new AIVisualDraftStore(test,d->0);
        require(!full.saveMetadata("legacy",new JSONObject(meta.toString()).put("description","must not persist")),"ENOSPC rejects");require(store.load("legacy","").equals(preserved),"ENOSPC preserves record");
        String large="data:image/jpeg;base64,"+new String(new char[2300100]).replace('\0','A');draft.put("photo",large);require(store.save("s-abcdefgh",draft),"large photo stores without recompression");require(new JSONObject(store.load("s-abcdefgh","")).getString("photo").equals(large),"large bytes exact");
        require(store.load("s-ijklmnop",draft.toString()).equals(draft.toString()),"legacy v1 readable");
        JSONObject privatePayload=new JSONObject().put("aiVisual",draft);byte[] plain=privatePayload.toString().getBytes(StandardCharsets.UTF_8);char[] password="public-synthetic-step56-password".toCharArray();
        byte[] encrypted=SceneBackupCrypto.encrypt(plain,password);require(Arrays.equals(plain,SceneBackupCrypto.decrypt(encrypted,password)),"encrypted AI roundtrip");
        require(!new String(encrypted,StandardCharsets.ISO_8859_1).contains("Immediate last input"),"no plaintext archive");
        encrypted[encrypted.length-1]^=1;boolean rejected=false;try{SceneBackupCrypto.decrypt(encrypted,password);}catch(java.security.GeneralSecurityException e){rejected=true;}require(rejected,"corrupt encrypted file rejected");require(store.load("legacy","").equals(preserved),"corrupt import no writes");Arrays.fill(password,'\0');
        File corrupt=new File(dir,"draft-s-abcdefgh.json");try(FileOutputStream f=new FileOutputStream(corrupt)){f.write("broken".getBytes(StandardCharsets.UTF_8));}
        require(store.load("s-abcdefgh","").equals("!unreadable"),"corrupt record blocked");require(!store.save("s-abcdefgh",draft),"corrupt record preserved");
        result.putString("stream","PASS STEP56 native: durable metadata, restart, large photo, dedup, injected ENOSPC, legacy, authenticated encryption and corrupt-copy preservation\n");finish(-1,result);
    }catch(Throwable error){result.putString("stream","FAIL STEP56 native: "+error.getClass().getSimpleName()+": "+error.getMessage()+"\n");finish(0,result);}}
}
