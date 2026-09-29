package com.lightingai.app;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.ParcelUuid;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.UUID;

public final class AsteraBtbClassicInspector {
    public interface Callback {
        void onComplete(JSONObject result);
        void onError(String code);
    }

    private static final UUID SPP_UUID =
        UUID.fromString("00001101-0000-1000-8000-00805f9b34fb");

    private final Context context;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Object lock = new Object();

    private BroadcastReceiver uuidReceiver;
    private Runnable timeoutRunnable;
    private Callback callback;
    private String activeAddress = "";
    private int inspectionEpoch = 0;

    public AsteraBtbClassicInspector(Context context) {
        this.context = context.getApplicationContext();
    }

    @SuppressLint("MissingPermission")
    public void inspect(String address, int timeoutMs, Callback resultCallback) {
        final String target = address == null ? "" : address.trim();
        final int boundedTimeout = Math.max(5000, Math.min(30000, timeoutMs));

        synchronized (lock) {
            cancelLocked();
            final int thisEpoch = ++inspectionEpoch;
            callback = resultCallback;
            activeAddress = target;

            if (!BluetoothAdapter.checkBluetoothAddress(target)) {
                finishErrorLocked("astera_classic_bad_address");
                return;
            }

            BluetoothManager manager =
                (BluetoothManager) context.getSystemService(Context.BLUETOOTH_SERVICE);
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
                device = adapter.getRemoteDevice(target);
            } catch (Exception e) {
                finishErrorLocked("astera_classic_bad_address");
                return;
            }

            try {
                if (device.getBondState() != BluetoothDevice.BOND_BONDED) {
                    finishErrorLocked("astera_bond_required");
                    return;
                }
            } catch (SecurityException e) {
                finishErrorLocked("ble_permission_denied");
                return;
            }

            uuidReceiver = new BroadcastReceiver() {
                @Override public void onReceive(Context receiverContext, Intent intent) {
                    if (intent == null ||
                        !BluetoothDevice.ACTION_UUID.equals(intent.getAction())) return;

                    BluetoothDevice changed = null;
                    try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            changed = intent.getParcelableExtra(
                                BluetoothDevice.EXTRA_DEVICE, BluetoothDevice.class);
                        } else {
                            changed = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                        }
                    } catch (Exception ignored) {}

                    if (changed == null) return;

                    String changedAddress = "";
                    try { changedAddress = changed.getAddress(); }
                    catch (Exception ignored) {}

                    synchronized (lock) {
                        if (thisEpoch != inspectionEpoch ||
                            callback == null ||
                            !activeAddress.equalsIgnoreCase(changedAddress)) return;

                        ParcelUuid[] uuids = null;
                        try {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                uuids = intent.getParcelableArrayExtra(
                                    BluetoothDevice.EXTRA_UUID, ParcelUuid.class);
                            } else {
                                Object[] raw = intent.getParcelableArrayExtra(
                                    BluetoothDevice.EXTRA_UUID);
                                if (raw != null) {
                                    uuids = new ParcelUuid[raw.length];
                                    for (int i = 0; i < raw.length; i++) {
                                        if (raw[i] instanceof ParcelUuid) {
                                            uuids[i] = (ParcelUuid) raw[i];
                                        }
                                    }
                                }
                            }
                        } catch (Exception ignored) {}

                        finishSuccessLocked(changed, uuids, false);
                    }
                }
            };

            try {
                IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_UUID);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    context.registerReceiver(
                        uuidReceiver, filter, Context.RECEIVER_EXPORTED);
                } else {
                    context.registerReceiver(uuidReceiver, filter);
                }
            } catch (Exception e) {
                uuidReceiver = null;
                finishErrorLocked("astera_classic_receiver_failed");
                return;
            }

            timeoutRunnable = () -> {
                synchronized (lock) {
                    if (thisEpoch != inspectionEpoch || callback == null) return;
                    ParcelUuid[] cached = null;
                    try { cached = device.getUuids(); } catch (Exception ignored) {}
                    if (cached != null && cached.length > 0) {
                        finishSuccessLocked(device, cached, true);
                    } else {
                        finishErrorLocked("astera_classic_sdp_timeout");
                    }
                }
            };
            handler.postDelayed(timeoutRunnable, boundedTimeout);

            try {
                ParcelUuid[] cached = device.getUuids();
                if (cached != null && cached.length > 0) {
                    finishSuccessLocked(device, cached, true);
                    return;
                }

                boolean started = device.fetchUuidsWithSdp();
                if (!started) {
                    ParcelUuid[] after = device.getUuids();
                    if (after != null && after.length > 0) {
                        finishSuccessLocked(device, after, true);
                    } else {
                        finishErrorLocked("astera_classic_sdp_start_failed");
                    }
                }
            } catch (SecurityException e) {
                finishErrorLocked("ble_permission_denied");
            } catch (Exception e) {
                finishErrorLocked("astera_classic_sdp_exception");
            }
        }
    }

    public void cancel() {
        synchronized (lock) {
            cancelLocked();
        }
    }

    @SuppressLint("MissingPermission")
    private void finishSuccessLocked(
        BluetoothDevice device, ParcelUuid[] uuids, boolean cached) {
        Callback cb = callback;
        callback = null;

        JSONObject out = new JSONObject();
        JSONArray values = new JSONArray();
        boolean sppPresent = false;

        try {
            if (uuids != null) {
                for (ParcelUuid parcelUuid : uuids) {
                    if (parcelUuid == null) continue;
                    UUID value = parcelUuid.getUuid();
                    if (value == null) continue;
                    values.put(value.toString());
                    if (SPP_UUID.equals(value)) sppPresent = true;
                }
            }

            out.put("address", activeAddress);
            out.put("cached", cached);
            out.put("uuids", values);
            out.put("sppPresent", sppPresent);

            if (device != null) {
                try { out.put("bondState", device.getBondState()); }
                catch (Exception ignored) {}
                try { out.put("deviceType", device.getType()); }
                catch (Exception ignored) {}
                try {
                    String name = device.getName();
                    out.put("name", name == null ? "" : name);
                } catch (Exception ignored) {}
            }
        } catch (Exception ignored) {}

        cleanupLocked();
        if (cb != null) cb.onComplete(out);
    }

    private void finishErrorLocked(String code) {
        Callback cb = callback;
        callback = null;
        cleanupLocked();
        if (cb != null) cb.onError(
            code == null ? "astera_classic_sdp_failed" : code);
    }

    private void cancelLocked() {
        inspectionEpoch++;
        callback = null;
        cleanupLocked();
    }

    private void cleanupLocked() {
        if (timeoutRunnable != null) {
            handler.removeCallbacks(timeoutRunnable);
            timeoutRunnable = null;
        }
        if (uuidReceiver != null) {
            try { context.unregisterReceiver(uuidReceiver); }
            catch (Exception ignored) {}
            uuidReceiver = null;
        }
        activeAddress = "";
    }
}
