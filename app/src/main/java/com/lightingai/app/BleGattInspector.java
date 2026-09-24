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
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanRecord;
import android.bluetooth.le.ScanResult;
import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;

import org.json.JSONArray;
import org.json.JSONObject;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Read-only BLE GATT profile inspector used by LightingAI Direct Control research.
 *
 * The inspector may rescan and retry a failed Android GATT connection, but it never
 * writes characteristics, enables notifications, bonds, provisions, or changes
 * fixture state.
 */
public final class BleGattInspector {
    public interface Callback {
        void onComplete(JSONObject profile);
        void onError(String code);
    }

    private static final int MAX_CONNECT_ATTEMPTS = 3;
    private static final int TARGET_SCAN_MS = 1800;

    private final Context context;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Object lock = new Object();

    private BluetoothGatt activeGatt;
    private BluetoothLeScanner activeScanner;
    private ScanCallback activeScanCallback;
    private Runnable timeoutRunnable;
    private Runnable scanFallbackRunnable;
    private Runnable retryRunnable;
    private Callback activeCallback;
    private String activeAddress = "";
    private String activeName = "";
    private long deadlineMs = 0L;
    private int connectAttempt = 0;
    private JSONObject activeProfile;
    private final List<BluetoothGattCharacteristic> readableCharacteristics = new ArrayList<>();
    private final JSONArray readValues = new JSONArray();
    private int readIndex = 0;
    private BluetoothGattCharacteristic activeReadCharacteristic;

    public BleGattInspector(Context context) {
        this.context = context.getApplicationContext();
    }

    @SuppressLint("MissingPermission")
    public void inspect(String address, String name, int timeoutMs, Callback callback) {
        final int boundedTimeout = Math.max(5000, Math.min(20000, timeoutMs));
        synchronized (lock) {
            finishLocked();
            activeCallback = callback;
            activeAddress = address == null ? "" : address.trim();
            activeName = name == null ? "" : name.trim();
            deadlineMs = System.currentTimeMillis() + boundedTimeout;
            connectAttempt = 0;

            if (activeAddress.isEmpty() && activeName.isEmpty()) {
                finishErrorLocked("ble_invalid_target");
                return;
            }

            BluetoothAdapter adapter = getAdapter();
            if (adapter == null) {
                finishErrorLocked("bluetooth_unavailable");
                return;
            }
            if (!adapter.isEnabled()) {
                finishErrorLocked("bluetooth_disabled");
                return;
            }

            timeoutRunnable = () -> {
                synchronized (lock) {
                    finishErrorLocked("ble_gatt_timeout");
                }
            };
            handler.postDelayed(timeoutRunnable, boundedTimeout);
            startTargetScanLocked();
        }
    }

    public void close() {
        synchronized (lock) {
            finishLocked();
        }
    }

    private BluetoothAdapter getAdapter() {
        BluetoothManager manager = (BluetoothManager) context.getSystemService(Context.BLUETOOTH_SERVICE);
        return manager == null ? null : manager.getAdapter();
    }

    @SuppressLint("MissingPermission")
    private void startTargetScanLocked() {
        if (activeCallback == null) return;
        if (System.currentTimeMillis() >= deadlineMs) {
            finishErrorLocked("ble_gatt_timeout");
            return;
        }

        stopScanLocked();
        closeGattLocked();

        BluetoothAdapter adapter = getAdapter();
        if (adapter == null || !adapter.isEnabled()) {
            finishErrorLocked(adapter == null ? "bluetooth_unavailable" : "bluetooth_disabled");
            return;
        }

        BluetoothLeScanner scanner = adapter.getBluetoothLeScanner();
        if (scanner == null) {
            connectByKnownAddressLocked();
            return;
        }

        activeScanner = scanner;
        activeScanCallback = new ScanCallback() {
            @Override public void onScanResult(int callbackType, ScanResult result) {
                synchronized (lock) {
                    if (activeScanCallback == null || result == null || result.getDevice() == null) return;
                    String address = "";
                    String name = "";
                    try { address = result.getDevice().getAddress(); } catch (Exception ignored) {}
                    try {
                        ScanRecord record = result.getScanRecord();
                        name = record == null ? "" : record.getDeviceName();
                        if (name == null || name.trim().isEmpty()) name = result.getDevice().getName();
                    } catch (Exception ignored) {}
                    if (!matchesTarget(address, name)) return;

                    BluetoothDevice target = result.getDevice();
                    stopScanLocked();
                    handler.postDelayed(() -> {
                        synchronized (lock) {
                            connectLocked(target);
                        }
                    }, 180);
                }
            }

            @Override public void onScanFailed(int errorCode) {
                synchronized (lock) {
                    stopScanLocked();
                    connectByKnownAddressLocked();
                }
            }
        };

        try {
            activeScanner.startScan(activeScanCallback);
        } catch (Exception e) {
            stopScanLocked();
            connectByKnownAddressLocked();
            return;
        }

        scanFallbackRunnable = () -> {
            synchronized (lock) {
                stopScanLocked();
                connectByKnownAddressLocked();
            }
        };
        handler.postDelayed(scanFallbackRunnable, TARGET_SCAN_MS);
    }

    private boolean matchesTarget(String address, String name) {
        String a = address == null ? "" : address.trim();
        String n = name == null ? "" : name.trim();
        if (!activeAddress.isEmpty() && activeAddress.equalsIgnoreCase(a)) return true;
        return !activeName.isEmpty() && activeName.equalsIgnoreCase(n);
    }

    @SuppressLint("MissingPermission")
    private void connectByKnownAddressLocked() {
        if (activeCallback == null) return;
        BluetoothAdapter adapter = getAdapter();
        if (adapter == null || !adapter.isEnabled()) {
            finishErrorLocked(adapter == null ? "bluetooth_unavailable" : "bluetooth_disabled");
            return;
        }
        if (activeAddress.isEmpty()) {
            retryOrFailLocked("ble_target_not_seen");
            return;
        }
        try {
            connectLocked(adapter.getRemoteDevice(activeAddress));
        } catch (Exception e) {
            retryOrFailLocked("ble_invalid_address");
        }
    }

    @SuppressLint("MissingPermission")
    private void connectLocked(BluetoothDevice device) {
        if (activeCallback == null || device == null) return;
        if (activeGatt != null) return;
        if (System.currentTimeMillis() >= deadlineMs) {
            finishErrorLocked("ble_gatt_timeout");
            return;
        }

        connectAttempt++;
        final int attemptNumber = connectAttempt;

        BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
            @Override
            public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                synchronized (lock) {
                    if (gatt != activeGatt) return;
                    if (status != BluetoothGatt.GATT_SUCCESS) {
                        retryOrFailLocked("ble_gatt_connect_" + status + "_attempt_" + attemptNumber);
                        return;
                    }
                    if (newState == BluetoothProfile.STATE_CONNECTED) {
                        handler.postDelayed(() -> {
                            synchronized (lock) {
                                if (gatt != activeGatt || activeCallback == null) return;
                                try {
                                    if (!gatt.discoverServices()) retryOrFailLocked("ble_gatt_discovery_start_failed_attempt_" + attemptNumber);
                                } catch (Exception e) {
                                    retryOrFailLocked("ble_gatt_discovery_start_failed_attempt_" + attemptNumber);
                                }
                            }
                        }, 350);
                    } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                        retryOrFailLocked("ble_gatt_disconnected_attempt_" + attemptNumber);
                    }
                }
            }

            @Override
            public void onServicesDiscovered(BluetoothGatt gatt, int status) {
                synchronized (lock) {
                    if (gatt != activeGatt) return;
                    if (status != BluetoothGatt.GATT_SUCCESS) {
                        retryOrFailLocked("ble_gatt_discovery_" + status + "_attempt_" + attemptNumber);
                        return;
                    }
                    JSONObject profile = buildProfile(gatt);
                    try {
                        profile.put("connectAttempts", attemptNumber);
                        profile.put("targetName", activeName);
                    } catch (Exception ignored) {}
                    beginReadableSnapshotLocked(gatt, profile);
                }
            }

            @Override
            public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
                synchronized (lock) {
                    byte[] value = characteristic == null ? null : characteristic.getValue();
                    handleCharacteristicReadLocked(gatt, characteristic, value, status);
                }
            }

            @Override
            public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, byte[] value, int status) {
                synchronized (lock) {
                    handleCharacteristicReadLocked(gatt, characteristic, value, status);
                }
            }
        };

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                activeGatt = device.connectGatt(context, false, gattCallback, BluetoothDevice.TRANSPORT_LE);
            } else {
                activeGatt = device.connectGatt(context, false, gattCallback);
            }
        } catch (Exception e) {
            activeGatt = null;
            retryOrFailLocked("ble_gatt_connect_failed_attempt_" + attemptNumber);
            return;
        }

        if (activeGatt == null) retryOrFailLocked("ble_gatt_connect_failed_attempt_" + attemptNumber);
    }

    private void retryOrFailLocked(String lastCode) {
        closeGattLocked();
        stopScanLocked();

        long remaining = deadlineMs - System.currentTimeMillis();
        if (activeCallback != null && connectAttempt < MAX_CONNECT_ATTEMPTS && remaining > 1800L) {
            long delay = connectAttempt == 1 ? 550L : 1100L;
            retryRunnable = () -> {
                synchronized (lock) {
                    retryRunnable = null;
                    startTargetScanLocked();
                }
            };
            handler.postDelayed(retryRunnable, delay);
            return;
        }
        finishErrorLocked(lastCode);
    }


    @SuppressLint("MissingPermission")
    private void beginReadableSnapshotLocked(BluetoothGatt gatt, JSONObject profile) {
        activeProfile = profile;
        readableCharacteristics.clear();
        while (readValues.length() > 0) readValues.remove(readValues.length() - 1);
        readIndex = 0;
        activeReadCharacteristic = null;

        List<BluetoothGattService> services = gatt == null ? null : gatt.getServices();
        if (services != null) {
            for (BluetoothGattService service : services) {
                if (service == null || service.getCharacteristics() == null) continue;
                for (BluetoothGattCharacteristic characteristic : service.getCharacteristics()) {
                    if (characteristic == null) continue;
                    if ((characteristic.getProperties() & BluetoothGattCharacteristic.PROPERTY_READ) != 0) {
                        readableCharacteristics.add(characteristic);
                    }
                }
            }
        }
        readNextCharacteristicLocked(gatt);
    }

    @SuppressLint("MissingPermission")
    private void readNextCharacteristicLocked(BluetoothGatt gatt) {
        if (gatt != activeGatt || activeCallback == null) return;
        while (readIndex < readableCharacteristics.size()) {
            BluetoothGattCharacteristic characteristic = readableCharacteristics.get(readIndex);
            try {
                if (gatt.readCharacteristic(characteristic)) {
                    activeReadCharacteristic = characteristic;
                    return;
                }
                appendReadValue(characteristic, null, -1, "read_start_failed");
            } catch (Exception e) {
                appendReadValue(characteristic, null, -1, "read_exception");
            }
            readIndex++;
        }

        try {
            if (activeProfile == null) activeProfile = new JSONObject();
            activeProfile.put("readValues", readValues);
        } catch (Exception ignored) {}
        finishSuccessLocked(activeProfile);
    }

    private void handleCharacteristicReadLocked(
        BluetoothGatt gatt,
        BluetoothGattCharacteristic characteristic,
        byte[] value,
        int status
    ) {
        if (gatt != activeGatt || activeCallback == null || characteristic == null) return;
        if (activeReadCharacteristic != characteristic) return;
        appendReadValue(characteristic, value, status, status == BluetoothGatt.GATT_SUCCESS ? "" : "read_status_" + status);
        activeReadCharacteristic = null;
        readIndex++;
        readNextCharacteristicLocked(gatt);
    }

    private void appendReadValue(
        BluetoothGattCharacteristic characteristic,
        byte[] value,
        int status,
        String error
    ) {
        try {
            JSONObject item = new JSONObject();
            BluetoothGattService service = characteristic == null ? null : characteristic.getService();
            item.put("serviceUuid", service == null || service.getUuid() == null ? "" : service.getUuid().toString());
            item.put("uuid", characteristic == null || characteristic.getUuid() == null ? "" : characteristic.getUuid().toString());
            item.put("status", status);
            item.put("hex", toHex(value));
            String text = printableUtf8(value);
            if (!text.isEmpty()) item.put("text", text);
            if (error != null && !error.isEmpty()) item.put("error", error);
            readValues.put(item);
        } catch (Exception ignored) {}
    }

    private String toHex(byte[] value) {
        if (value == null || value.length == 0) return "";
        StringBuilder out = new StringBuilder(value.length * 2);
        for (byte b : value) out.append(String.format("%02x", b & 0xff));
        return out.toString();
    }

    private String printableUtf8(byte[] value) {
        if (value == null || value.length == 0) return "";
        String text;
        try {
            text = new String(value, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "";
        }
        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);
            if (ch < 0x20 || ch > 0x7e) return "";
        }
        return text;
    }

    private JSONObject buildProfile(BluetoothGatt gatt) {
        JSONObject root = new JSONObject();
        JSONArray servicesJson = new JSONArray();
        try {
            root.put("address", activeAddress);
            root.put("timestampMs", System.currentTimeMillis());
            BluetoothDevice device = gatt.getDevice();
            if (device != null) {
                int bondState = device.getBondState();
                root.put("bondState", bondState);
                root.put("bondStateName", bondState == BluetoothDevice.BOND_BONDED ? "BONDED" :
                    bondState == BluetoothDevice.BOND_BONDING ? "BONDING" : "NONE");
            }
            List<BluetoothGattService> services = gatt.getServices();
            if (services != null) {
                for (BluetoothGattService service : services) {
                    if (service == null) continue;
                    JSONObject serviceJson = new JSONObject();
                    serviceJson.put("uuid", service.getUuid() == null ? "" : service.getUuid().toString());
                    serviceJson.put("type", service.getType());
                    JSONArray characteristicsJson = new JSONArray();

                    List<BluetoothGattCharacteristic> characteristics = service.getCharacteristics();
                    if (characteristics != null) {
                        for (BluetoothGattCharacteristic characteristic : characteristics) {
                            if (characteristic == null) continue;
                            JSONObject characteristicJson = new JSONObject();
                            characteristicJson.put("uuid", characteristic.getUuid() == null ? "" : characteristic.getUuid().toString());
                            characteristicJson.put("properties", propertiesJson(characteristic.getProperties()));
                            characteristicJson.put("permissions", characteristic.getPermissions());

                            JSONArray descriptorsJson = new JSONArray();
                            List<BluetoothGattDescriptor> descriptors = characteristic.getDescriptors();
                            if (descriptors != null) {
                                for (BluetoothGattDescriptor descriptor : descriptors) {
                                    if (descriptor == null || descriptor.getUuid() == null) continue;
                                    descriptorsJson.put(descriptor.getUuid().toString());
                                }
                            }
                            characteristicJson.put("descriptors", descriptorsJson);
                            characteristicsJson.put(characteristicJson);
                        }
                    }

                    serviceJson.put("characteristics", characteristicsJson);
                    servicesJson.put(serviceJson);
                }
            }
            root.put("services", servicesJson);
        } catch (Exception ignored) {
            // Return the best partial profile rather than failing the inspection.
        }
        return root;
    }

    private JSONArray propertiesJson(int properties) {
        JSONArray out = new JSONArray();
        if ((properties & BluetoothGattCharacteristic.PROPERTY_READ) != 0) out.put("read");
        if ((properties & BluetoothGattCharacteristic.PROPERTY_WRITE) != 0) out.put("write");
        if ((properties & BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE) != 0) out.put("writeNoResponse");
        if ((properties & BluetoothGattCharacteristic.PROPERTY_NOTIFY) != 0) out.put("notify");
        if ((properties & BluetoothGattCharacteristic.PROPERTY_INDICATE) != 0) out.put("indicate");
        if ((properties & BluetoothGattCharacteristic.PROPERTY_BROADCAST) != 0) out.put("broadcast");
        if ((properties & BluetoothGattCharacteristic.PROPERTY_SIGNED_WRITE) != 0) out.put("signedWrite");
        if ((properties & BluetoothGattCharacteristic.PROPERTY_EXTENDED_PROPS) != 0) out.put("extended");
        return out;
    }

    private void finishSuccessLocked(JSONObject profile) {
        Callback callback = activeCallback;
        JSONObject safeProfile;
        try {
            safeProfile = profile == null ? new JSONObject() : new JSONObject(profile.toString());
        } catch (Exception e) {
            safeProfile = new JSONObject();
        }
        finishLocked();
        if (callback != null) callback.onComplete(safeProfile);
    }

    private void finishErrorLocked(String code) {
        Callback callback = activeCallback;
        finishLocked();
        if (callback != null) callback.onError(code == null ? "ble_gatt_failed" : code);
    }

    @SuppressLint("MissingPermission")
    private void stopScanLocked() {
        if (scanFallbackRunnable != null) {
            handler.removeCallbacks(scanFallbackRunnable);
            scanFallbackRunnable = null;
        }
        if (activeScanner != null && activeScanCallback != null) {
            try { activeScanner.stopScan(activeScanCallback); } catch (Exception ignored) {}
        }
        activeScanner = null;
        activeScanCallback = null;
    }

    @SuppressLint("MissingPermission")
    private void closeGattLocked() {
        BluetoothGatt gatt = activeGatt;
        activeGatt = null;
        if (gatt != null) {
            try { gatt.disconnect(); } catch (Exception ignored) {}
            try { gatt.close(); } catch (Exception ignored) {}
        }
    }

    private void finishLocked() {
        if (timeoutRunnable != null) {
            handler.removeCallbacks(timeoutRunnable);
            timeoutRunnable = null;
        }
        if (retryRunnable != null) {
            handler.removeCallbacks(retryRunnable);
            retryRunnable = null;
        }
        stopScanLocked();
        closeGattLocked();
        activeCallback = null;
        activeAddress = "";
        activeName = "";
        deadlineMs = 0L;
        connectAttempt = 0;
        activeProfile = null;
        readableCharacteristics.clear();
        while (readValues.length() > 0) readValues.remove(readValues.length() - 1);
        readIndex = 0;
        activeReadCharacteristic = null;
    }
}
