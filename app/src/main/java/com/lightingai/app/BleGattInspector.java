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
import android.os.Handler;
import android.os.Looper;
import org.json.JSONArray;
import org.json.JSONObject;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public final class BleGattInspector {
    public interface Callback {
        void onComplete(JSONObject result);
        void onError(String code);
    }

    private static final int MAX_ATTEMPTS = 3;
    private final Context context;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Object lock = new Object();

    private BluetoothGatt activeGatt;
    private Runnable timeoutRunnable;
    private Runnable retryRunnable;
    private Callback callback;
    private int inspectionEpoch = 0;
    private String activeAddress = "";
    private long deadlineMs = 0L;
    private int attempt = 0;
    private JSONObject activeProfile;
    private final List<BluetoothGattCharacteristic> readable = new ArrayList<>();
    private final JSONArray readValues = new JSONArray();
    private int readIndex = 0;
    private BluetoothGattCharacteristic activeRead;

    public BleGattInspector(Context context) {
        this.context = context.getApplicationContext();
    }

    @SuppressLint("MissingPermission")
    public void inspect(String address, int timeoutMs, Callback resultCallback) {
        final String target = address == null ? "" : address.trim();
        final int boundedTimeout = Math.max(4000, Math.min(20000, timeoutMs));
        synchronized (lock) {
            cancelLocked();
            final int thisInspectionEpoch = ++inspectionEpoch;
            callback = resultCallback;
            activeAddress = target;
            deadlineMs = System.currentTimeMillis() + boundedTimeout;
            attempt = 0;
            if (!BluetoothAdapter.checkBluetoothAddress(target)) {
                finishErrorLocked("ble_gatt_bad_address");
                return;
            }
            timeoutRunnable = () -> {
                synchronized (lock) {
                    if (thisInspectionEpoch != inspectionEpoch || callback == null) return;
                    finishErrorLocked("ble_gatt_timeout");
                }
            };
            handler.postDelayed(timeoutRunnable, boundedTimeout);
            connectAttemptLocked();
        }
    }

    public void cancel() {
        synchronized (lock) {
            cancelLocked();
        }
    }

    @SuppressLint("MissingPermission")
    private void connectAttemptLocked() {
        if (callback == null) return;
        if (System.currentTimeMillis() >= deadlineMs) {
            finishErrorLocked("ble_gatt_timeout");
            return;
        }

        BluetoothManager manager = (BluetoothManager) context.getSystemService(Context.BLUETOOTH_SERVICE);
        BluetoothAdapter adapter = manager == null ? null : manager.getAdapter();
        if (adapter == null) {
            finishErrorLocked("bluetooth_unavailable");
            return;
        }
        if (!adapter.isEnabled()) {
            finishErrorLocked("bluetooth_disabled");
            return;
        }

        closeGattOnlyLocked();
        attempt++;
        final int thisAttempt = attempt;
        final BluetoothDevice device;
        try {
            device = adapter.getRemoteDevice(activeAddress);
        } catch (Exception e) {
            finishErrorLocked("ble_gatt_bad_address");
            return;
        }

        BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
            @Override public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                synchronized (lock) {
                    if (gatt != activeGatt || callback == null) return;
                    if (status != BluetoothGatt.GATT_SUCCESS) {
                        retryOrFailLocked("ble_gatt_connect_status_" + status + "_attempt_" + thisAttempt);
                        return;
                    }
                    if (newState == BluetoothProfile.STATE_CONNECTED) {
                        handler.postDelayed(() -> {
                            synchronized (lock) {
                                if (gatt != activeGatt || callback == null) return;
                                boolean started;
                                try { started = gatt.discoverServices(); }
                                catch (Exception e) { started = false; }
                                if (!started) retryOrFailLocked("ble_gatt_service_discovery_start_failed_attempt_" + thisAttempt);
                            }
                        }, 250);
                    } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                        retryOrFailLocked("ble_gatt_disconnected_attempt_" + thisAttempt);
                    }
                }
            }

            @Override public void onServicesDiscovered(BluetoothGatt gatt, int status) {
                synchronized (lock) {
                    if (gatt != activeGatt || callback == null) return;
                    if (status != BluetoothGatt.GATT_SUCCESS) {
                        retryOrFailLocked("ble_gatt_service_discovery_status_" + status + "_attempt_" + thisAttempt);
                        return;
                    }
                    try {
                        JSONObject out = new JSONObject();
                        out.put("address", activeAddress);
                        out.put("connectAttempts", thisAttempt);
                        try {
                            BluetoothDevice remote = gatt.getDevice();
                            out.put("bondState", remote == null ? BluetoothDevice.BOND_NONE : remote.getBondState());
                            String remoteName = remote == null ? "" : remote.getName();
                            out.put("deviceName", remoteName == null ? "" : remoteName);
                        } catch (Exception ignored) {
                            out.put("bondState", BluetoothDevice.BOND_NONE);
                            out.put("deviceName", "");
                        }
                        JSONArray services = new JSONArray();
                        readable.clear();
                        while (readValues.length() > 0) readValues.remove(readValues.length() - 1);

                        for (BluetoothGattService service : gatt.getServices()) {
                            if (service == null) continue;
                            JSONObject serviceJson = new JSONObject();
                            serviceJson.put("uuid", String.valueOf(service.getUuid()));
                            serviceJson.put("type", service.getType());
                            JSONArray characteristics = new JSONArray();
                            for (BluetoothGattCharacteristic characteristic : service.getCharacteristics()) {
                                if (characteristic == null) continue;
                                JSONObject characteristicJson = new JSONObject();
                                characteristicJson.put("uuid", String.valueOf(characteristic.getUuid()));
                                int properties = characteristic.getProperties();
                                characteristicJson.put("properties", properties);
                                characteristicJson.put("permissions", characteristic.getPermissions());
                                characteristicJson.put("readable", (properties & BluetoothGattCharacteristic.PROPERTY_READ) != 0);
                                characteristicJson.put("writable", (properties & BluetoothGattCharacteristic.PROPERTY_WRITE) != 0);
                                characteristicJson.put("writeNoResponse", (properties & BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE) != 0);
                                characteristicJson.put("notifiable", (properties & BluetoothGattCharacteristic.PROPERTY_NOTIFY) != 0);
                                characteristicJson.put("indicatable", (properties & BluetoothGattCharacteristic.PROPERTY_INDICATE) != 0);
                                JSONArray descriptors = new JSONArray();
                                for (BluetoothGattDescriptor descriptor : characteristic.getDescriptors()) {
                                    if (descriptor == null) continue;
                                    JSONObject descriptorJson = new JSONObject();
                                    descriptorJson.put("uuid", String.valueOf(descriptor.getUuid()));
                                    descriptorJson.put("permissions", descriptor.getPermissions());
                                    descriptors.put(descriptorJson);
                                }
                                characteristicJson.put("descriptors", descriptors);
                                characteristics.put(characteristicJson);
                                if ((properties & BluetoothGattCharacteristic.PROPERTY_READ) != 0) {
                                    readable.add(characteristic);
                                }
                            }
                            serviceJson.put("characteristics", characteristics);
                            services.put(serviceJson);
                        }

                        out.put("services", services);
                        out.put("serviceCount", services.length());
                        activeProfile = out;
                        readIndex = 0;
                        activeRead = null;
                        readNextLocked(gatt);
                    } catch (Exception e) {
                        finishErrorLocked("ble_gatt_result_encode_failed");
                    }
                }
            }

            @Override public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
                synchronized (lock) {
                    byte[] value = characteristic == null ? null : characteristic.getValue();
                    handleReadLocked(gatt, characteristic, value, status);
                }
            }

            @Override public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, byte[] value, int status) {
                synchronized (lock) {
                    handleReadLocked(gatt, characteristic, value, status);
                }
            }
        };

        try {
            activeGatt = device.connectGatt(context, false, gattCallback, BluetoothDevice.TRANSPORT_LE);
            if (activeGatt == null) retryOrFailLocked("ble_gatt_connect_start_failed_attempt_" + thisAttempt);
        } catch (Exception e) {
            activeGatt = null;
            retryOrFailLocked("ble_gatt_connect_start_failed_attempt_" + thisAttempt);
        }
    }

    @SuppressLint("MissingPermission")
    private void retryOrFailLocked(String code) {
        closeGattOnlyLocked();
        long remaining = deadlineMs - System.currentTimeMillis();
        if (callback != null && attempt < MAX_ATTEMPTS && remaining > 1500L) {
            long delay = attempt == 1 ? 500L : 1000L;
            final int retryEpoch = inspectionEpoch;
            retryRunnable = () -> {
                synchronized (lock) {
                    retryRunnable = null;
                    if (retryEpoch != inspectionEpoch || callback == null) return;
                    connectAttemptLocked();
                }
            };
            handler.postDelayed(retryRunnable, delay);
            return;
        }
        finishErrorLocked(code);
    }

    @SuppressLint("MissingPermission")
    private void readNextLocked(BluetoothGatt gatt) {
        if (gatt != activeGatt || callback == null) return;
        while (readIndex < readable.size()) {
            BluetoothGattCharacteristic characteristic = readable.get(readIndex);
            try {
                if (gatt.readCharacteristic(characteristic)) {
                    activeRead = characteristic;
                    return;
                }
                appendRead(characteristic, null, -1, "read_start_failed");
            } catch (Exception e) {
                appendRead(characteristic, null, -1, "read_exception");
            }
            readIndex++;
        }

        try {
            if (activeProfile == null) activeProfile = new JSONObject();
            activeProfile.put("readValues", readValues);
        } catch (Exception ignored) {}
        finishSuccessLocked(activeProfile);
    }

    private void handleReadLocked(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, byte[] value, int status) {
        if (gatt != activeGatt || callback == null || characteristic == null) return;
        if (activeRead != characteristic) return;
        appendRead(characteristic, value, status, status == BluetoothGatt.GATT_SUCCESS ? "" : "read_status_" + status);
        activeRead = null;
        readIndex++;
        readNextLocked(gatt);
    }

    private void appendRead(BluetoothGattCharacteristic characteristic, byte[] value, int status, String error) {
        try {
            JSONObject item = new JSONObject();
            BluetoothGattService service = characteristic == null ? null : characteristic.getService();
            item.put("serviceUuid", service == null || service.getUuid() == null ? "" : service.getUuid().toString());
            item.put("uuid", characteristic == null || characteristic.getUuid() == null ? "" : characteristic.getUuid().toString());
            item.put("status", status);
            item.put("hex", hex(value));
            String text = printableAscii(value);
            if (!text.isEmpty()) item.put("text", text);
            if (error != null && !error.isEmpty()) item.put("error", error);
            readValues.put(item);
        } catch (Exception ignored) {}
    }

    private static String hex(byte[] data) {
        if (data == null || data.length == 0) return "";
        StringBuilder out = new StringBuilder(data.length * 2);
        for (byte b : data) out.append(String.format(java.util.Locale.US, "%02X", b & 0xff));
        return out.toString();
    }

    private static String printableAscii(byte[] data) {
        if (data == null || data.length == 0) return "";
        String text;
        try { text = new String(data, StandardCharsets.UTF_8); }
        catch (Exception e) { return ""; }
        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);
            if (ch < 0x20 || ch > 0x7e) return "";
        }
        return text;
    }

    @SuppressLint("MissingPermission")
    private void finishSuccessLocked(JSONObject result) {
        Callback cb = callback;
        callback = null;
        cancelTimersLocked();
        closeGattOnlyLocked();
        clearReadState();
        activeAddress = "";
        if (cb != null) cb.onComplete(result == null ? new JSONObject() : result);
    }

    @SuppressLint("MissingPermission")
    private void finishErrorLocked(String code) {
        Callback cb = callback;
        callback = null;
        cancelTimersLocked();
        closeGattOnlyLocked();
        clearReadState();
        activeAddress = "";
        if (cb != null) cb.onError(code == null ? "ble_gatt_failed" : code);
    }

    @SuppressLint("MissingPermission")
    private void cancelLocked() {
        inspectionEpoch++;
        callback = null;
        cancelTimersLocked();
        closeGattOnlyLocked();
        clearReadState();
        activeAddress = "";
    }

    private void cancelTimersLocked() {
        if (timeoutRunnable != null) {
            handler.removeCallbacks(timeoutRunnable);
            timeoutRunnable = null;
        }
        if (retryRunnable != null) {
            handler.removeCallbacks(retryRunnable);
            retryRunnable = null;
        }
    }

    @SuppressLint("MissingPermission")
    private void closeGattOnlyLocked() {
        BluetoothGatt gatt = activeGatt;
        activeGatt = null;
        if (gatt != null) {
            try { gatt.disconnect(); } catch (Exception ignored) {}
            try { gatt.close(); } catch (Exception ignored) {}
        }
    }

    private void clearReadState() {
        activeProfile = null;
        readable.clear();
        while (readValues.length() > 0) readValues.remove(readValues.length() - 1);
        readIndex = 0;
        activeRead = null;
    }
}
