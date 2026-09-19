package com.lightingai.app;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanRecord;
import android.bluetooth.le.ScanResult;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelUuid;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class BleDeviceScanner {
    public interface Callback {
        void onComplete(JSONArray devices);
        void onError(String code);
    }

    private final Context context;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Object lock = new Object();

    private BluetoothLeScanner activeScanner;
    private ScanCallback activeCallback;
    private Runnable stopRunnable;
    private Callback resultCallback;
    private final Map<String, JSONObject> devices = new LinkedHashMap<>();

    public BleDeviceScanner(Context context) {
        this.context = context.getApplicationContext();
    }

    @SuppressLint("MissingPermission")
    public void discover(int timeoutMs, Callback callback) {
        final int boundedTimeout = Math.max(1000, Math.min(10000, timeoutMs));
        synchronized (lock) {
            stopLocked(false, null);
            devices.clear();
            resultCallback = callback;

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

            BluetoothLeScanner scanner = adapter.getBluetoothLeScanner();
            if (scanner == null) {
                finishErrorLocked("ble_scanner_unavailable");
                return;
            }

            activeScanner = scanner;
            activeCallback = new ScanCallback() {
                @Override public void onScanResult(int callbackType, ScanResult result) {
                    record(result);
                }

                @Override public void onBatchScanResults(List<ScanResult> results) {
                    if (results == null) return;
                    for (ScanResult result : results) record(result);
                }

                @Override public void onScanFailed(int errorCode) {
                    synchronized (lock) {
                        finishErrorLocked("ble_scan_failed_" + errorCode);
                    }
                }
            };

            stopRunnable = () -> {
                synchronized (lock) {
                    stopLocked(true, null);
                }
            };

            try {
                activeScanner.startScan(activeCallback);
                handler.postDelayed(stopRunnable, boundedTimeout);
            } catch (Exception e) {
                finishErrorLocked("ble_scan_start_failed");
            }
        }
    }

    @SuppressLint("MissingPermission")
    public void stop() {
        synchronized (lock) {
            stopLocked(false, null);
        }
    }

    @SuppressLint("MissingPermission")
    private void record(ScanResult result) {
        if (result == null || result.getDevice() == null) return;
        synchronized (lock) {
            if (activeCallback == null) return;
            try {
                ScanRecord record = result.getScanRecord();
                String name = record == null ? null : record.getDeviceName();
                if (name == null || name.trim().isEmpty()) {
                    try { name = result.getDevice().getName(); } catch (Exception ignored) {}
                }
                String address = "";
                try { address = result.getDevice().getAddress(); } catch (Exception ignored) {}

                JSONArray services = new JSONArray();
                if (record != null && record.getServiceUuids() != null) {
                    for (ParcelUuid uuid : record.getServiceUuids()) {
                        if (uuid != null) services.put(uuid.toString());
                    }
                }

                JSONObject item = new JSONObject();
                item.put("name", name == null ? "" : name.trim());
                item.put("address", address == null ? "" : address);
                item.put("rssi", result.getRssi());
                item.put("connectable", android.os.Build.VERSION.SDK_INT < 26 || result.isConnectable());
                item.put("serviceUuids", services);

                String key = address == null || address.isEmpty()
                    ? (item.optString("name") + "|" + services.toString())
                    : address;
                JSONObject previous = devices.get(key);
                if (previous == null || result.getRssi() > previous.optInt("rssi", -127)) {
                    devices.put(key, item);
                }
            } catch (Exception ignored) {
                // Ignore one malformed advertisement and keep scanning.
            }
        }
    }

    @SuppressLint("MissingPermission")
    private void stopLocked(boolean deliverResults, String error) {
        if (stopRunnable != null) {
            handler.removeCallbacks(stopRunnable);
            stopRunnable = null;
        }
        if (activeScanner != null && activeCallback != null) {
            try { activeScanner.stopScan(activeCallback); } catch (Exception ignored) {}
        }
        activeScanner = null;
        activeCallback = null;

        Callback callback = resultCallback;
        resultCallback = null;
        if (callback == null) return;

        if (error != null) {
            callback.onError(error);
            return;
        }
        if (deliverResults) {
            JSONArray out = new JSONArray();
            for (JSONObject item : devices.values()) out.put(item);
            callback.onComplete(out);
        }
    }

    private void finishErrorLocked(String code) {
        stopLocked(false, code == null ? "ble_scan_failed" : code);
    }
}
