package com.lightingai.app;

import android.util.AtomicFile;
import org.json.JSONObject;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/** Private, content-addressed photos and atomic small draft records. No public files. */
final class AIVisualDraftStore {
    static final long QUOTA = 128L * 1024 * 1024;
    interface Space { long available(File directory); }
    private final File directory;
    private final Space space;
    AIVisualDraftStore(File noBackup) { this(noBackup, File::getUsableSpace); }
    AIVisualDraftStore(File noBackup, Space space) {
        directory = new File(noBackup, "ai-visual-drafts"); this.space = space;
    }
    private File record(String id) { return new File(directory, "draft-" + id + ".json"); }
    private File blob(String hash) { return new File(directory, "photo-" + hash + ".txt"); }
    private static String hash(String text) throws Exception {
        byte[] digest = MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8));
        StringBuilder out = new StringBuilder();
        for (byte b : digest) out.append(String.format(java.util.Locale.ROOT, "%02x", b & 255));
        return out.toString();
    }
    private String read(File file, int limit) throws IOException {
        try (InputStream in = new AtomicFile(file).openRead(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192]; int n;
            while ((n = in.read(buffer)) != -1) { if (out.size() + n > limit) throw new IOException(); out.write(buffer,0,n); }
            return out.toString("UTF-8");
        }
    }
    private boolean exists(File f) { return f.exists() || new File(f + ".bak").exists() || new File(f + ".new").exists(); }
    synchronized String load(String id, String legacy) {
        if (!exists(record(id))) return legacy;
        try {
            JSONObject x = new JSONObject(read(record(id), 1200000));
            String ref = x.getString("photoRef");
            if (x.getInt("storageVersion") != 2 || !(ref.isEmpty() || ref.matches("[a-f0-9]{64}"))) return "!unreadable";
            String photo = ref.isEmpty() ? "" : read(blob(ref),12000000);
            if (!ref.isEmpty() && !hash(photo).equals(ref)) return "!unreadable";
            x.remove("photoRef");x.remove("storageVersion");x.put("photo",photo);
            return x.toString();
        } catch (Exception error) { return "!unreadable"; }
    }
    private long used() { long total=0; File[] files=directory.listFiles(); if(files!=null)for(File f:files)total+=f.length();return total; }
    private boolean write(File target, String data) {
        byte[] bytes=data.getBytes(StandardCharsets.UTF_8);
        if ((!directory.isDirectory() && !directory.mkdirs()) || space.available(directory)<bytes.length+1024*1024 || used()+bytes.length>QUOTA) return false;
        AtomicFile file=new AtomicFile(target);FileOutputStream out=null;
        try {out=file.startWrite();out.write(bytes);out.getFD().sync();file.finishWrite(out);return true;}
        catch(IOException error){if(out!=null)file.failWrite(out);return false;}
    }
    synchronized boolean save(String id, JSONObject draft) {
        File created=null;
        if("!unreadable".equals(load(id,"")))return false;
        collect();
        try {
            String photo=draft.getString("photo"),ref=photo.isEmpty()?"":hash(photo);
            if(!ref.isEmpty()) {
                File f=blob(ref);
                if(exists(f)){if(!hash(read(f,12000000)).equals(ref))return false;}
                else {if(!write(f,photo))return false;created=f;}
            }
            JSONObject meta=new JSONObject(draft.toString());meta.remove("photo");meta.put("storageVersion",2);meta.put("photoRef",ref);
            if(!write(record(id),meta.toString())) {if(created!=null)new AtomicFile(created).delete();return false;}
            collect();return true;
        }catch(Exception error){if(created!=null)new AtomicFile(created).delete();return false;}
    }
    synchronized boolean saveMetadata(String id, JSONObject metadata) {
        // Metadata-only updates require an already committed v2 photo association.
        try {
            JSONObject previous=new JSONObject(read(record(id),1200000));
            String ref=previous.getString("photoRef");
            if(previous.getInt("storageVersion")!=2 || !(ref.isEmpty()||ref.matches("[a-f0-9]{64}")) || (!ref.isEmpty()&&!exists(blob(ref))))return false;
            metadata.put("photoRef",ref);metadata.put("storageVersion",2);
            return write(record(id),metadata.toString());
        }catch(Exception error){return false;}
    }
    synchronized void discardNewScene(String id) { new AtomicFile(record(id)).delete(); collect(); }
    private void collect() {
        // A failed/corrupt metadata read stops collection; never guess which photo is safe to remove.
        java.util.Set<String> refs=new java.util.HashSet<>();File[] files=directory.listFiles();if(files==null)return;
        try {
            for(File f:files)if(f.getName().startsWith("draft-")){
                if(f.getName().endsWith(".new")||f.getName().endsWith(".bak"))return;
                refs.add(new JSONObject(read(f,1200000)).getString("photoRef"));
            }
            for(File f:files)if(f.getName().matches("photo-[a-f0-9]{64}\\.txt")&&!refs.contains(f.getName().substring(6,70)))new AtomicFile(f).delete();
        }catch(Exception ignored){ }
    }
}
