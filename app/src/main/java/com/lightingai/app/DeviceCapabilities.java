package com.lightingai.app;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorManager;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.os.Build;
import org.json.JSONObject;

public final class DeviceCapabilities {
    private DeviceCapabilities() {}

    public static String toJson(Context context) {
        JSONObject out = new JSONObject();
        try {
            PackageManager pm = context.getPackageManager();
            SensorManager sensors = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);

            boolean rotationVector = hasSensor(sensors, Sensor.TYPE_ROTATION_VECTOR);
            boolean gameRotation = hasSensor(sensors, Sensor.TYPE_GAME_ROTATION_VECTOR);
            boolean gravity = hasSensor(sensors, Sensor.TYPE_GRAVITY);
            boolean accelerometer = hasSensor(sensors, Sensor.TYPE_ACCELEROMETER);
            boolean gyroscope = hasSensor(sensors, Sensor.TYPE_GYROSCOPE);
            boolean compass = hasSensor(sensors, Sensor.TYPE_MAGNETIC_FIELD);

            String tiltMode = rotationVector ? "rotation_vector" :
                gameRotation ? "game_rotation_vector" :
                gravity ? "gravity" :
                accelerometer ? "accelerometer" : "none";

            int rearCameraCount = 0;
            boolean autofocus = false;
            boolean continuousAf = false;
            boolean flash = false;
            boolean depthOutput = false;
            boolean modernCamera2 = false;

            try {
                CameraManager manager = (CameraManager) context.getSystemService(Context.CAMERA_SERVICE);
                if (manager != null) {
                    for (String id : manager.getCameraIdList()) {
                        CameraCharacteristics c = manager.getCameraCharacteristics(id);
                        Integer facing = c.get(CameraCharacteristics.LENS_FACING);
                        if (facing == null || facing != CameraCharacteristics.LENS_FACING_BACK) continue;
                        rearCameraCount++;

                        Boolean hasFlash = c.get(CameraCharacteristics.FLASH_INFO_AVAILABLE);
                        if (Boolean.TRUE.equals(hasFlash)) flash = true;

                        int[] afModes = c.get(CameraCharacteristics.CONTROL_AF_AVAILABLE_MODES);
                        if (afModes != null) {
                            for (int mode : afModes) {
                                if (mode != 0) autofocus = true;
                                if (mode == 3 || mode == 4) continuousAf = true;
                            }
                        }

                        int[] capabilities = c.get(CameraCharacteristics.REQUEST_AVAILABLE_CAPABILITIES);
                        if (capabilities != null) {
                            for (int capability : capabilities) {
                                if (capability == CameraCharacteristics.REQUEST_AVAILABLE_CAPABILITIES_DEPTH_OUTPUT) {
                                    depthOutput = true;
                                }
                            }
                        }

                        Integer level = c.get(CameraCharacteristics.INFO_SUPPORTED_HARDWARE_LEVEL);
                        if (level != null && level != CameraCharacteristics.INFO_SUPPORTED_HARDWARE_LEVEL_LEGACY) {
                            modernCamera2 = true;
                        }
                    }
                }
            } catch (Exception ignored) {}

            boolean cameraPermission = Build.VERSION.SDK_INT < Build.VERSION_CODES.M ||
                context.checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
            boolean locationPermission = Build.VERSION.SDK_INT < Build.VERSION_CODES.M ||
                context.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                context.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;

            out.put("nativeAndroid", true);
            out.put("androidApi", Build.VERSION.SDK_INT);
            out.put("cameraAny", pm.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY));
            out.put("rearCameraCount", rearCameraCount);
            out.put("camera2Modern", modernCamera2);
            out.put("autofocus", autofocus);
            out.put("continuousAf", continuousAf);
            out.put("flash", flash);
            out.put("depthOutput", depthOutput);
            out.put("cameraPermission", cameraPermission);
            out.put("rotationVector", rotationVector);
            out.put("gameRotationVector", gameRotation);
            out.put("gravity", gravity);
            out.put("accelerometer", accelerometer);
            out.put("gyroscope", gyroscope);
            out.put("compass", compass);
            out.put("tiltMode", tiltMode);
            out.put("gps", pm.hasSystemFeature(PackageManager.FEATURE_LOCATION_GPS));
            out.put("networkLocation", pm.hasSystemFeature(PackageManager.FEATURE_LOCATION_NETWORK));
            out.put("locationPermission", locationPermission);
            out.put("nativeProAvailable", rearCameraCount > 0 && !"none".equals(tiltMode));
        } catch (Exception ignored) {
            try {
                out.put("nativeAndroid", true);
                out.put("nativeProAvailable", false);
                out.put("error", "capability_probe_failed");
            } catch (Exception ignoredAgain) {}
        }
        return out.toString();
    }

    private static boolean hasSensor(SensorManager manager, int type) {
        return manager != null && manager.getDefaultSensor(type) != null;
    }
}
