package com.lightingai.app;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import org.json.JSONArray;
import org.json.JSONObject;

@SuppressLint("MissingPermission")
public final class AsteraBtbColorReplayProbe {
    public interface Callback {
        void onComplete(JSONObject result);
        void onError(JSONObject result, String code);
    }

    private static final int MAX_ATTEMPTS = 3;

    private final Context context;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Object lock = new Object();

    private BluetoothGatt activeGatt;
    private Runnable timeoutRunnable;
    private Runnable fallbackSuccessRunnable;
    private Runnable retryRunnable;
    private Callback callback;
    private JSONObject activeResult;
    private JSONArray eventTimeline;
    private int epoch = 0;
    private int attempt = 0;
    private long deadlineMs = 0L;
    private String activeAddress = "";
    private AsteraBtbCapturedFrames.Preset activePreset;

    public AsteraBtbColorReplayProbe(Context context) {
        this.context = context.getApplicationContext();
    }

    public void replay(
        String address,
        String presetValue,
        int timeoutMs,
        Callback resultCallback
    ) {
        final String target = address == null ? "" : address.trim();
        final AsteraBtbCapturedFrames.Preset preset;
        try {
            preset = AsteraBtbCapturedFrames.parsePreset(presetValue);
        } catch (Exception e) {
            JSONObject result = base(target, presetValue);
            deliverError(resultCallback, result, "astera_capture_preset_invalid");
            return;
        }

        synchronized (lock) {
            cancelLocked();
            final int thisEpoch = ++epoch;
            callback = resultCallback;
            activeAddress = target;
            activePreset = preset;
            attempt = 0;
            eventTimeline = new JSONArray();
            activeResult = base(target, preset.name());
            put("captureRevision", AsteraBtbCapturedFrames.CAPTURE_REVISION);
            put("serviceUuid", AsteraBtbCapturedFrames.SERVICE_UUID.toString());
            put("characteristicUuid", AsteraBtbCapturedFrames.WRITE_UUID.toString());
            put("writeType", "WRITE_WITHOUT_RESPONSE");
            put("protocolGeneralized", false);

            if (!BluetoothAdapter.checkBluetoothAddress(target)) {
                finishError("ble_gatt_bad_address");
                return;
            }

            int boundedTimeout = Math.max(8000, Math.min(20000, timeoutMs));
            deadlineMs = System.currentTimeMillis() + boundedTimeout;
            put("timeoutMs", boundedTimeout);
            appendEvent("replay_start", "timeoutMs", boundedTimeout);

            timeoutRunnable = () -> {
                synchronized (lock) {
                    if (thisEpoch == epoch && callback != null) {
                        finishError("astera_capture_timeout");
                    }
                }
            };
            handler.postDelayed(timeoutRunnable, boundedTimeout);
            connectAttemptLocked();
        }
    }

    private void connectAttemptLocked() {
        if (callback == null) return;
        if (System.currentTimeMillis() >= deadlineMs) {
            finishError("astera_capture_timeout");
            return;
        }

        BluetoothManager manager =
            (BluetoothManager) context.getSystemService(Context.BLUETOOTH_SERVICE);
        BluetoothAdapter adapter = manager == null ? null : manager.getAdapter();
        if (adapter == null) {
            finishError("bluetooth_unavailable");
            return;
        }
        if (!adapter.isEnabled()) {
            finishError("bluetooth_disabled");
            return;
        }

        closeGattOnlyLocked();
        attempt++;
        final int thisAttempt = attempt;
        put("connectAttempts", attempt);
        appendEvent("connect_attempt", "attempt", thisAttempt);

        final BluetoothDevice device;
        try {
            device = adapter.getRemoteDevice(activeAddress);
            String name = device.getName();
            put("deviceName", name == null ? "" : name);
            put("bondState", device.getBondState());
        } catch (SecurityException e) {
            finishError("ble_permission_denied");
            return;
        } catch (Exception e) {
            finishError("ble_gatt_bad_address");
            return;
        }

        final int thisEpoch = epoch;
        BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
            @Override public void onConnectionStateChange(
                BluetoothGatt gatt,
                int status,
                int newState
            ) {
                synchronized (lock) {
                    if (thisEpoch != epoch || gatt != activeGatt || callback == null) return;
                    put("connectionStatus", status);
                    put("connectionState", newState);
                    appendEvent(
                        "connection_state",
                        "attempt", thisAttempt,
                        "status", status,
                        "newState", newState
                    );

                    if (status != BluetoothGatt.GATT_SUCCESS) {
                        retryOrFailLocked(
                            status,
                            "astera_capture_connect_status_" + status
                        );
                        return;
                    }

                    if (newState == BluetoothProfile.STATE_CONNECTED) {
                        handler.postDelayed(() -> {
                            synchronized (lock) {
                                if (thisEpoch != epoch ||
                                    gatt != activeGatt ||
                                    callback == null) return;
                                boolean started;
                                try { started = gatt.discoverServices(); }
                                catch (Exception e) { started = false; }
                                appendEvent(
                                    "service_discovery_start",
                                    "attempt", thisAttempt,
                                    "started", started
                                );
                                if (!started) {
                                    retryOrFailLocked(
                                        -1,
                                        "astera_capture_service_discovery_start_failed"
                                    );
                                }
                            }
                        }, 300L);
                    } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                        retryOrFailLocked(
                            -1,
                            "astera_capture_disconnected"
                        );
                    }
                }
            }

            @Override public void onServicesDiscovered(
                BluetoothGatt gatt,
                int status
            ) {
                synchronized (lock) {
                    if (thisEpoch != epoch || gatt != activeGatt || callback == null) return;
                    put("serviceDiscoveryStatus", status);
                    appendEvent(
                        "services_discovered",
                        "attempt", thisAttempt,
                        "status", status
                    );
                    if (status != BluetoothGatt.GATT_SUCCESS) {
                        retryOrFailLocked(
                            status,
                            "astera_capture_service_discovery_status_" + status
                        );
                        return;
                    }

                    BluetoothGattService service =
                        gatt.getService(AsteraBtbCapturedFrames.SERVICE_UUID);
                    if (service == null) {
                        finishError("astera_capture_service_missing");
                        return;
                    }

                    BluetoothGattCharacteristic characteristic =
                        service.getCharacteristic(AsteraBtbCapturedFrames.WRITE_UUID);
                    if (characteristic == null) {
                        finishError("astera_capture_characteristic_missing");
                        return;
                    }

                    int properties = characteristic.getProperties();
                    if ((properties &
                        BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE) == 0) {
                        finishError("astera_capture_characteristic_not_write_nr");
                        return;
                    }

                    byte[] frame = AsteraBtbCapturedFrames.frameFor(activePreset);
                    if (!AsteraBtbCapturedFrames.isValidFrame(frame)) {
                        finishError("astera_capture_frame_crc_invalid");
                        return;
                    }

                    put("preset", activePreset.name());
                    put("frame", AsteraBtbCapturedFrames.hexFor(activePreset));
                    int[] rgb = AsteraBtbCapturedFrames.capturedRgb(activePreset);
                    put("capturedRed", rgb[0]);
                    put("capturedGreen", rgb[1]);
                    put("capturedBlue", rgb[2]);
                    put("characteristicProperties", properties);

                    boolean started;
                    int startStatus = 0;
                    try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            startStatus = gatt.writeCharacteristic(
                                characteristic,
                                frame,
                                BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
                            );
                            started = startStatus == 0;
                        } else {
                            characteristic.setWriteType(
                                BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE);
                            characteristic.setValue(frame);
                            started = gatt.writeCharacteristic(characteristic);
                            startStatus = started ? 0 : -1;
                        }
                    } catch (SecurityException e) {
                        finishError("ble_permission_denied");
                        return;
                    } catch (Exception e) {
                        finishError("astera_capture_write_exception");
                        return;
                    }

                    put("writeStartStatus", startStatus);
                    put("writeStarted", started);
                    appendEvent(
                        "write_start",
                        "attempt", thisAttempt,
                        "started", started,
                        "status", startStatus
                    );
                    if (!started) {
                        finishError(
                            "astera_capture_write_start_failed_" + startStatus);
                        return;
                    }

                    fallbackSuccessRunnable = () -> {
                        synchronized (lock) {
                            if (thisEpoch != epoch || callback == null) return;
                            put("writeCallbackObserved", false);
                            finishSuccess();
                        }
                    };
                    handler.postDelayed(fallbackSuccessRunnable, 800L);
                }
            }

            @Override public void onCharacteristicWrite(
                BluetoothGatt gatt,
                BluetoothGattCharacteristic characteristic,
                int status
            ) {
                synchronized (lock) {
                    if (thisEpoch != epoch ||
                        gatt != activeGatt ||
                        callback == null ||
                        characteristic == null ||
                        !AsteraBtbCapturedFrames.WRITE_UUID.equals(
                            characteristic.getUuid())) return;

                    if (fallbackSuccessRunnable != null) {
                        handler.removeCallbacks(fallbackSuccessRunnable);
                        fallbackSuccessRunnable = null;
                    }
                    put("writeCallbackObserved", true);
                    put("writeCallbackStatus", status);
                    appendEvent(
                        "write_callback",
                        "attempt", thisAttempt,
                        "status", status
                    );
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        finishSuccess();
                    } else {
                        finishError("astera_capture_write_status_" + status);
                    }
                }
            }
        };

        try {
            activeGatt = device.connectGatt(
                context,
                false,
                gattCallback,
                BluetoothDevice.TRANSPORT_LE
            );
            if (activeGatt == null) {
                retryOrFailLocked(
                    -1,
                    "astera_capture_connect_start_failed"
                );
            }
        } catch (SecurityException e) {
            finishError("ble_permission_denied");
        } catch (Exception e) {
            retryOrFailLocked(
                -1,
                "astera_capture_connect_start_failed"
            );
        }
    }

    private void retryOrFailLocked(int status, String code) {
        appendEvent(
            "retry_or_fail",
            "attempt", attempt,
            "status", status,
            "code", code
        );
        closeGattOnlyLocked();

        long remaining = deadlineMs - System.currentTimeMillis();
        if (callback != null &&
            attempt < MAX_ATTEMPTS &&
            remaining > 2000L) {
            long delay;
            if (status == 19) {
                delay = 1800L;
            } else if (status == 133) {
                delay = 2200L;
            } else {
                delay = attempt == 1 ? 700L : 1200L;
            }

            if (remaining <= delay + 1000L) {
                finishError(code);
                return;
            }

            appendEvent(
                "retry_scheduled",
                "attempt", attempt + 1,
                "delayMs", delay,
                "status", status
            );
            final int retryEpoch = epoch;
            retryRunnable = () -> {
                synchronized (lock) {
                    retryRunnable = null;
                    if (retryEpoch != epoch || callback == null) return;
                    connectAttemptLocked();
                }
            };
            handler.postDelayed(retryRunnable, delay);
            return;
        }

        finishError(code);
    }

    public void cancel() {
        synchronized (lock) {
            cancelLocked();
            epoch++;
        }
    }

    private JSONObject base(String address, String preset) {
        JSONObject out = new JSONObject();
        try {
            out.put("address", address == null ? "" : address);
            out.put("preset", preset == null ? "" : preset);
            out.put("kind", "LightingAI-Astera-BTB-captured-color-replay");
        } catch (Exception ignored) {}
        return out;
    }

    private void appendEvent(String type, Object... keyValues) {
        if (eventTimeline == null) return;
        try {
            JSONObject event = new JSONObject();
            event.put("type", type);
            event.put("atMs", System.currentTimeMillis());
            for (int i = 0; i + 1 < keyValues.length; i += 2) {
                event.put(String.valueOf(keyValues[i]), keyValues[i + 1]);
            }
            eventTimeline.put(event);
            if (activeResult != null) {
                activeResult.put("eventTimeline", eventTimeline);
            }
        } catch (Exception ignored) {}
    }

    private void put(String key, Object value) {
        try {
            if (activeResult != null) activeResult.put(key, value);
        } catch (Exception ignored) {}
    }

    private void finishSuccess() {
        Callback resultCallback = callback;
        JSONObject result = copy(activeResult);
        cleanup();
        epoch++;
        if (resultCallback != null) resultCallback.onComplete(result);
    }

    private void finishError(String code) {
        put("error", code);
        Callback resultCallback = callback;
        JSONObject result = copy(activeResult);
        cleanup();
        epoch++;
        if (resultCallback != null) resultCallback.onError(result, code);
    }

    private void cancelLocked() {
        cleanup();
    }

    private void closeGattOnlyLocked() {
        BluetoothGatt gatt = activeGatt;
        activeGatt = null;
        if (gatt != null) {
            try { gatt.disconnect(); } catch (Exception ignored) {}
            try { gatt.close(); } catch (Exception ignored) {}
        }
    }

    private void cleanup() {
        if (timeoutRunnable != null) {
            handler.removeCallbacks(timeoutRunnable);
            timeoutRunnable = null;
        }
        if (fallbackSuccessRunnable != null) {
            handler.removeCallbacks(fallbackSuccessRunnable);
            fallbackSuccessRunnable = null;
        }
        if (retryRunnable != null) {
            handler.removeCallbacks(retryRunnable);
            retryRunnable = null;
        }
        closeGattOnlyLocked();
        callback = null;
        activeResult = null;
        eventTimeline = null;
        activeAddress = "";
        activePreset = null;
        deadlineMs = 0L;
        attempt = 0;
    }

    private static void deliverError(
        Callback callback,
        JSONObject result,
        String code
    ) {
        if (callback == null) return;
        try { result.put("error", code); } catch (Exception ignored) {}
        callback.onError(result, code);
    }

    private static JSONObject copy(JSONObject value) {
        try {
            return value == null
                ? new JSONObject()
                : new JSONObject(value.toString());
        } catch (Exception e) {
            return new JSONObject();
        }
    }
}
