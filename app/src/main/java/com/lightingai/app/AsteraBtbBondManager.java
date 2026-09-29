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
import org.json.JSONObject;

public final class AsteraBtbBondManager {
    public interface Callback {
        void onComplete(JSONObject result);
        void onError(String code);
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
            if (currentState == BluetoothDevice.BOND_BONDED) {
                finishSuccessLocked(device, true);
                return;
            }

            bondReceiver = new BroadcastReceiver() {
                @Override public void onReceive(Context receiverContext, Intent intent) {
                    if (intent == null || !BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(intent.getAction())) return;
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
                        int state = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, BluetoothDevice.ERROR);
                        int previous = intent.getIntExtra(BluetoothDevice.EXTRA_PREVIOUS_BOND_STATE, BluetoothDevice.ERROR);
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
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    context.registerReceiver(bondReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
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
            out.put("address", activeAddress);
            out.put("bondState", "bonded");
            out.put("alreadyBonded", alreadyBonded);
            String name = "";
            try { name = device == null ? "" : device.getName(); } catch (Exception ignored) {}
            out.put("name", name == null ? "" : name);
        } catch (Exception ignored) {}
        cleanupLocked();
        if (cb != null) cb.onComplete(out);
    }

    private void finishErrorLocked(String code) {
        Callback cb = callback;
        callback = null;
        cleanupLocked();
        if (cb != null) cb.onError(code == null ? "astera_bond_failed" : code);
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
    }
}
