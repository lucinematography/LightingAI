package com.lightingai.app;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;

public final class NativeSunCompass implements SensorEventListener {
    public interface Callback {
        void onHeading(double headingDeg);
        void onUnavailable();
    }

    private final SensorManager sensorManager;
    private final Sensor rotationVector;
    private final Sensor geomagneticRotationVector;
    private final Sensor accelerometer;
    private final Sensor magnetometer;
    private final float[] accel = new float[3];
    private final float[] magnetic = new float[3];
    private boolean accelReady = false;
    private boolean magneticReady = false;
    private boolean running = false;
    private Callback callback;
    private double smoothEast = Double.NaN;
    private double smoothNorth = Double.NaN;
    private long lastEmitMs = 0L;

    public NativeSunCompass(Context context) {
        sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager == null) {
            rotationVector = null;
            geomagneticRotationVector = null;
            accelerometer = null;
            magnetometer = null;
        } else {
            rotationVector = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
            geomagneticRotationVector = sensorManager.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR);
            accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
            magnetometer = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
        }
    }

    public boolean start(Callback callback) {
        stop();
        this.callback = callback;
        if (sensorManager == null) return unavailable();

        boolean ok = false;
        if (rotationVector != null) {
            ok = sensorManager.registerListener(this, rotationVector, SensorManager.SENSOR_DELAY_GAME);
        } else if (geomagneticRotationVector != null) {
            ok = sensorManager.registerListener(this, geomagneticRotationVector, SensorManager.SENSOR_DELAY_GAME);
        } else if (accelerometer != null && magnetometer != null) {
            boolean a = sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_GAME);
            boolean m = sensorManager.registerListener(this, magnetometer, SensorManager.SENSOR_DELAY_GAME);
            ok = a && m;
        }

        running = ok;
        if (!ok) {
            sensorManager.unregisterListener(this);
            return unavailable();
        }
        return true;
    }

    private boolean unavailable() {
        Callback cb = callback;
        callback = null;
        if (cb != null) cb.onUnavailable();
        return false;
    }

    public void stop() {
        if (sensorManager != null) sensorManager.unregisterListener(this);
        running = false;
        callback = null;
        accelReady = false;
        magneticReady = false;
        smoothEast = Double.NaN;
        smoothNorth = Double.NaN;
        lastEmitMs = 0L;
    }

    @Override public void onSensorChanged(SensorEvent event) {
        if (!running || event == null || event.sensor == null) return;
        int type = event.sensor.getType();
        if (type == Sensor.TYPE_ROTATION_VECTOR || type == Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR) {
            float[] r = new float[9];
            try {
                SensorManager.getRotationMatrixFromVector(r, event.values);
                emitFromRotationMatrix(r);
            } catch (Exception ignored) {}
            return;
        }

        if (type == Sensor.TYPE_ACCELEROMETER) {
            lowPass(event.values, accel, accelReady ? 0.82f : 0f);
            accelReady = true;
        } else if (type == Sensor.TYPE_MAGNETIC_FIELD) {
            lowPass(event.values, magnetic, magneticReady ? 0.82f : 0f);
            magneticReady = true;
        }

        if (accelReady && magneticReady) {
            float[] r = new float[9];
            if (SensorManager.getRotationMatrix(r, null, accel, magnetic)) emitFromRotationMatrix(r);
        }
    }

    private void lowPass(float[] input, float[] output, float alpha) {
        int n = Math.min(3, input.length);
        for (int i = 0; i < n; i++) output[i] = alpha * output[i] + (1f - alpha) * input[i];
    }

    private void emitFromRotationMatrix(float[] r) {
        if (r == null || r.length < 9) return;
        double east = -r[2];
        double north = -r[5];
        double horizontal = Math.sqrt(east * east + north * north);
        if (horizontal < 0.08) return;
        east /= horizontal;
        north /= horizontal;

        if (!Double.isFinite(smoothEast)) {
            smoothEast = east;
            smoothNorth = north;
        } else {
            smoothEast = smoothEast * 0.82 + east * 0.18;
            smoothNorth = smoothNorth * 0.82 + north * 0.18;
        }

        double len = Math.sqrt(smoothEast * smoothEast + smoothNorth * smoothNorth);
        if (len < 0.001) return;
        double heading = Math.toDegrees(Math.atan2(smoothEast / len, smoothNorth / len));
        if (heading < 0) heading += 360.0;

        long now = System.currentTimeMillis();
        if (now - lastEmitMs < 80L) return;
        lastEmitMs = now;
        Callback cb = callback;
        if (cb != null) cb.onHeading(heading);
    }

    @Override public void onAccuracyChanged(Sensor sensor, int accuracy) {}
}
