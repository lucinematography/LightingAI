package com.lightingai.app;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import org.json.JSONArray;
import org.json.JSONObject;

public final class BleGattInspector {
    public interface Callback {
        void onComplete(JSONObject result);
        void onError(String code);
    }

    private final Context context;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Object lock = new Object();
    private BluetoothGatt activeGatt;
    private Runnable timeoutRunnable;
    private Callback callback;
    private String activeAddress = "";

    public BleGattInspector(Context context) {
        this.context = context.getApplicationContext();
    }

    @SuppressLint("MissingPermission")
    public void inspect(String address, int timeoutMs, Callback resultCallback) {
        final String target = address == null ? "" : address.trim();
        final int boundedTimeout = Math.max(2000, Math.min(15000, timeoutMs));
        synchronized (lock) {
            cancelLocked();
            callback = resultCallback;
            activeAddress = target;
            if (!BluetoothAdapter.checkBluetoothAddress(target)) {
                finishErrorLocked("ble_gatt_bad_address");
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

            BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
                @Override public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                    synchronized (lock) {
                        if (gatt != activeGatt) return;
                        if (status != BluetoothGatt.GATT_SUCCESS) {
                            finishErrorLocked("ble_gatt_connect_status_" + status);
                            return;
                        }
                        if (newState == BluetoothProfile.STATE_CONNECTED) {
                            boolean started;
                            try { started = gatt.discoverServices(); }
                            catch (Exception e) { started = false; }
                            if (!started) finishErrorLocked("ble_gatt_service_discovery_start_failed");
                        } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                            finishErrorLocked("ble_gatt_disconnected");
                        }
                    }
                }

                @Override public void onServicesDiscovered(BluetoothGatt gatt, int status) {
                    synchronized (lock) {
                        if (gatt != activeGatt) return;
                        if (status != BluetoothGatt.GATT_SUCCESS) {
                            finishErrorLocked("ble_gatt_service_discovery_status_" + status);
                            return;
                        }
                        try {
                            JSONObject out = new JSONObject();
                            out.put("address", activeAddress);
                            JSONArray services = new JSONArray();
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
                                    characteristicJson.put("properties", characteristic.getProperties());
                                    characteristicJson.put("permissions", characteristic.getPermissions());
                                    characteristics.put(characteristicJson);
                                }
                                serviceJson.put("characteristics", characteristics);
                                services.put(serviceJson);
                            }
                            out.put("services", services);
                            out.put("serviceCount", services.length());
                            finishSuccessLocked(out);
                        } catch (Exception e) {
                            finishErrorLocked("ble_gatt_result_encode_failed");
                        }
                    }
                }
            };

            try {
                activeGatt = adapter.getRemoteDevice(target).connectGatt(
                    context,
                    false,
                    gattCallback,
                    android.bluetooth.BluetoothDevice.TRANSPORT_LE
                );
                if (activeGatt == null) {
                    finishErrorLocked("ble_gatt_connect_start_failed");
                    return;
                }
                timeoutRunnable = () -> {
                    synchronized (lock) {
                        finishErrorLocked("ble_gatt_timeout");
                    }
                };
                handler.postDelayed(timeoutRunnable, boundedTimeout);
            } catch (Exception e) {
                finishErrorLocked("ble_gatt_connect_start_failed");
            }
        }
    }

    public void cancel() {
        synchronized (lock) {
            cancelLocked();
        }
    }

    @SuppressLint("MissingPermission")
    private void finishSuccessLocked(JSONObject result) {
        Callback cb = callback;
        callback = null;
        closeGattLocked();
        if (cb != null) cb.onComplete(result == null ? new JSONObject() : result);
    }

    @SuppressLint("MissingPermission")
    private void finishErrorLocked(String code) {
        Callback cb = callback;
        callback = null;
        closeGattLocked();
        if (cb != null) cb.onError(code == null ? "ble_gatt_failed" : code);
    }

    @SuppressLint("MissingPermission")
    private void cancelLocked() {
        callback = null;
        closeGattLocked();
    }

    @SuppressLint("MissingPermission")
    private void closeGattLocked() {
        if (timeoutRunnable != null) {
            handler.removeCallbacks(timeoutRunnable);
            timeoutRunnable = null;
        }
        BluetoothGatt gatt = activeGatt;
        activeGatt = null;
        activeAddress = "";
        if (gatt != null) {
            try { gatt.disconnect(); } catch (Exception ignored) {}
            try { gatt.close(); } catch (Exception ignored) {}
        }
    }
}
