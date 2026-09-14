package com.lightingai.app;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.RectF;
import android.graphics.SurfaceTexture;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.hardware.camera2.CameraCaptureSession;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraDevice;
import android.hardware.camera2.CameraManager;
import android.hardware.camera2.CaptureRequest;
import android.hardware.camera2.params.StreamConfigurationMap;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.util.Size;
import android.view.Gravity;
import android.view.Surface;
import android.view.TextureView;
import android.view.View;
import android.view.WindowInsets;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.util.Arrays;
import java.util.Locale;

public class MeasureActivity extends Activity implements SensorEventListener {
    private static final int CAMERA_PERMISSION = 701;
    private static final int STABILITY_WINDOW = 14;
    private TextureView textureView;
    private CameraDevice cameraDevice;
    private CameraCaptureSession captureSession;
    private CaptureRequest.Builder previewBuilder;
    private HandlerThread cameraThread;
    private Handler cameraHandler;
    private Size previewSize;
    private int sensorOrientation = 90;
    private SensorManager sensorManager;
    private Sensor rotationSensor;
    private TextView distanceText;
    private TextView angleText;
    private TextView qualityText;
    private TextView hintText;
    private EditText heightInput;
    private double depressionSmooth = Double.NaN;
    private double distanceM = Double.NaN;
    private double cameraHeightM = 1.50;
    private boolean english = false;
    private final double[] depressionWindow = new double[STABILITY_WINDOW];
    private int depressionCount = 0;
    private int depressionIndex = 0;
    private double stabilitySpread = Double.NaN;
    private double uncertaintyM = Double.NaN;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        english = "en".equals(getIntent().getStringExtra("lang"));
        cameraHeightM = getIntent().getDoubleExtra("cameraHeight", 1.50);
        getWindow().setStatusBarColor(Color.rgb(13,15,18));
        getWindow().setNavigationBarColor(Color.rgb(13,15,18));
        buildUi();
        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        rotationSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        if (rotationSensor == null) rotationSensor = sensorManager.getDefaultSensor(Sensor.TYPE_GAME_ROTATION_VECTOR);
        if (rotationSensor == null && hintText != null) hintText.setText(tr("Senzor nagiba nije dostupan. Koristi WEB kameru kao rezervu.", "Tilt sensor unavailable. Use WEB camera as fallback."));
    }

    private String tr(String sr, String en) { return english ? en : sr; }
    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }

    private TextView makeText(String value, float sp, int color) {
        TextView v = new TextView(this);
        v.setText(value); v.setTextSize(sp); v.setTextColor(color);
        return v;
    }

    private Button makeButton(String label) {
        Button b = new Button(this);
        b.setText(label); b.setTextColor(Color.WHITE); b.setTextSize(14); b.setAllCaps(false);
        b.setBackgroundColor(Color.rgb(37,42,49));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(52), 1f);
        lp.setMargins(dp(4), dp(4), dp(4), dp(4));
        b.setLayoutParams(lp);
        return b;
    }

    private void buildUi() {
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);
        root.setOnApplyWindowInsetsListener((View v, WindowInsets insets) -> {
            int top = Math.max(0, insets.getSystemWindowInsetTop());
            int bottom = Math.max(0, insets.getSystemWindowInsetBottom());
            v.setPadding(0, top, 0, bottom);
            return insets;
        });

        textureView = new TextureView(this);
        root.addView(textureView, new FrameLayout.LayoutParams(-1,-1));
        textureView.setSurfaceTextureListener(surfaceListener);

        TextView topShade = new TextView(this);
        topShade.setBackgroundColor(0xaa000000);
        root.addView(topShade, new FrameLayout.LayoutParams(-1, dp(132), Gravity.TOP));

        LinearLayout top = new LinearLayout(this);
        top.setOrientation(LinearLayout.VERTICAL);
        top.setPadding(dp(18),dp(12),dp(18),dp(10));
        TextView title = makeText(tr("PRO MERENJE SCENE", "PRO SCENE MEASUREMENT"),21,Color.WHITE);
        title.setTypeface(null,1); top.addView(title);
        distanceText = makeText("— m",36,Color.rgb(245,197,66)); distanceText.setTypeface(null,1); top.addView(distanceText);
        angleText = makeText(tr("Ciljaj podnožje objekta", "Aim at the base of the object"),13,0xffc5c9d0); top.addView(angleText);
        qualityText = makeText("",12,0xff9da3ad); top.addView(qualityText);
        root.addView(top,new FrameLayout.LayoutParams(-1,dp(132),Gravity.TOP));

        TextView cross = makeText("+",56,Color.rgb(245,197,66));
        cross.setGravity(Gravity.CENTER); cross.setShadowLayer(5,0,0,Color.BLACK);
        root.addView(cross,new FrameLayout.LayoutParams(dp(88),dp(88),Gravity.CENTER));

        LinearLayout panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL); panel.setPadding(dp(14),dp(10),dp(14),dp(14)); panel.setBackgroundColor(0xee0d0f12);
        hintText = makeText(tr("Nišan postavi na mesto gde objekat dodiruje ravan pod. Drži telefon mirno dok ne piše STABILNO.", "Place the crosshair where the object meets a level floor. Hold the phone still until STABLE appears."),12,0xffb0b5bd); panel.addView(hintText);
        LinearLayout hrow = new LinearLayout(this); hrow.setGravity(Gravity.CENTER_VERTICAL);
        TextView hl = makeText(tr("Visina kamere (m)", "Camera height (m)"),14,Color.WHITE); hrow.addView(hl,new LinearLayout.LayoutParams(0,dp(48),1f));
        heightInput = new EditText(this); heightInput.setSingleLine(true); heightInput.setText(String.format(Locale.US,"%.2f",cameraHeightM)); heightInput.setTextColor(Color.WHITE); heightInput.setTextSize(16); heightInput.setInputType(2|8192); heightInput.setGravity(Gravity.CENTER); heightInput.setBackgroundColor(0xff20242a);
        hrow.addView(heightInput,new LinearLayout.LayoutParams(dp(110),dp(44))); panel.addView(hrow);

        LinearLayout targetRow = new LinearLayout(this); targetRow.setOrientation(LinearLayout.HORIZONTAL);
        Button actor = makeButton(tr("GLUMAC", "ACTOR")); Button wall = makeButton(tr("ZID", "WALL")); Button background = makeButton(tr("POZADINA", "BACKGROUND"));
        actor.setOnClickListener(v -> finishMeasurement("subject")); wall.setOnClickListener(v -> finishMeasurement("wall")); background.setOnClickListener(v -> finishMeasurement("background"));
        targetRow.addView(actor); targetRow.addView(wall); targetRow.addView(background); panel.addView(targetRow);

        Button cancel = makeButton(tr("Nazad bez čuvanja", "Back without saving")); cancel.setOnClickListener(v -> { setResult(RESULT_CANCELED); finish(); });
        LinearLayout cancelRow = new LinearLayout(this); cancelRow.addView(cancel); panel.addView(cancelRow);
        root.addView(panel,new FrameLayout.LayoutParams(-1,dp(208),Gravity.BOTTOM));
        setContentView(root);
        root.requestApplyInsets();
    }

    private final TextureView.SurfaceTextureListener surfaceListener = new TextureView.SurfaceTextureListener() {
        @Override public void onSurfaceTextureAvailable(SurfaceTexture surface, int width, int height) { openCamera(); }
        @Override public void onSurfaceTextureSizeChanged(SurfaceTexture surface, int width, int height) { configureTransform(width,height); }
        @Override public boolean onSurfaceTextureDestroyed(SurfaceTexture surface) { return true; }
        @Override public void onSurfaceTextureUpdated(SurfaceTexture surface) {}
    };

    @Override protected void onResume() {
        super.onResume();
        startCameraThread();
        if (rotationSensor != null) sensorManager.registerListener(this, rotationSensor, SensorManager.SENSOR_DELAY_GAME);
        if (textureView != null && textureView.isAvailable()) openCamera();
    }

    @Override protected void onPause() {
        closeCamera(); stopCameraThread();
        if (sensorManager != null) sensorManager.unregisterListener(this);
        super.onPause();
    }

    private void startCameraThread() {
        if (cameraThread != null) return;
        cameraThread = new HandlerThread("LightingAIMeasureCamera"); cameraThread.start(); cameraHandler = new Handler(cameraThread.getLooper());
    }

    private void stopCameraThread() {
        if (cameraThread == null) return;
        cameraThread.quitSafely();
        try { cameraThread.join(); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); }
        cameraThread = null; cameraHandler = null;
    }

    private void openCamera() {
        if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION); return;
        }
        if (cameraDevice != null) return;
        try {
            CameraManager manager = (CameraManager)getSystemService(CAMERA_SERVICE);
            String chosen = null;
            for (String id : manager.getCameraIdList()) {
                CameraCharacteristics c = manager.getCameraCharacteristics(id);
                Integer facing = c.get(CameraCharacteristics.LENS_FACING);
                if (facing != null && facing == CameraCharacteristics.LENS_FACING_BACK) { chosen = id; break; }
            }
            if (chosen == null) { hintText.setText(tr("Zadnja kamera nije pronađena.", "Rear camera not found.")); return; }
            CameraCharacteristics characteristics = manager.getCameraCharacteristics(chosen);
            Integer so = characteristics.get(CameraCharacteristics.SENSOR_ORIENTATION); if (so != null) sensorOrientation = so;
            StreamConfigurationMap map = characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP); if (map == null) return;
            previewSize = chooseSize(map.getOutputSizes(SurfaceTexture.class));
            manager.openCamera(chosen, cameraCallback, cameraHandler);
        } catch (Exception e) {
            hintText.setText(tr("Kamera nije dostupna.", "Camera unavailable."));
        }
    }

    private Size chooseSize(Size[] sizes) {
        if (sizes == null || sizes.length == 0) return new Size(1280,720);
        Size best = sizes[0]; long bestScore = Long.MAX_VALUE;
        for (Size s : sizes) {
            long pixels = (long)s.getWidth()*s.getHeight();
            if (pixels > 1920L*1080L) continue;
            double ratio = (double)Math.max(s.getWidth(),s.getHeight())/Math.min(s.getWidth(),s.getHeight());
            long score = Math.abs(pixels - 1280L*720L) + (long)(Math.abs(ratio - 16.0/9.0)*1000000);
            if (score < bestScore) { bestScore = score; best = s; }
        }
        return best;
    }

    private final CameraDevice.StateCallback cameraCallback = new CameraDevice.StateCallback() {
        @Override public void onOpened(CameraDevice camera) { cameraDevice = camera; createPreview(); }
        @Override public void onDisconnected(CameraDevice camera) { camera.close(); cameraDevice = null; }
        @Override public void onError(CameraDevice camera, int error) { camera.close(); cameraDevice = null; }
    };

    private void createPreview() {
        try {
            SurfaceTexture st = textureView.getSurfaceTexture(); if (st == null || cameraDevice == null || previewSize == null) return;
            st.setDefaultBufferSize(previewSize.getWidth(),previewSize.getHeight());
            Surface surface = new Surface(st);
            previewBuilder = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW); previewBuilder.addTarget(surface);
            previewBuilder.set(CaptureRequest.CONTROL_AF_MODE,CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_PICTURE);
            cameraDevice.createCaptureSession(Arrays.asList(surface), new CameraCaptureSession.StateCallback() {
                @Override public void onConfigured(CameraCaptureSession session) {
                    captureSession = session;
                    try { session.setRepeatingRequest(previewBuilder.build(),null,cameraHandler); } catch (Exception ignored) {}
                    runOnUiThread(() -> configureTransform(textureView.getWidth(),textureView.getHeight()));
                }
                @Override public void onConfigureFailed(CameraCaptureSession session) { hintText.setText(tr("Pregled kamere nije dostupan.", "Camera preview unavailable.")); }
            }, cameraHandler);
        } catch (Exception e) { hintText.setText(tr("Pregled kamere nije dostupan.", "Camera preview unavailable.")); }
    }

    private void configureTransform(int viewWidth, int viewHeight) {
        if (previewSize == null || textureView == null || viewWidth == 0 || viewHeight == 0) return;
        int displayRotation = getWindowManager().getDefaultDisplay().getRotation();
        int displayDegrees = displayRotation == Surface.ROTATION_90 ? 90 : displayRotation == Surface.ROTATION_180 ? 180 : displayRotation == Surface.ROTATION_270 ? 270 : 0;
        int rotation = (sensorOrientation - displayDegrees + 360) % 360;
        boolean swapped = rotation == 90 || rotation == 270;
        float bufferW = swapped ? previewSize.getHeight() : previewSize.getWidth();
        float bufferH = swapped ? previewSize.getWidth() : previewSize.getHeight();
        RectF viewRect = new RectF(0,0,viewWidth,viewHeight);
        RectF bufferRect = new RectF(0,0,bufferW,bufferH);
        float cx = viewRect.centerX(), cy = viewRect.centerY();
        bufferRect.offset(cx-bufferRect.centerX(),cy-bufferRect.centerY());
        Matrix matrix = new Matrix(); matrix.setRectToRect(viewRect,bufferRect,Matrix.ScaleToFit.FILL);
        float scale = Math.max((float)viewHeight/bufferH,(float)viewWidth/bufferW); matrix.postScale(scale,scale,cx,cy); matrix.postRotate(rotation,cx,cy);
        textureView.setTransform(matrix);
    }

    private void closeCamera() {
        if (captureSession != null) { captureSession.close(); captureSession = null; }
        if (cameraDevice != null) { cameraDevice.close(); cameraDevice = null; }
    }

    private void recordDepression(double value) {
        depressionWindow[depressionIndex] = value;
        depressionIndex = (depressionIndex + 1) % STABILITY_WINDOW;
        if (depressionCount < STABILITY_WINDOW) depressionCount++;
        if (depressionCount < 2) { stabilitySpread = Double.NaN; return; }
        double min = Double.POSITIVE_INFINITY, max = Double.NEGATIVE_INFINITY;
        for (int i = 0; i < depressionCount; i++) {
            min = Math.min(min, depressionWindow[i]);
            max = Math.max(max, depressionWindow[i]);
        }
        stabilitySpread = max - min;
    }

    private double distanceForAngle(double angle) {
        if (!(angle > 0) || !(cameraHeightM > 0)) return Double.NaN;
        return cameraHeightM / Math.tan(Math.toRadians(angle));
    }

    @Override public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType()!=Sensor.TYPE_ROTATION_VECTOR && event.sensor.getType()!=Sensor.TYPE_GAME_ROTATION_VECTOR) return;
        float[] r = new float[9]; SensorManager.getRotationMatrixFromVector(r,event.values);
        double worldX = -r[2], worldY = -r[5], worldZ = -r[8];
        double horizontal = Math.sqrt(worldX*worldX + worldY*worldY);
        double rawDepression = Math.toDegrees(Math.atan2(-worldZ,horizontal));
        if (!Double.isFinite(rawDepression)) return;
        recordDepression(rawDepression);
        depressionSmooth = Double.isFinite(depressionSmooth) ? depressionSmooth*0.84 + rawDepression*0.16 : rawDepression;
        cameraHeightM = parseHeight();
        updateEstimate();
    }

    private void updateEstimate() {
        double d = depressionSmooth;
        if (d > 2.5 && d < 82 && cameraHeightM > 0.2) {
            double calculated = distanceForAngle(d);
            if (Double.isFinite(calculated) && calculated > 0.15 && calculated < 100) {
                distanceM = calculated;
                double angleUncertainty = Double.isFinite(stabilitySpread) ? Math.max(0.35, stabilitySpread / 2.0) : 1.0;
                double far = distanceForAngle(Math.max(2.6, d - angleUncertainty));
                double near = distanceForAngle(Math.min(81.9, d + angleUncertainty));
                uncertaintyM = Math.max(Math.abs(far - distanceM), Math.abs(distanceM - near));
                distanceText.setText(String.format(Locale.US,"%.2f m",distanceM));
                angleText.setText(String.format(Locale.US,tr("Nagib %.1f° nadole", "Down tilt %.1f°"),d));

                boolean enoughSamples = depressionCount >= 8;
                boolean stable = enoughSamples && Double.isFinite(stabilitySpread) && stabilitySpread <= 1.5;
                boolean geometryGood = d >= 8 && d <= 60;
                if (!enoughSamples) {
                    qualityText.setText(tr("SAČEKAJ TRENUTAK…", "WAIT A MOMENT…"));
                    qualityText.setTextColor(0xff9da3ad);
                } else if (!stable) {
                    qualityText.setText(String.format(Locale.US,tr("DRŽI MIRNO · raspon %.1f°", "HOLD STILL · spread %.1f°"),stabilitySpread));
                    qualityText.setTextColor(0xffffb5b5);
                } else if (geometryGood) {
                    qualityText.setText(String.format(Locale.US,tr("STABILNO · približno ±%.2f m", "STABLE · approx ±%.2f m"),uncertaintyM));
                    qualityText.setTextColor(0xffb8f0d1);
                } else {
                    qualityText.setText(String.format(Locale.US,tr("STABILNO, ali osetljiv ugao · ±%.2f m", "STABLE, but sensitive angle · ±%.2f m"),uncertaintyM));
                    qualityText.setTextColor(0xfff5dd91);
                }
                return;
            }
        }
        distanceM = Double.NaN; uncertaintyM = Double.NaN; distanceText.setText("— m"); qualityText.setText("");
        angleText.setText(tr("Spusti nišan ka podnožju objekta", "Lower the crosshair toward the object base"));
    }

    private double parseHeight() {
        try { return Double.parseDouble(heightInput.getText().toString().trim().replace(',','.')); }
        catch (Exception e) { return 1.50; }
    }

    private void finishMeasurement(String target) {
        if (!Double.isFinite(distanceM)) {
            hintText.setText(tr("Nema merenja. Spusti nišan na podnožje objekta.", "No measurement. Aim at the object's floor contact point."));
            return;
        }
        if (depressionCount < 8 || !Double.isFinite(stabilitySpread) || stabilitySpread > 2.0) {
            hintText.setText(tr("Drži telefon mirno trenutak, pa pokušaj ponovo.", "Hold the phone still for a moment, then try again."));
            return;
        }
        Intent data = new Intent();
        data.putExtra("target",target);
        data.putExtra("distance",distanceM);
        data.putExtra("angle",depressionSmooth);
        data.putExtra("cameraHeight",parseHeight());
        data.putExtra("uncertainty",uncertaintyM);
        setResult(RESULT_OK,data); finish();
    }

    @Override public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode,permissions,grantResults);
        if (requestCode == CAMERA_PERMISSION && grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) openCamera();
        else if (requestCode == CAMERA_PERMISSION) hintText.setText(tr("Dozvoli kameru da bi PRO merenje radilo.", "Allow camera access for PRO measurement."));
    }
}
