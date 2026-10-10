package com.lightingai.app;

import java.io.File;
import java.io.IOException;

/** File policy for app-owned legacy captures; no Android or gallery permissions. */
final class ScenePlannerCaptureCleanup {
    static void prune(File directory, long nowMillis) throws IOException {
        File folder = directory.getCanonicalFile();
        File[] files = folder.listFiles();
        if (files == null) return;
        long cutoff = nowMillis - 24L * 60 * 60 * 1000;
        for (File file : files) {
            File canonical = file.getCanonicalFile();
            if (canonical.getParentFile().equals(folder) && canonical.isFile() &&
                file.getName().equals(canonical.getName()) &&
                canonical.getName().matches("scene_capture_[0-9]{10,17}\\.mp4") &&
                canonical.lastModified() < cutoff) canonical.delete();
        }
    }
}
