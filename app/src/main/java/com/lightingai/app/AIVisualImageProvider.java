package com.lightingai.app;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import java.io.File;
import java.io.FileNotFoundException;

public final class AIVisualImageProvider extends ContentProvider {
    static File shareDirectory(android.content.Context context) {
        return new File(context.getCacheDir(), "ai_visual_share");
    }

    static File captureDirectory(android.content.Context context) {
        File parent = context.getExternalFilesDir(android.os.Environment.DIRECTORY_MOVIES);
        return new File(parent == null ? context.getFilesDir() : parent, "LightingAI_scene_videos");
    }

    private static boolean isCaptureName(String name) {
        return name != null && name.matches("scene_capture_[0-9]{10,17}\\.mp4");
    }

    @Override public boolean onCreate() { return true; }

    @Override public String getType(Uri uri) {
        String name = uri.getLastPathSegment();
        if (name == null) return "image/jpeg";
        String lower = name.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".mp4")) return "video/mp4";
        return "image/jpeg";
    }

    @Override public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        File file = resolve(uri);
        if ("r".equals(mode)) {
            return ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY);
        }
        // Only app-created scene capture files are writable, never shared PDFs or previews.
        if (isCaptureName(file.getName()) &&
            ("w".equals(mode) || "wt".equals(mode) || "rw".equals(mode) || "rwt".equals(mode))) {
            return ParcelFileDescriptor.open(file,
                ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_READ_WRITE |
                ParcelFileDescriptor.MODE_TRUNCATE);
        }
        throw new FileNotFoundException("Read-only provider");
    }

    @Override public Cursor query(Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder) {
        File file;
        try { file = resolve(uri); } catch (FileNotFoundException error) { return null; }
        String[] columns = projection == null ? new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE} : projection;
        MatrixCursor cursor = new MatrixCursor(columns, 1);
        MatrixCursor.RowBuilder row = cursor.newRow();
        for (String column : columns) {
            if (OpenableColumns.DISPLAY_NAME.equals(column)) row.add(file.getName());
            else if (OpenableColumns.SIZE.equals(column)) row.add(file.length());
            else row.add(null);
        }
        return cursor;
    }

    private File resolve(Uri uri) throws FileNotFoundException {
        if (getContext() == null || uri == null || uri.getLastPathSegment() == null) throw new FileNotFoundException();
        try {
            String name = uri.getLastPathSegment();
            File root = (isCaptureName(name) ? captureDirectory(getContext()) :
                shareDirectory(getContext())).getCanonicalFile();
            File file = new File(root, name).getCanonicalFile();
            if (!file.getParentFile().equals(root) || !file.isFile()) throw new FileNotFoundException();
            return file;
        } catch (java.io.IOException error) {
            throw new FileNotFoundException();
        }
    }

    @Override public Uri insert(Uri uri, ContentValues values) { throw new UnsupportedOperationException(); }
    @Override public int update(Uri uri, ContentValues values, String selection, String[] selectionArgs) { return 0; }
    @Override public int delete(Uri uri, String selection, String[] selectionArgs) {
        try {
            File file = resolve(uri);
            return isCaptureName(file.getName()) && file.delete() ? 1 : 0;
        } catch (FileNotFoundException ignored) { return 0; }
    }
}
