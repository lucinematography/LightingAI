package com.lightingai.app;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.ImageFormat;
import android.graphics.Matrix;
import android.graphics.SurfaceTexture;
import android.graphics.Typeface;
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
import android.media.Image;
import android.media.ImageReader;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.SystemClock;
import android.util.Size;
import android.util.SizeF;
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
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

public class MeasureActivity extends Activity implements SensorEventListener {
    private static final int CAMERA_PERMISSION = 701;
    private static final int STABILITY_WINDOW = 14;
    private static final int DEPTH_WINDOW = 10;
    private static final double MIN_RELIABLE_FALLBACK_ANGLE_DEG = 8.0;
    private static final String PREFS = "lighting_measure_calibration";
    private static final String PREF_ANGLE_OFFSET = "angle_offset_deg";

    private TextureView textureView;
    private CameraDevice cameraDevice;
    private CameraCaptureSession captureSession;
    private CaptureRequest.Builder previewBuilder;
    private HandlerThread cameraThread;
    private Handler cameraHandler;
    private Size previewSize;
    private Size depthSize;
    private ImageReader depthReader;
    private int sensorOrientation = 90;
    private int[] availableAfModes = new int[0];
    private boolean cameraOpening = false;
    private boolean depthSessionActive = false;

    private SensorManager sensorManager;
    private Sensor tiltSensor;
    private boolean fallbackTiltSensor = false;
    private final float[] fallbackGravity = new float[3];
    private boolean fallbackGravityReady = false;

    private TextView distanceText;
    private TextView angleText;
    private TextView qualityText;
    private TextView hintText;
    private TextView calibrationText;
    private EditText heightInput;
    private EditText knownDistanceInput;
    private double depressionSmooth = Double.NaN;
    private double distanceM = Double.NaN;
    private double cameraHeightM = 1.50;
    private double angleCalibrationDeg = 0.0;
    private boolean english = false;
    private final double[] depressionWindow = new double[STABILITY_WINDOW];
    private int depressionCount = 0;
    private int depressionIndex = 0;
    private double stabilitySpread = Double.NaN;
    private double uncertaintyM = Double.NaN;
    private String measurementMethod = "tilt";

    private final double[] depthWindow = new double[DEPTH_WINDOW];
    private volatile int depthCount = 0;
    private int depthIndex = 0;
    private volatile double depthDistanceM = Double.NaN;
    private volatile double depthTemporalSpreadM = Double.NaN;
    private volatile double depthUncertaintyM = Double.NaN;
    private volatile long depthUpdatedAtMs = 0L;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        english = "en".equals(getIntent().getStringExtra("lang"));
        cameraHeightM = getIntent().getDoubleExtra("cameraHeight", 1.50);
        angleCalibrationDeg = getSharedPreferences(PREFS, MODE_PRIVATE).getFloat(PREF_ANGLE_OFFSET, 0f);
        getWindow().setStatusBarColor(Color.rgb(13,15,18));
        getWindow().setNavigationBarColor(Color.rgb(13,15,18));
        startCameraThread();
        buildUi();

        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        chooseTiltSensor();
        if (tiltSensor == null) {
            setHint(tr("Senzor nagiba nije dostupan. Ako telefon ima DEPTH kameru koristiće se direktna dubina; inače koristi WEB rezervu.", "Tilt sensor unavailable. If the phone has a DEPTH camera, direct depth will be used; otherwise use the WEB fallback."));
        } else if (fallbackTiltSensor) {
            setHint(tr("Koristi se kompatibilni rezervni senzor nagiba. Ako DEPTH nije dostupan, za najbolju tačnost uradi kalibraciju poznatim rastojanjem.", "Using a compatible fallback tilt sensor. If DEPTH is unavailable, calibrate with a known distance for best accuracy."));
        }
    }

    private String tr(String sr, String en) { return english ? en : sr; }
    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }

    private void setHint(String text) {
        runOnUiThread(() -> { if (hintText != null) hintText.setText(text); });
    }

    private void chooseTiltSensor() {
        if (sensorManager == null) return;
        tiltSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        if (tiltSensor == null) tiltSensor = sensorManager.getDefaultSensor(Sensor.TYPE_GAME_ROTATION_VECTOR);
        if (tiltSensor == null) {
            tiltSensor = sensorManager.getDefaultSensor(Sensor.TYPE_GRAVITY);
            fallbackTiltSensor = tiltSensor != null;
        }
        if (tiltSensor == null) {
            tiltSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
            fallbackTiltSensor = tiltSensor != null;
        }
    }

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

    private EditText makeNumberInput(String value) {
        EditText input = new EditText(this);
        input.setSingleLine(true);
        input.setText(value);
        input.setTextColor(Color.WHITE);
        input.setHintTextColor(0xff747b85);
        input.setTextSize(16);
        input.setInputType(2|8192);
        input.setGravity(Gravity.CENTER);
        input.setBackgroundColor(0xff20242a);
        return input;
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
        title.setTypeface(null,Typeface.BOLD); top.addView(title);
        distanceText = makeText("— m",36,Color.rgb(245,197,66)); distanceText.setTypeface(null,Typeface.BOLD); top.addView(distanceText);
        angleText = makeText(tr("Ciljaj glumca ili podnožje objekta", "Aim at the actor or the object's base"),13,0xffc5c9d0); top.addView(angleText);
        qualityText = makeText("",12,0xff9da3ad); top.addView(qualityText);
        root.addView(top,new FrameLayout.LayoutParams(-1,dp(132),Gravity.TOP));

        TextView cross = makeText("+",56,Color.rgb(245,197,66));
        cross.setGravity(Gravity.CENTER); cross.setShadowLayer(5,0,0,Color.BLACK);
        root.addView(cross,new FrameLayout.LayoutParams(dp(88),dp(88),Gravity.CENTER));

        LinearLayout panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL); panel.setPadding(dp(14),dp(8),dp(14),dp(12)); panel.setBackgroundColor(0xee0d0f12);
        hintText = makeText(tr("Ako telefon podržava DEPTH, nišan stavi direktno na glumca/objekat. Bez DEPTH-a ciljaj mesto gde objekat dodiruje ravan pod i drži telefon mirno.", "If the phone supports DEPTH, aim directly at the actor/object. Without DEPTH, aim where the object meets a level floor and hold the phone still."),12,0xffb0b5bd); panel.addView(hintText);

        LinearLayout hrow = new LinearLayout(this); hrow.setGravity(Gravity.CENTER_VERTICAL);
        TextView hl = makeText(tr("Visina kamere (m)", "Camera height (m)"),14,Color.WHITE); hrow.addView(hl,new LinearLayout.LayoutParams(0,dp(46),1f));
        heightInput = makeNumberInput(String.format(Locale.US,"%.2f",cameraHeightM));
        hrow.addView(heightInput,new LinearLayout.LayoutParams(dp(110),dp(42))); panel.addView(hrow);

        calibrationText = makeText("",11,0xff9da3ad); panel.addView(calibrationText);
        LinearLayout calRow = new LinearLayout(this); calRow.setGravity(Gravity.CENTER_VERTICAL);
        knownDistanceInput = makeNumberInput("2.00");
        knownDistanceInput.setHint(tr("Poznato rastojanje (m)", "Known distance (m)"));
        calRow.addView(knownDistanceInput,new LinearLayout.LayoutParams(0,dp(46),1f));
        Button calibrate = makeButton(tr("KALIBRIŠI", "CALIBRATE")); calibrate.setTextSize(12);
        Button resetCalibration = makeButton(tr("RESET KAL.", "RESET CAL.")); resetCalibration.setTextSize(12);
        calibrate.setOnClickListener(v -> calibrateAngle());
        resetCalibration.setOnClickListener(v -> resetCalibration());
        calRow.addView(calibrate); calRow.addView(resetCalibration); panel.addView(calRow);
        showCalibrationStatus();

        LinearLayout targetRow = new LinearLayout(this); targetRow.setOrientation(LinearLayout.HORIZONTAL);
        Button actor = makeButton(tr("GLUMAC", "ACTOR")); Button wall = makeButton(tr("ZID", "WALL")); Button background = makeButton(tr("POZADINA", "BACKGROUND"));
        actor.setOnClickListener(v -> finishMeasurement("subject")); wall.setOnClickListener(v -> finishMeasurement("wall")); background.setOnClickListener(v -> finishMeasurement("background"));
        targetRow.addView(actor); targetRow.addView(wall); targetRow.addView(background); panel.addView(targetRow);

        Button cancel = makeButton(tr("Nazad bez čuvanja", "Back without saving")); cancel.setOnClickListener(v -> { setResult(RESULT_CANCELED); finish(); });
        LinearLayout cancelRow = new LinearLayout(this); cancelRow.addView(cancel); panel.addView(cancelRow);
        root.addView(panel,new FrameLayout.LayoutParams(-1,dp(286),Gravity.BOTTOM));
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
        if (tiltSensor != null && sensorManager != null) sensorManager.registerListener(this, tiltSensor, SensorManager.SENSOR_DELAY_GAME);
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

    private static boolean containsMode(int[] modes, int value) {
        if (modes == null) return false;
        for (int mode : modes) if (mode == value) return true;
        return false;
    }

    private static boolean hasDepthOutput(CameraCharacteristics c) {
        int[] capabilities = c.get(CameraCharacteristics.REQUEST_AVAILABLE_CAPABILITIES);
        if (capabilities == null) return false;
        for (int capability : capabilities) {
            if (capability == CameraCharacteristics.REQUEST_AVAILABLE_CAPABILITIES_DEPTH_OUTPUT) return true;
        }
        return false;
    }

    private Size chooseDepthSize(StreamConfigurationMap map) {
        if (map == null) return null;
        Size[] sizes;
        try { sizes = map.getOutputSizes(ImageFormat.DEPTH16); }
        catch (Exception e) { return null; }
        if (sizes == null || sizes.length == 0) return null;
        Size best = sizes[0];
        long target = 320L * 240L;
        long bestScore = Math.abs((long)best.getWidth()*best.getHeight() - target);
        for (Size s : sizes) {
            long pixels = (long)s.getWidth()*s.getHeight();
            long score = Math.abs(pixels - target);
            if (score < bestScore) { best = s; bestScore = score; }
        }
        return best;
    }

    private String chooseBackCamera(CameraManager manager) throws Exception {
        String bestId = null;
        double bestScore = -Double.MAX_VALUE;
        for (String id : manager.getCameraIdList()) {
            CameraCharacteristics c = manager.getCameraCharacteristics(id);
            Integer facing = c.get(CameraCharacteristics.LENS_FACING);
            if (facing == null || facing != CameraCharacteristics.LENS_FACING_BACK) continue;

            StreamConfigurationMap map = c.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP);
            Size[] outputs = map == null ? null : map.getOutputSizes(SurfaceTexture.class);
            if (outputs == null || outputs.length == 0) continue;

            double score = 0;
            if (hasDepthOutput(c) && chooseDepthSize(map) != null) score += 30000;
            int[] afModes = c.get(CameraCharacteristics.CONTROL_AF_AVAILABLE_MODES);
            if (containsMode(afModes, CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_PICTURE)) score += 10000;
            else if (containsMode(afModes, CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_VIDEO)) score += 7000;
            else if (containsMode(afModes, CaptureRequest.CONTROL_AF_MODE_AUTO)) score += 3000;

            SizeF physical = c.get(CameraCharacteristics.SENSOR_INFO_PHYSICAL_SIZE);
            if (physical != null && physical.getWidth() > 0 && physical.getHeight() > 0) {
                score += physical.getWidth() * physical.getHeight() * 100.0;
                float[] focals = c.get(CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS);
                if (focals != null && focals.length > 0) {
                    float shortest = focals[0];
                    for (float f : focals) shortest = Math.min(shortest, f);
                    double equivalent = 36.0 * shortest / physical.getWidth();
                    score += Math.max(0.0, 12000.0 - Math.abs(equivalent - 28.0) * 600.0);
                }
            }

            if (score > bestScore) {
                bestScore = score;
                bestId = id;
            }
        }
        return bestId;
    }

    private void openCamera() {
        if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.CAMERA}, CAMERA_PERMISSION); return;
        }
        if (cameraDevice != null || cameraOpening) return;
        try {
            CameraManager manager = (CameraManager)getSystemService(CAMERA_SERVICE);
            String chosen = chooseBackCamera(manager);
            if (chosen == null) { setHint(tr("Kompatibilna zadnja kamera nije pronađena.", "No compatible rear camera found.")); return; }

            CameraCharacteristics characteristics = manager.getCameraCharacteristics(chosen);
            Integer so = characteristics.get(CameraCharacteristics.SENSOR_ORIENTATION); if (so != null) sensorOrientation = so;
            int[] af = characteristics.get(CameraCharacteristics.CONTROL_AF_AVAILABLE_MODES);
            availableAfModes = af == null ? new int[0] : af;
            StreamConfigurationMap map = characteristics.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP);
            if (map == null) { setHint(tr("Ovaj modul kamere ne daje kompatibilan pregled.", "This camera module does not provide a compatible preview.")); return; }
            previewSize = chooseSize(map.getOutputSizes(SurfaceTexture.class));
            depthSize = hasDepthOutput(characteristics) ? chooseDepthSize(map) : null;
            if (previewSize == null) { setHint(tr("Nema podržane veličine pregleda kamere.", "No supported camera preview size.")); return; }
            resetDepthEstimate();
            cameraOpening = true;
            manager.openCamera(chosen, cameraCallback, cameraHandler);
        } catch (Exception e) {
            cameraOpening = false;
            setHint(tr("Kamera nije dostupna.", "Camera unavailable."));
        }
    }

    private Size chooseSize(Size[] sizes) {
        if (sizes == null || sizes.length == 0) return null;
        Size best = null; long bestScore = Long.MAX_VALUE;
        for (Size s : sizes) {
            long pixels = (long)s.getWidth()*s.getHeight();
            if (pixels > 1920L*1080L) continue;
            double ratio = (double)Math.max(s.getWidth(),s.getHeight())/Math.min(s.getWidth(),s.getHeight());
            long score = Math.abs(pixels - 1280L*720L) + (long)(Math.abs(ratio - 16.0/9.0)*1000000);
            if (score < bestScore) { bestScore = score; best = s; }
        }
        if (best != null) return best;

        best = sizes[0];
        long smallest = (long)best.getWidth()*best.getHeight();
        for (Size s : sizes) {
            long pixels = (long)s.getWidth()*s.getHeight();
            if (pixels < smallest) { smallest = pixels; best = s; }
        }
        return best;
    }

    private final CameraDevice.StateCallback cameraCallback = new CameraDevice.StateCallback() {
        @Override public void onOpened(CameraDevice camera) { cameraOpening = false; cameraDevice = camera; createPreview(); }
        @Override public void onDisconnected(CameraDevice camera) { cameraOpening = false; camera.close(); cameraDevice = null; setHint(tr("Kamera je prekinuta.", "Camera disconnected.")); }
        @Override public void onError(CameraDevice camera, int error) { cameraOpening = false; camera.close(); cameraDevice = null; setHint(tr("Greška kamere. Pokušaj ponovo.", "Camera error. Try again.")); }
    };

    private void createPreview() { createPreview(depthSize != null); }

    private void createPreview(boolean tryDepth) {
        try {
            SurfaceTexture st = textureView.getSurfaceTexture(); if (st == null || cameraDevice == null || previewSize == null) return;
            st.setDefaultBufferSize(previewSize.getWidth(),previewSize.getHeight());
            Surface surface = new Surface(st);
            previewBuilder = cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW);
            previewBuilder.addTarget(surface);
            List<Surface> outputs = new ArrayList<>();
            outputs.add(surface);

            if (tryDepth && depthSize != null) {
                prepareDepthReader();
                if (depthReader != null) {
                    Surface depthSurface = depthReader.getSurface();
                    previewBuilder.addTarget(depthSurface);
                    outputs.add(depthSurface);
                } else {
                    tryDepth = false;
                }
            }

            if (containsMode(availableAfModes, CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_PICTURE)) {
                previewBuilder.set(CaptureRequest.CONTROL_AF_MODE,CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_PICTURE);
            } else if (containsMode(availableAfModes, CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_VIDEO)) {
                previewBuilder.set(CaptureRequest.CONTROL_AF_MODE,CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_VIDEO);
            }

            final boolean requestedDepth = tryDepth;
            cameraDevice.createCaptureSession(outputs, new CameraCaptureSession.StateCallback() {
                @Override public void onConfigured(CameraCaptureSession session) {
                    captureSession = session;
                    depthSessionActive = requestedDepth && depthReader != null;
                    try { session.setRepeatingRequest(previewBuilder.build(),null,cameraHandler); }
                    catch (Exception e) { setHint(tr("Pregled kamere nije mogao da se pokrene.", "Camera preview could not start.")); }
                    if (depthSessionActive) {
                        setHint(tr("DEPTH je aktivan: nišan stavi direktno na glumca ili objekat i sačekaj STABILNO.", "DEPTH is active: aim directly at the actor or object and wait for STABLE."));
                    }
                    runOnUiThread(() -> configureTransform(textureView.getWidth(),textureView.getHeight()));
                }
                @Override public void onConfigureFailed(CameraCaptureSession session) {
                    if (requestedDepth) {
                        depthSessionActive = false;
                        closeDepthReader();
                        depthSize = null;
                        setHint(tr("DEPTH nije mogao da se pokrene; nastavljam bezbedno sa merenjem preko nagiba.", "DEPTH could not start; safely continuing with tilt-based measurement."));
                        createPreview(false);
                    } else {
                        setHint(tr("Pregled kamere nije dostupan.", "Camera preview unavailable."));
                    }
                }
            }, cameraHandler);
        } catch (Exception e) {
            if (tryDepth) {
                depthSessionActive = false;
                closeDepthReader();
                depthSize = null;
                createPreview(false);
            } else {
                setHint(tr("Pregled kamere nije dostupan.", "Camera preview unavailable."));
            }
        }
    }

    private void prepareDepthReader() {
        closeDepthReader();
        if (depthSize == null) return;
        try {
            depthReader = ImageReader.newInstance(depthSize.getWidth(), depthSize.getHeight(), ImageFormat.DEPTH16, 2);
            depthReader.setOnImageAvailableListener(this::onDepthImageAvailable, cameraHandler);
        } catch (Exception e) {
            depthReader = null;
        }
    }

    private void onDepthImageAvailable(ImageReader reader) {
        Image image = null;
        try {
            image = reader.acquireLatestImage();
            if (image != null) acceptDepthImage(image);
        } catch (Exception ignored) {
        } finally {
            if (image != null) image.close();
        }
    }

    private void acceptDepthImage(Image image) {
        if (image.getFormat() != ImageFormat.DEPTH16 || image.getPlanes().length == 0) return;
        Image.Plane plane = image.getPlanes()[0];
        ByteBuffer buffer = plane.getBuffer().duplicate().order(ByteOrder.nativeOrder());
        int rowStride = plane.getRowStride();
        int pixelStride = plane.getPixelStride();
        int width = image.getWidth(), height = image.getHeight();
        if (width < 3 || height < 3 || pixelStride < 2) return;

        int cx = width / 2, cy = height / 2;
        int radius = Math.max(2, Math.min(6, Math.min(width,height) / 30));
        double[] values = new double[(radius*2+1)*(radius*2+1)];
        int count = 0;
        for (int y = Math.max(0,cy-radius); y <= Math.min(height-1,cy+radius); y++) {
            for (int x = Math.max(0,cx-radius); x <= Math.min(width-1,cx+radius); x++) {
                int offset = y * rowStride + x * pixelStride;
                if (offset < 0 || offset + 1 >= buffer.limit()) continue;
                int packed = buffer.getShort(offset) & 0xffff;
                int depthMm = packed & 0x1fff;
                int confidence = (packed >> 13) & 0x7;
                if (depthMm <= 0 || confidence == 1) continue;
                double meters = depthMm / 1000.0;
                if (meters < 0.15 || meters > 8.191) continue;
                values[count++] = meters;
            }
        }
        if (count < 5) return;
        Arrays.sort(values,0,count);
        double median = values[count/2];
        double q1 = values[Math.max(0,count/4)];
        double q3 = values[Math.min(count-1,(count*3)/4)];
        double spatial = Math.max(0.03,(q3-q1)/2.0);
        recordDepth(median, spatial);
    }

    private void recordDepth(double value, double spatialUncertainty) {
        depthWindow[depthIndex] = value;
        depthIndex = (depthIndex + 1) % DEPTH_WINDOW;
        if (depthCount < DEPTH_WINDOW) depthCount++;
        double min = Double.POSITIVE_INFINITY, max = Double.NEGATIVE_INFINITY;
        for (int i=0;i<depthCount;i++) {
            min = Math.min(min,depthWindow[i]);
            max = Math.max(max,depthWindow[i]);
        }
        depthTemporalSpreadM = depthCount >= 2 ? max-min : Double.NaN;
        depthDistanceM = Double.isFinite(depthDistanceM) ? depthDistanceM*0.65 + value*0.35 : value;
        double temporal = Double.isFinite(depthTemporalSpreadM) ? depthTemporalSpreadM/2.0 : 0.10;
        depthUncertaintyM = Math.max(spatialUncertainty,temporal);
        depthUpdatedAtMs = SystemClock.elapsedRealtime();
        runOnUiThread(this::updateEstimate);
    }

    private boolean depthIsFresh() {
        return depthSessionActive && Double.isFinite(depthDistanceM) && depthDistanceM > 0 &&
            SystemClock.elapsedRealtime() - depthUpdatedAtMs <= 1000L;
    }

    private boolean depthIsStable() {
        if (!depthIsFresh() || depthCount < 4 || !Double.isFinite(depthTemporalSpreadM)) return false;
        return depthTemporalSpreadM <= Math.max(0.15, depthDistanceM * 0.08);
    }

    private void resetDepthEstimate() {
        depthSessionActive = false;
        depthCount = 0;
        depthIndex = 0;
        depthDistanceM = Double.NaN;
        depthTemporalSpreadM = Double.NaN;
        depthUncertaintyM = Double.NaN;
        depthUpdatedAtMs = 0L;
    }

    private void closeDepthReader() {
        if (depthReader != null) {
            try { depthReader.close(); } catch (Exception ignored) {}
            depthReader = null;
        }
    }

    private void configureTransform(int viewWidth, int viewHeight) {
        if (previewSize == null || textureView == null || viewWidth == 0 || viewHeight == 0) return;
        // The Redmi Note 12 camera pipeline already supplies an upright portrait
        // TextureView stream. Applying the sensor angle here rotates that correct
        // stream sideways, so keep the native camera transform unchanged.
        textureView.setTransform(new Matrix());
    }

    private void closeCamera() {
        cameraOpening = false;
        depthSessionActive = false;
        if (captureSession != null) { captureSession.close(); captureSession = null; }
        if (cameraDevice != null) { cameraDevice.close(); cameraDevice = null; }
        closeDepthReader();
        resetDepthEstimate();
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

    private void acceptDepression(double rawDepression) {
        if (!Double.isFinite(rawDepression)) return;
        recordDepression(rawDepression);
        depressionSmooth = Double.isFinite(depressionSmooth) ? depressionSmooth*0.84 + rawDepression*0.16 : rawDepression;
        cameraHeightM = parseHeight();
        updateEstimate();
    }

    @Override public void onSensorChanged(SensorEvent event) {
        int type = event.sensor.getType();
        if (type == Sensor.TYPE_ROTATION_VECTOR || type == Sensor.TYPE_GAME_ROTATION_VECTOR) {
            float[] r = new float[9]; SensorManager.getRotationMatrixFromVector(r,event.values);
            double worldX = -r[2], worldY = -r[5], worldZ = -r[8];
            double horizontal = Math.sqrt(worldX*worldX + worldY*worldY);
            acceptDepression(Math.toDegrees(Math.atan2(-worldZ,horizontal)));
            return;
        }

        if (type == Sensor.TYPE_GRAVITY || type == Sensor.TYPE_ACCELEROMETER) {
            if (event.values.length < 3) return;
            if (type == Sensor.TYPE_ACCELEROMETER) {
                if (!fallbackGravityReady) {
                    fallbackGravity[0]=event.values[0]; fallbackGravity[1]=event.values[1]; fallbackGravity[2]=event.values[2];
                    fallbackGravityReady = true;
                } else {
                    fallbackGravity[0]=fallbackGravity[0]*0.85f+event.values[0]*0.15f;
                    fallbackGravity[1]=fallbackGravity[1]*0.85f+event.values[1]*0.15f;
                    fallbackGravity[2]=fallbackGravity[2]*0.85f+event.values[2]*0.15f;
                }
            } else {
                fallbackGravity[0]=event.values[0]; fallbackGravity[1]=event.values[1]; fallbackGravity[2]=event.values[2];
                fallbackGravityReady = true;
            }
            double horizontal = Math.hypot(fallbackGravity[0], fallbackGravity[1]);
            acceptDepression(Math.toDegrees(Math.atan2(fallbackGravity[2], horizontal)));
        }
    }

    private void updateEstimate() {
        if (depthIsFresh()) {
            measurementMethod = "depth";
            distanceM = depthDistanceM;
            uncertaintyM = depthUncertaintyM;
            distanceText.setText(String.format(Locale.US,"%.2f m",distanceM));
            angleText.setText(tr("Direktna DEPTH udaljenost", "Direct DEPTH distance"));
            if (depthIsStable()) {
                qualityText.setText(String.format(Locale.US,tr("DEPTH · STABILNO · približno ±%.2f m", "DEPTH · STABLE · approx ±%.2f m"),uncertaintyM));
                qualityText.setTextColor(0xffb8f0d1);
            } else {
                qualityText.setText(tr("DEPTH · SAČEKAJ TRENUTAK…", "DEPTH · WAIT A MOMENT…"));
                qualityText.setTextColor(0xff9da3ad);
            }
            return;
        }

        measurementMethod = "tilt";
        double d = depressionSmooth + angleCalibrationDeg;
        if (d > 2.5 && d < MIN_RELIABLE_FALLBACK_ANGLE_DEG && cameraHeightM > 0.2) {
            distanceM = Double.NaN;
            uncertaintyM = Double.NaN;
            distanceText.setText("— m");
            angleText.setText(String.format(Locale.US,tr("Nagib %.1f° nadole", "Down tilt %.1f°"),d));
            qualityText.setText(tr("PREMALI UGAO · spusti nišan ka podnožju ili priđi bliže", "ANGLE TOO SHALLOW · lower the crosshair to the base or move closer"));
            qualityText.setTextColor(0xffffb5b5);
            return;
        }
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
                boolean geometryGood = d >= MIN_RELIABLE_FALLBACK_ANGLE_DEG && d <= 60;
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

    private double parseKnownDistance() {
        try { return Double.parseDouble(knownDistanceInput.getText().toString().trim().replace(',','.')); }
        catch (Exception e) { return Double.NaN; }
    }

    private void showCalibrationStatus() {
        if (calibrationText == null) return;
        if (Math.abs(angleCalibrationDeg) < 0.01) {
            calibrationText.setText(tr("Kalibracija: fabrička (0,00°). Za veću tačnost fallback merenja koristi poznato rastojanje.", "Calibration: default (0.00°). For more accurate fallback measurement, use a known distance."));
            calibrationText.setTextColor(0xff9da3ad);
        } else {
            calibrationText.setText(String.format(Locale.US,tr("Kalibracija uređaja: korekcija %+1.2f°", "Device calibration: correction %+1.2f°"),angleCalibrationDeg));
            calibrationText.setTextColor(0xffb8f0d1);
        }
    }

    private void calibrateAngle() {
        cameraHeightM = parseHeight();
        double known = parseKnownDistance();
        if (!(known >= 0.30 && known <= 50.0) || !(cameraHeightM >= 0.30 && cameraHeightM <= 3.0)) {
            setHint(tr("Unesi tačnu visinu kamere i poznato rastojanje 0,30–50 m.", "Enter the exact camera height and a known distance of 0.30–50 m."));
            return;
        }
        if (!Double.isFinite(depressionSmooth) || depressionCount < 8 || !Double.isFinite(stabilitySpread) || stabilitySpread > 1.5) {
            setHint(tr("Za kalibraciju fallback merenja drži uređaj mirno dok ne piše STABILNO.", "For fallback calibration, hold the device still until STABLE appears."));
            return;
        }
        double expectedAngle = Math.toDegrees(Math.atan2(cameraHeightM, known));
        double offset = expectedAngle - depressionSmooth;
        if (!Double.isFinite(offset) || Math.abs(offset) > 15.0) {
            setHint(tr("Kalibracija je van očekivanog opsega. Proveri visinu kamere, poznato rastojanje i nišan.", "Calibration is outside the expected range. Check camera height, known distance and crosshair."));
            return;
        }
        angleCalibrationDeg = offset;
        getSharedPreferences(PREFS, MODE_PRIVATE).edit().putFloat(PREF_ANGLE_OFFSET, (float)angleCalibrationDeg).apply();
        showCalibrationStatus();
        updateEstimate();
        setHint(tr("Kalibracija je sačuvana za ovaj uređaj. Koristiće se kada DEPTH nije dostupan.", "Calibration saved for this device. It will be used when DEPTH is unavailable."));
    }

    private void resetCalibration() {
        angleCalibrationDeg = 0.0;
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        prefs.edit().remove(PREF_ANGLE_OFFSET).apply();
        showCalibrationStatus();
        updateEstimate();
        setHint(tr("Kalibracija fallback merenja je vraćena na fabričku vrednost.", "Fallback calibration reset to the default value."));
    }

    private void finishMeasurement(String target) {
        if (!Double.isFinite(distanceM)) {
            setHint(tr("Nema pouzdanog merenja. Ako nema DEPTH-a, spusti nišan na podnožje objekta i koristi ugao od najmanje 8°.", "No reliable measurement. If DEPTH is unavailable, aim at the object's floor contact point and use at least an 8° downward angle."));
            return;
        }
        if ("depth".equals(measurementMethod)) {
            if (!depthIsStable()) {
                setHint(tr("Sačekaj da DEPTH merenje postane STABILNO, pa pokušaj ponovo.", "Wait for the DEPTH measurement to become STABLE, then try again."));
                return;
            }
        } else {
            double fallbackAngle = depressionSmooth + angleCalibrationDeg;
            if (!Double.isFinite(fallbackAngle) || fallbackAngle < MIN_RELIABLE_FALLBACK_ANGLE_DEG) {
                setHint(tr("Fallback ugao je premali za pouzdano merenje. Spusti nišan ka podnožju ili priđi bliže.", "The fallback angle is too shallow for a reliable measurement. Lower the crosshair to the base or move closer."));
                return;
            }
            if (depressionCount < 8 || !Double.isFinite(stabilitySpread) || stabilitySpread > 2.0) {
                setHint(tr("Drži uređaj mirno trenutak, pa pokušaj ponovo.", "Hold the device still for a moment, then try again."));
                return;
            }
        }
        Intent data = new Intent();
        data.putExtra("target",target);
        data.putExtra("distance",distanceM);
        data.putExtra("angle",Double.isFinite(depressionSmooth) ? depressionSmooth + angleCalibrationDeg : Double.NaN);
        data.putExtra("cameraHeight",parseHeight());
        data.putExtra("uncertainty",uncertaintyM);
        data.putExtra("method",measurementMethod);
        data.putExtra("calibrationOffset",angleCalibrationDeg);
        data.putExtra("sensorFallback",fallbackTiltSensor);
        setResult(RESULT_OK,data); finish();
    }

    @Override public void onAccuracyChanged(Sensor sensor, int accuracy) {}

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode,permissions,grantResults);
        if (requestCode == CAMERA_PERMISSION && grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) openCamera();
        else if (requestCode == CAMERA_PERMISSION) setHint(tr("Dozvoli kameru da bi PRO merenje radilo.", "Allow camera access for PRO measurement."));
    }
}
