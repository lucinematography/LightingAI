package com.lightingai.app;

import org.junit.Test;
import org.junit.Rule;
import org.junit.rules.TemporaryFolder;
import java.io.File;
import static org.junit.Assert.*;

public class ScenePlannerCaptureCleanupTest {
    @Rule public TemporaryFolder temporary = new TemporaryFolder();
    private static final long NOW = 1800000000000L;

    @Test public void onlyExpiredOwnedCaptureIsDeleted() throws Exception {
        File directory = temporary.newFolder("captures");
        File expired = new File(directory, "scene_capture_1700000000000.mp4");
        File recent = new File(directory, "scene_capture_1799999999999.mp4");
        File gallery = new File(directory, "gallery.mp4");
        assertTrue(expired.createNewFile()); assertTrue(expired.setLastModified(NOW - 90000000L));
        assertTrue(recent.createNewFile()); assertTrue(recent.setLastModified(NOW));
        assertTrue(gallery.createNewFile()); assertTrue(gallery.setLastModified(NOW - 90000000L));
        ScenePlannerCaptureCleanup.prune(directory, NOW);
        assertFalse(expired.exists()); assertTrue(recent.exists()); assertTrue(gallery.exists());
    }

    @Test public void unknownNamesDirectoriesAndOutsideFilesSurvive() throws Exception {
        File directory = temporary.newFolder("captures");
        File invalid = new File(directory, "scene_capture_bad.mp4");
        File folder = new File(directory, "scene_capture_1700000000000.mp4");
        File outside = temporary.newFile("scene_capture_1700000000000.mp4");
        assertTrue(invalid.createNewFile()); assertTrue(invalid.setLastModified(NOW - 90000000L));
        assertTrue(folder.mkdir()); assertTrue(outside.setLastModified(NOW - 90000000L));
        ScenePlannerCaptureCleanup.prune(directory, NOW);
        assertTrue(invalid.exists()); assertTrue(folder.isDirectory()); assertTrue(outside.exists());
    }

    @Test public void absentDirectoryIsSafe() throws Exception {
        ScenePlannerCaptureCleanup.prune(new File(temporary.getRoot(), "absent"), NOW);
    }
}
