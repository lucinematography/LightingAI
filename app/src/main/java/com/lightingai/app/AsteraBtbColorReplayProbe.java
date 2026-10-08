package com.lightingai.app;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import org.json.JSONArray;
import org.json.JSONObject;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@SuppressLint("MissingPermission")
public final class AsteraBtbColorReplayProbe {
    public interface Callback {
        void onComplete(JSONObject result);
        void onError(JSONObject result, String code);
    }

    private static final int MAX_ATTEMPTS = 3;
    private static final long POST_WRITE_OBSERVATION_MS = 3000L;
    private static final int MAX_NOTIFICATION_SAMPLES = 32;
    private static final UUID NOTIFY_UUID =
        UUID.fromString("0a6c6c72-9ca6-ffaf-3440-b2dae8c86a67");
    private static final UUID CCCD_UUID =
        UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");

    // Repeatedly observed on successful official AsteraApp sessions.
    // Deliberately excludes the longer session/config write because it contains
    // fields whose semantics may include device/session-specific material.
    private static final byte[] BOOT_WAKE = decodeHex("0A");
    private static final byte[] BOOT_S0 = "s0=0\n".getBytes(StandardCharsets.US_ASCII);
    private static final byte[] BOOT_S1002 = "s1002\n".getBytes(StandardCharsets.US_ASCII);
    private static final byte[] BOOT_STATUS =
        decodeHex("0A038D041E8312");
    private static final byte[] BOOT_RADIO =
        decodeHex("0A068804000000018853");
    private static final byte[] BOOT_STAGE =
        decodeHex("0A057F932700020A0A09");
    private static final byte[] BOOT_POLL =
        decodeHex("0A017FC041");

    private final Context context;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Object lock = new Object();
    private final List<Runnable> scheduledWrites = new ArrayList<>();

    private BluetoothGatt activeGatt;
    private boolean gattConnected = false;
    private Runnable timeoutRunnable;
    private Runnable retryRunnable;
    private Runnable fallbackSuccessRunnable;
    private Callback callback;
    private JSONObject activeResult;
    private JSONArray eventTimeline;
    private int epoch = 0;
    private int attempt = 0;
    private long deadlineMs = 0L;
    private String activeAddress = "";
    private AsteraBtbCapturedFrames.Preset activePreset;
    private BluetoothGattCharacteristic writeCharacteristic;
    private BluetoothGattCharacteristic notifyCharacteristic;
    private BluetoothGattDescriptor activeCccd;
    private boolean finalColorWriteStarted = false;
    private int notificationCount = 0;
    private int postColorNotificationCount = 0;
    private final JSONArray notificationSamples = new JSONArray();

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
            put("bootstrapRevision", "2026-10-07-public-safe-stage-a");
            put("bootstrapUsesPrivateSessionFields", false);
            put("serviceUuid", AsteraBtbCapturedFrames.SERVICE_UUID.toString());
            put("characteristicUuid", AsteraBtbCapturedFrames.WRITE_UUID.toString());
            put("notifyUuid", NOTIFY_UUID.toString());
            put("writeType", "WRITE_WITHOUT_RESPONSE");
            put("protocolGeneralized", false);
            put("deviceAppliedColorVerified", false);
            put("resultScope", "Android BLE write submission only; no fixture color acknowledgement");
            put("postWriteObservationMs", POST_WRITE_OBSERVATION_MS);
            notificationCount = 0;
            postColorNotificationCount = 0;
            while (notificationSamples.length() > 0) notificationSamples.remove(0);
            put("notificationCount", 0);
            put("postColorNotificationCount", 0);
            put("notificationSamples", notificationSamples);

            if (!BluetoothAdapter.checkBluetoothAddress(target)) {
                finishError("ble_gatt_bad_address");
                return;
            }

            int boundedTimeout = Math.max(12000, Math.min(24000, timeoutMs));
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

        clearScheduledWritesLocked();
        closeGattOnlyLocked();
        writeCharacteristic = null;
        notifyCharacteristic = null;
        activeCccd = null;
        finalColorWriteStarted = false;

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
                    gattConnected = status == BluetoothGatt.GATT_SUCCESS &&
                        newState == BluetoothProfile.STATE_CONNECTED;
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
                        if (finalColorWriteStarted) {
                            put("disconnectedDuringPostWriteObservation", true);
                            appendEvent("post_color_disconnected", "attempt", thisAttempt);
                            finishError("astera_capture_disconnected_after_write");
                        } else {
                            retryOrFailLocked(-1, "astera_capture_disconnected");
                        }
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

                    writeCharacteristic =
                        service.getCharacteristic(AsteraBtbCapturedFrames.WRITE_UUID);
                    notifyCharacteristic = service.getCharacteristic(NOTIFY_UUID);
                    if (writeCharacteristic == null) {
                        finishError("astera_capture_characteristic_missing");
                        return;
                    }
                    if (notifyCharacteristic == null) {
                        finishError("astera_capture_notify_characteristic_missing");
                        return;
                    }

                    int writeProperties = writeCharacteristic.getProperties();
                    if ((writeProperties &
                        BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE) == 0) {
                        finishError("astera_capture_characteristic_not_write_nr");
                        return;
                    }
                    int notifyProperties = notifyCharacteristic.getProperties();
                    if ((notifyProperties &
                        BluetoothGattCharacteristic.PROPERTY_NOTIFY) == 0) {
                        finishError("astera_capture_notify_property_missing");
                        return;
                    }

                    put("characteristicProperties", writeProperties);
                    put("notifyProperties", notifyProperties);
                    boolean localEnabled;
                    try {
                        localEnabled =
                            gatt.setCharacteristicNotification(
                                notifyCharacteristic, true);
                    } catch (Exception e) {
                        localEnabled = false;
                    }
                    put("notificationLocalEnabled", localEnabled);
                    if (!localEnabled) {
                        finishError("astera_capture_notify_enable_failed");
                        return;
                    }

                    activeCccd = notifyCharacteristic.getDescriptor(CCCD_UUID);
                    if (activeCccd == null) {
                        finishError("astera_capture_cccd_missing");
                        return;
                    }

                    boolean descriptorStarted;
                    int descriptorStatus = 0;
                    try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            descriptorStatus = gatt.writeDescriptor(
                                activeCccd,
                                BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                            );
                            descriptorStarted = descriptorStatus == 0;
                        } else {
                            activeCccd.setValue(
                                BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
                            descriptorStarted = gatt.writeDescriptor(activeCccd);
                            descriptorStatus = descriptorStarted ? 0 : -1;
                        }
                    } catch (SecurityException e) {
                        finishError("ble_permission_denied");
                        return;
                    } catch (Exception e) {
                        finishError("astera_capture_cccd_write_exception");
                        return;
                    }
                    put("cccdWriteStartStatus", descriptorStatus);
                    appendEvent(
                        "cccd_write_start",
                        "attempt", thisAttempt,
                        "started", descriptorStarted,
                        "status", descriptorStatus
                    );
                    if (!descriptorStarted) {
                        finishError(
                            "astera_capture_cccd_write_start_failed_" +
                            descriptorStatus);
                    }
                }
            }

            @Override public void onDescriptorWrite(
                BluetoothGatt gatt,
                BluetoothGattDescriptor descriptor,
                int status
            ) {
                synchronized (lock) {
                    if (thisEpoch != epoch ||
                        gatt != activeGatt ||
                        callback == null ||
                        descriptor == null ||
                        activeCccd == null ||
                        !CCCD_UUID.equals(descriptor.getUuid())) return;

                    put("cccdWriteStatus", status);
                    appendEvent(
                        "cccd_write_result",
                        "attempt", thisAttempt,
                        "status", status
                    );
                    if (status != BluetoothGatt.GATT_SUCCESS) {
                        finishError("astera_capture_cccd_write_status_" + status);
                        return;
                    }
                    activeCccd = null;
                    startBootstrapLocked(gatt, thisEpoch, thisAttempt);
                }
            }

            @Override public void onCharacteristicChanged(
                BluetoothGatt gatt,
                BluetoothGattCharacteristic characteristic,
                byte[] value
            ) {
                synchronized (lock) {
                    if (thisEpoch != epoch ||
                        gatt != activeGatt ||
                        callback == null ||
                        characteristic == null ||
                        !NOTIFY_UUID.equals(characteristic.getUuid())) return;
                    notificationCount++;
                    put("notificationCount", notificationCount);
                    if (finalColorWriteStarted) {
                        postColorNotificationCount++;
                        put("postColorNotificationCount", postColorNotificationCount);
                    }
                    if (notificationSamples.length() < MAX_NOTIFICATION_SAMPLES) {
                        JSONObject sample = new JSONObject();
                        try {
                            sample.put("atMs", System.currentTimeMillis());
                            sample.put("attempt", thisAttempt);
                            sample.put("afterColorWrite", finalColorWriteStarted);
                            sample.put("length", value == null ? 0 : value.length);
                            sample.put("hexFirst128Bytes", hexFirstBytes(value, 128));
                            sample.put("truncated", value != null && value.length > 128);
                            notificationSamples.put(sample);
                        } catch (Exception ignored) {}
                    } else {
                        put("notificationSamplesLimitReached", true);
                    }
                    appendEvent(
                        "notification",
                        "attempt", thisAttempt,
                        "length", value == null ? 0 : value.length,
                        "afterColorWrite", finalColorWriteStarted
                    );
                }
            }

            @Override @SuppressWarnings("deprecation")
            public void onCharacteristicChanged(
                BluetoothGatt gatt,
                BluetoothGattCharacteristic characteristic
            ) {
                byte[] value = characteristic == null
                    ? null
                    : characteristic.getValue();
                onCharacteristicChanged(gatt, characteristic, value);
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

                    appendEvent(
                        finalColorWriteStarted ? "color_write_callback" : "bootstrap_write_callback",
                        "attempt", thisAttempt,
                        "status", status
                    );

                    if (finalColorWriteStarted) {
                        // WRITE_WITHOUT_RESPONSE has no peripheral acknowledgement.
                        // A successful Android callback does not verify a changed color.
                        put("writeCallbackObserved", true);
                        put("writeCallbackStatus", status);
                        if (status != BluetoothGatt.GATT_SUCCESS) {
                            finishError("astera_capture_write_status_" + status);
                        }
                    } else if (status != BluetoothGatt.GATT_SUCCESS) {
                        finishError(
                            "astera_capture_bootstrap_write_status_" + status);
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
                retryOrFailLocked(-1, "astera_capture_connect_start_failed");
            }
        } catch (SecurityException e) {
            finishError("ble_permission_denied");
        } catch (Exception e) {
            retryOrFailLocked(-1, "astera_capture_connect_start_failed");
        }
    }

    private void startBootstrapLocked(
        BluetoothGatt gatt,
        int thisEpoch,
        int thisAttempt
    ) {
        scheduleWriteLocked(gatt, thisEpoch, thisAttempt, 150L, "wake", BOOT_WAKE, false);
        scheduleWriteLocked(gatt, thisEpoch, thisAttempt, 800L, "s0", BOOT_S0, false);
        scheduleWriteLocked(gatt, thisEpoch, thisAttempt, 950L, "s1002", BOOT_S1002, false);
        scheduleWriteLocked(gatt, thisEpoch, thisAttempt, 1800L, "status", BOOT_STATUS, false);
        scheduleWriteLocked(gatt, thisEpoch, thisAttempt, 2050L, "radio", BOOT_RADIO, false);
        scheduleWriteLocked(gatt, thisEpoch, thisAttempt, 3000L, "stage", BOOT_STAGE, false);
        scheduleWriteLocked(gatt, thisEpoch, thisAttempt, 3750L, "poll", BOOT_POLL, false);
        byte[] color = AsteraBtbCapturedFrames.frameFor(activePreset);
        scheduleWriteLocked(gatt, thisEpoch, thisAttempt, 4400L, "color", color, true);
    }

    private void scheduleWriteLocked(
        BluetoothGatt gatt,
        int thisEpoch,
        int thisAttempt,
        long delayMs,
        String label,
        byte[] value,
        boolean finalColor
    ) {
        final byte[] payload = value.clone();
        Runnable task = () -> {
            synchronized (lock) {
                scheduledWrites.removeIf(r -> r == null);
                if (thisEpoch != epoch ||
                    gatt != activeGatt ||
                    callback == null) return;
                if (!writeValueLocked(
                    gatt,
                    thisAttempt,
                    label,
                    payload,
                    finalColor
                )) return;
                if (finalColor) {
                    // Keep the connection open to capture short-lived responses.
                    // Completion still means Android accepted the write attempt,
                    // never that the fixture visibly applied the chosen color.
                    fallbackSuccessRunnable = () -> {
                        synchronized (lock) {
                            if (thisEpoch != epoch || callback == null) return;
                            appendEvent("post_write_observation_complete",
                                "notificationCount", notificationCount,
                                "postColorNotificationCount", postColorNotificationCount,
                                "writeCallbackObserved", activeResult != null &&
                                    activeResult.optBoolean("writeCallbackObserved", false));
                            finishSuccess();
                        }
                    };
                    handler.postDelayed(fallbackSuccessRunnable, POST_WRITE_OBSERVATION_MS);
                }
            }
        };
        scheduledWrites.add(task);
        handler.postDelayed(task, delayMs);
    }

    private boolean writeValueLocked(
        BluetoothGatt gatt,
        int thisAttempt,
        String label,
        byte[] value,
        boolean finalColor
    ) {
        if (writeCharacteristic == null) {
            finishError("astera_capture_characteristic_missing");
            return false;
        }

        boolean started;
        int startStatus = 0;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                startStatus = gatt.writeCharacteristic(
                    writeCharacteristic,
                    value,
                    BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE
                );
                started = startStatus == 0;
            } else {
                writeCharacteristic.setWriteType(
                    BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE);
                writeCharacteristic.setValue(value);
                started = gatt.writeCharacteristic(writeCharacteristic);
                startStatus = started ? 0 : -1;
            }
        } catch (SecurityException e) {
            finishError("ble_permission_denied");
            return false;
        } catch (Exception e) {
            finishError("astera_capture_write_exception");
            return false;
        }

        appendEvent(
            finalColor ? "color_write_start" : "bootstrap_write_start",
            "attempt", thisAttempt,
            "label", label,
            "length", value.length,
            "started", started,
            "status", startStatus
        );

        if (!started) {
            finishError(
                (finalColor
                    ? "astera_capture_write_start_failed_"
                    : "astera_capture_bootstrap_write_start_failed_") +
                startStatus);
            return false;
        }

        if (finalColor) {
            finalColorWriteStarted = true;
            put("preset", activePreset.name());
            put("frame", AsteraBtbCapturedFrames.hexFor(activePreset));
            int[] rgb = AsteraBtbCapturedFrames.capturedRgb(activePreset);
            put("capturedRed", rgb[0]);
            put("capturedGreen", rgb[1]);
            put("capturedBlue", rgb[2]);
            put("writeStartStatus", startStatus);
            put("writeStarted", true);
            put("writeCallbackObserved", false);
            put("deviceAppliedColorVerified", false);
        }
        return true;
    }

    private void retryOrFailLocked(int status, String code) {
        appendEvent(
            "retry_or_fail",
            "attempt", attempt,
            "status", status,
            "code", code
        );
        clearScheduledWritesLocked();
        closeGattOnlyLocked();

        long remaining = deadlineMs - System.currentTimeMillis();
        if (callback != null &&
            attempt < MAX_ATTEMPTS &&
            remaining > 5000L) {
            long delay;
            if (status == 19) {
                delay = 1800L;
            } else if (status == 133) {
                delay = 2200L;
            } else {
                delay = attempt == 1 ? 700L : 1200L;
            }

            if (remaining <= delay + 5500L) {
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

    private void clearScheduledWritesLocked() {
        for (Runnable task : scheduledWrites) {
            try { handler.removeCallbacks(task); } catch (Exception ignored) {}
        }
        scheduledWrites.clear();
    }

    private void closeGattOnlyLocked() {
        BluetoothGatt gatt = activeGatt;
        activeGatt = null;
        boolean wasConnected = gattConnected;
        gattConnected = false;
        if (gatt != null) {
            // Android status 133 is already a failed link: avoid a redundant disconnect.
            if (wasConnected) {
                try { gatt.disconnect(); } catch (Exception ignored) {}
            }
            try { gatt.close(); } catch (Exception ignored) {}
        }
    }

    private void cleanup() {
        if (timeoutRunnable != null) {
            handler.removeCallbacks(timeoutRunnable);
            timeoutRunnable = null;
        }
        if (retryRunnable != null) {
            handler.removeCallbacks(retryRunnable);
            retryRunnable = null;
        }
        if (fallbackSuccessRunnable != null) {
            handler.removeCallbacks(fallbackSuccessRunnable);
            fallbackSuccessRunnable = null;
        }
        clearScheduledWritesLocked();
        closeGattOnlyLocked();
        callback = null;
        activeResult = null;
        eventTimeline = null;
        activeAddress = "";
        activePreset = null;
        writeCharacteristic = null;
        notifyCharacteristic = null;
        activeCccd = null;
        finalColorWriteStarted = false;
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

    private static String hexFirstBytes(byte[] bytes, int limit) {
        if (bytes == null) return "";
        final char[] alphabet = "0123456789ABCDEF".toCharArray();
        int count = Math.min(bytes.length, limit);
        char[] result = new char[count * 2];
        for (int i = 0; i < count; i++) {
            int value = bytes[i] & 255;
            result[2 * i] = alphabet[value >>> 4];
            result[2 * i + 1] = alphabet[value & 15];
        }
        return new String(result);
    }

    private static byte[] decodeHex(String hex) {
        if (hex == null || (hex.length() & 1) != 0) {
            throw new IllegalArgumentException("invalid hex");
        }
        byte[] out = new byte[hex.length() / 2];
        for (int i = 0; i < out.length; i++) {
            int hi = Character.digit(hex.charAt(i * 2), 16);
            int lo = Character.digit(hex.charAt(i * 2 + 1), 16);
            if (hi < 0 || lo < 0) throw new IllegalArgumentException("invalid hex");
            out[i] = (byte) ((hi << 4) | lo);
        }
        return out;
    }
}
