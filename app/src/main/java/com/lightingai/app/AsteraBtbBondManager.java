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
import org.json.JSONArray;
import org.json.JSONObject;

public final class AsteraBtbBondManager {
    public interface Callback {
        void onProgress(JSONObject result);
        void onComplete(JSONObject result);
        void onError(JSONObject result, String code);
    }

    private final Context context;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Object lock = new Object();

    private BroadcastReceiver bondReceiver;
    private Runnable timeoutRunnable;
    private Callback callback;
    private String activeAddress = "";
    private int operationEpoch = 0;
    private boolean sawBonding = false;
    private long startedMs = 0L;
    private final JSONArray eventTimeline = new JSONArray();

    public AsteraBtbBondManager(Context context) {
        this.context = context.getApplicationContext();
    }

    @SuppressLint("MissingPermission")
    public void bond(String address, int timeoutMs, Callback resultCallback) {
        final String target = address == null ? "" : address.trim();
        final int boundedTimeout = Math.max(8000, Math.min(45000, timeoutMs));
        synchronized (lock) {
            cancelLocked();
            final int thisEpoch = ++operationEpoch;
            callback = resultCallback;
            activeAddress = target;
            sawBonding = false;
            startedMs = System.currentTimeMillis();
            clearJsonArray(eventTimeline);
            appendEvent("bond_start", "timeoutMs", boundedTimeout);

            if (!BluetoothAdapter.checkBluetoothAddress(target)) {
                finishErrorLocked("astera_bond_bad_address");
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
                device = adapter.getRemoteDevice(target);
            } catch (Exception e) {
                finishErrorLocked("astera_bond_bad_address");
                return;
            }

            int currentState;
            try {
                currentState = device.getBondState();
            } catch (Exception e) {
                finishErrorLocked("astera_bond_state_unavailable");
                return;
            }
            appendEvent("initial_bond_state", "state", currentState);
            if (currentState == BluetoothDevice.BOND_BONDED) {
                finishSuccessLocked(device, true);
                return;
            }

            bondReceiver = new BroadcastReceiver() {
                @Override public void onReceive(Context receiverContext, Intent intent) {
                    if (intent == null) return;
                    String action = intent.getAction();
                    if (!BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(action) &&
                        !BluetoothDevice.ACTION_PAIRING_REQUEST.equals(action)) return;
                    BluetoothDevice changed;
                    try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            changed = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice.class);
                        } else {
                            changed = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                        }
                    } catch (Exception e) {
                        changed = null;
                    }
                    if (changed == null) return;
                    String changedAddress;
                    try { changedAddress = changed.getAddress(); }
                    catch (Exception e) { changedAddress = ""; }
                    synchronized (lock) {
                        if (thisEpoch != operationEpoch || callback == null || !activeAddress.equalsIgnoreCase(changedAddress)) return;
                        if (BluetoothDevice.ACTION_PAIRING_REQUEST.equals(action)) {
                            int pairingVariant = intent.getIntExtra(BluetoothDevice.EXTRA_PAIRING_VARIANT, -1);
                            int pairingKey = intent.getIntExtra(BluetoothDevice.EXTRA_PAIRING_KEY, -1);
                            appendEvent("pairing_request", "variant", pairingVariant, "key", pairingKey);
                            JSONObject progress = new JSONObject();
                            try {
                                progress.put("address", activeAddress);
                                progress.put("event", "pairing_request");
                                progress.put("pairingVariant", pairingVariant);
                                progress.put("pairingKey", pairingKey);
                            } catch (Exception ignored) {}
                            Callback cb = callback;
                            if (cb != null) cb.onProgress(progress);
                            return;
                        }
                        int state = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, BluetoothDevice.ERROR);
                        int previous = intent.getIntExtra(BluetoothDevice.EXTRA_PREVIOUS_BOND_STATE, BluetoothDevice.ERROR);
                        appendEvent("bond_state", "state", state, "previous", previous);
                        if (state == BluetoothDevice.BOND_BONDING) {
                            sawBonding = true;
                            return;
                        }
                        if (state == BluetoothDevice.BOND_BONDED) {
                            finishSuccessLocked(changed, false);
                            return;
                        }
                        if (state == BluetoothDevice.BOND_NONE &&
                            (sawBonding || previous == BluetoothDevice.BOND_BONDING || previous == BluetoothDevice.BOND_BONDED)) {
                            finishErrorLocked("astera_bond_failed");
                        }
                    }
                }
            };

            try {
                IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
                filter.addAction(BluetoothDevice.ACTION_PAIRING_REQUEST);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    // Bluetooth bond-state broadcasts can originate from a highly privileged
                    // framework component rather than the system UID. Android's broadcast
                    // guidance requires RECEIVER_EXPORTED for this class of system broadcast.
                    // The receiver remains tightly filtered by action, active address and epoch.
                    context.registerReceiver(bondReceiver, filter, Context.RECEIVER_EXPORTED);
                } else {
                    context.registerReceiver(bondReceiver, filter);
                }
            } catch (Exception e) {
                bondReceiver = null;
                finishErrorLocked("astera_bond_receiver_failed");
                return;
            }

            timeoutRunnable = () -> {
                synchronized (lock) {
                    if (thisEpoch != operationEpoch || callback == null) return;
                    appendEvent("bond_timeout");
                    finishErrorLocked("astera_bond_timeout");
                }
            };
            handler.postDelayed(timeoutRunnable, boundedTimeout);

            try {
                int state = device.getBondState();
                if (state == BluetoothDevice.BOND_BONDED) {
                    finishSuccessLocked(device, true);
                    return;
                }
                if (state == BluetoothDevice.BOND_BONDING) {
                    sawBonding = true;
                    return;
                }
                boolean started = device.createBond();
                appendEvent("create_bond", "started", started);
                if (!started) {
                    int after = device.getBondState();
                    if (after == BluetoothDevice.BOND_BONDED) finishSuccessLocked(device, true);
                    else if (after == BluetoothDevice.BOND_BONDING) sawBonding = true;
                    else finishErrorLocked("astera_bond_start_failed");
                } else {
                    sawBonding = true;
                }
            } catch (SecurityException e) {
                finishErrorLocked("ble_permission_denied");
            } catch (Exception e) {
                finishErrorLocked("astera_bond_start_exception");
            }
        }
    }

    public void cancel() {
        synchronized (lock) {
            cancelLocked();
        }
    }

    @SuppressLint("MissingPermission")
    private void finishSuccessLocked(BluetoothDevice device, boolean alreadyBonded) {
        Callback cb = callback;
        callback = null;
        JSONObject out = new JSONObject();
        try {
            appendEvent("bond_success", "alreadyBonded", alreadyBonded);
            out.put("address", activeAddress);
            out.put("bondState", "bonded");
            out.put("alreadyBonded", alreadyBonded);
            out.put("eventTimeline", new JSONArray(eventTimeline.toString()));
            String name = "";
            try { name = device == null ? "" : device.getName(); } catch (Exception ignored) {}
            out.put("name", name == null ? "" : name);
        } catch (Exception ignored) {}
        cleanupLocked();
        if (cb != null) cb.onComplete(out);
    }

    private void finishErrorLocked(String code) {
        Callback cb = callback;
        String resolved =
            code == null ? "astera_bond_failed" : code;
        appendEvent("bond_error", "code", resolved);
        JSONObject out = new JSONObject();
        try {
            out.put("address", activeAddress);
            out.put("failureCode", resolved);
            out.put("eventTimeline", new JSONArray(eventTimeline.toString()));
        } catch (Exception ignored) {}
        callback = null;
        cleanupLocked();
        if (cb != null) cb.onError(out, resolved);
    }

    private void appendEvent(String name, Object... values) {
        try {
            JSONObject event = new JSONObject();
            event.put("event", name == null ? "" : name);
            event.put(
                "elapsedMs",
                Math.max(0L, System.currentTimeMillis() - startedMs));
            if (values != null) {
                for (int i = 0; i + 1 < values.length; i += 2) {
                    event.put(
                        String.valueOf(values[i]),
                        values[i + 1] == null ? JSONObject.NULL : values[i + 1]);
                }
            }
            eventTimeline.put(event);
        } catch (Exception ignored) {}
    }

    private static void clearJsonArray(JSONArray array) {
        if (array == null) return;
        while (array.length() > 0) {
            array.remove(array.length() - 1);
        }
    }

    private void cancelLocked() {
        operationEpoch++;
        callback = null;
        cleanupLocked();
    }

    private void cleanupLocked() {
        if (timeoutRunnable != null) {
            handler.removeCallbacks(timeoutRunnable);
            timeoutRunnable = null;
        }
        if (bondReceiver != null) {
            try { context.unregisterReceiver(bondReceiver); } catch (Exception ignored) {}
            bondReceiver = null;
        }
        activeAddress = "";
        sawBonding = false;
        startedMs = 0L;
    }
}
