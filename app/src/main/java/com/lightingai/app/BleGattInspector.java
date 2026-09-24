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

import java.util.List;

/**
 * Read-only BLE GATT profile inspector used by LightingAI Direct Control research.
 *
 * This class never writes a characteristic, enables notifications, pairs, bonds,
 * provisions, or changes fixture state. It only connects long enough to discover
 * the public GATT service/characteristic layout exposed by a device.
 */
public final class BleGattInspector {
    public interface Callback {
        void onComplete(JSONObject profile);
        void onError(String code);
    }

    private final Context context;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Object lock = new Object();

    private BluetoothGatt activeGatt;
    private Runnable timeoutRunnable;
    private Callback activeCallback;
    private String activeAddress = "";

    public BleGattInspector(Context context) {
        this.context = context.getApplicationContext();
    }

    @SuppressLint("MissingPermission")
    public void inspect(String address, int timeoutMs, Callback callback) {
        final int boundedTimeout = Math.max(2500, Math.min(15000, timeoutMs));
        synchronized (lock) {
            closeLocked(null, false);
            activeCallback = callback;
            activeAddress = address == null ? "" : address.trim();

            if (activeAddress.isEmpty()) {
                finishErrorLocked("ble_invalid_address");
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

            final BluetoothDevice device;
            try {
                device = adapter.getRemoteDevice(activeAddress);
            } catch (Exception e) {
                finishErrorLocked("ble_invalid_address");
                return;
            }

            BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
                @Override
                public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                    synchronized (lock) {
                        if (gatt != activeGatt) return;
                        if (status != BluetoothGatt.GATT_SUCCESS) {
                            finishErrorLocked("ble_gatt_connect_" + status);
                            return;
                        }
                        if (newState == BluetoothProfile.STATE_CONNECTED) {
                            try {
                                if (!gatt.discoverServices()) finishErrorLocked("ble_gatt_discovery_start_failed");
                            } catch (Exception e) {
                                finishErrorLocked("ble_gatt_discovery_start_failed");
                            }
                        } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                            finishErrorLocked("ble_gatt_disconnected");
                        }
                    }
                }

                @Override
                public void onServicesDiscovered(BluetoothGatt gatt, int status) {
                    synchronized (lock) {
                        if (gatt != activeGatt) return;
                        if (status != BluetoothGatt.GATT_SUCCESS) {
                            finishErrorLocked("ble_gatt_discovery_" + status);
                            return;
                        }
                        JSONObject profile = buildProfile(gatt);
                        finishSuccessLocked(profile);
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
                finishErrorLocked("ble_gatt_connect_failed");
                return;
            }

            if (activeGatt == null) {
                finishErrorLocked("ble_gatt_connect_failed");
                return;
            }

            timeoutRunnable = () -> {
                synchronized (lock) {
                    finishErrorLocked("ble_gatt_timeout");
                }
            };
            handler.postDelayed(timeoutRunnable, boundedTimeout);
        }
    }

    public void close() {
        synchronized (lock) {
            closeLocked(null, false);
        }
    }

    private JSONObject buildProfile(BluetoothGatt gatt) {
        JSONObject root = new JSONObject();
        JSONArray servicesJson = new JSONArray();
        try {
            root.put("address", activeAddress);
            root.put("timestampMs", System.currentTimeMillis());
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
        closeLocked(null, true);
        if (callback != null) callback.onComplete(profile == null ? new JSONObject() : profile);
    }

    private void finishErrorLocked(String code) {
        Callback callback = activeCallback;
        closeLocked(null, true);
        if (callback != null) callback.onError(code == null ? "ble_gatt_failed" : code);
    }

    @SuppressLint("MissingPermission")
    private void closeLocked(String ignored, boolean keepCallbackDetached) {
        if (timeoutRunnable != null) {
            handler.removeCallbacks(timeoutRunnable);
            timeoutRunnable = null;
        }
        BluetoothGatt gatt = activeGatt;
        activeGatt = null;
        activeAddress = "";
        if (!keepCallbackDetached) activeCallback = null;
        if (gatt != null) {
            try { gatt.disconnect(); } catch (Exception ignoredDisconnect) {}
            try { gatt.close(); } catch (Exception ignoredClose) {}
        }
        if (keepCallbackDetached) activeCallback = null;
    }
}
