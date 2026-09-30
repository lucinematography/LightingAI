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
import java.util.UUID;

public final class BleGattInspector {
    public interface Callback {
        void onComplete(JSONObject result);
        void onError(JSONObject result, String code);
    }

    private static final int MAX_ATTEMPTS = 3;
    private static final UUID CCCD_UUID =
        UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
    private static final String DEVICE_INFORMATION_SERVICE =
        "0000180a-0000-1000-8000-00805f9b34fb";
    private static final String DIS_MODEL_NUMBER =
        "00002a24-0000-1000-8000-00805f9b34fb";
    private static final String DIS_SERIAL_NUMBER =
        "00002a25-0000-1000-8000-00805f9b34fb";
    private static final String DIS_FIRMWARE_REVISION =
        "00002a26-0000-1000-8000-00805f9b34fb";
    private static final String DIS_HARDWARE_REVISION =
        "00002a27-0000-1000-8000-00805f9b34fb";
    private static final String DIS_SOFTWARE_REVISION =
        "00002a28-0000-1000-8000-00805f9b34fb";
    private static final String DIS_MANUFACTURER_NAME =
        "00002a29-0000-1000-8000-00805f9b34fb";
    private static final String ASTERA_BTB_PRIVATE_SERVICE =
        "0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65";

    private final Context context;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Object lock = new Object();

    private BluetoothGatt activeGatt;
    private Runnable timeoutRunnable;
    private Runnable retryRunnable;
    private Runnable observationFinishRunnable;
    private Callback callback;
    private int inspectionEpoch = 0;
    private String activeAddress = "";
    private long deadlineMs = 0L;
    private long inspectionStartedMs = 0L;
    private int attempt = 0;
    private JSONObject activeProfile;

    private final List<BluetoothGattCharacteristic> readable = new ArrayList<>();
    private final JSONArray readValues = new JSONArray();
    private int readIndex = 0;
    private BluetoothGattCharacteristic activeRead;

    private String passiveNotifyServiceUuid = "";
    private final List<BluetoothGattCharacteristic> subscribable = new ArrayList<>();
    private final JSONArray subscriptionResults = new JSONArray();
    private final JSONArray notificationValues = new JSONArray();
    private final JSONArray eventTimeline = new JSONArray();
    private final JSONArray attemptHistory = new JSONArray();
    private final JSONObject deviceInformation = new JSONObject();
    private int subscribeIndex = 0;
    private BluetoothGattDescriptor activeDescriptor;
    private BluetoothGattCharacteristic activeSubscriptionCharacteristic;

    public BleGattInspector(Context context) {
        this.context = context.getApplicationContext();
    }

    @SuppressLint("MissingPermission")
    public void inspect(String address, int timeoutMs, Callback resultCallback) {
        inspectInternal(address, timeoutMs, "", resultCallback);
    }

    @SuppressLint("MissingPermission")
    public void inspectAstera(String address, int timeoutMs, Callback resultCallback) {
        inspectInternal(address, Math.max(10000, timeoutMs), ASTERA_BTB_PRIVATE_SERVICE, resultCallback);
    }

    @SuppressLint("MissingPermission")
    private void inspectInternal(
        String address,
        int timeoutMs,
        String passiveServiceUuid,
        Callback resultCallback
    ) {
        final String target = address == null ? "" : address.trim();
        final int boundedTimeout = Math.max(4000, Math.min(20000, timeoutMs));
        synchronized (lock) {
            cancelLocked();
            final int thisInspectionEpoch = ++inspectionEpoch;
            callback = resultCallback;
            activeAddress = target;
            inspectionStartedMs = System.currentTimeMillis();
            deadlineMs = inspectionStartedMs + boundedTimeout;
            clearJsonArray(eventTimeline);
            clearJsonArray(attemptHistory);
            appendEvent("inspection_start", "timeoutMs", boundedTimeout);
            passiveNotifyServiceUuid = normalizeUuid(passiveServiceUuid);
            attempt = 0;
            if (!BluetoothAdapter.checkBluetoothAddress(target)) {
                finishErrorLocked("ble_gatt_bad_address");
                return;
            }
            timeoutRunnable = () -> {
                synchronized (lock) {
                    if (thisInspectionEpoch != inspectionEpoch || callback == null) return;
                    if (activeProfile != null) {
                        try {
                            activeProfile.put("diagnosticIncomplete", true);
                            String warning = activeDescriptor != null
                                ? "ble_gatt_subscription_timeout"
                                : activeRead != null
                                    ? "ble_gatt_read_timeout"
                                    : "ble_gatt_passive_observation_timeout";
                            activeProfile.put("diagnosticWarning", warning);
                            appendRuntimeDiagnosticsLocked();
                        } catch (Exception ignored) {}
                        finishSuccessLocked(activeProfile);
                    } else {
                        finishErrorLocked("ble_gatt_timeout");
                    }
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

        closeGattOnlyLocked();
        clearAttemptState();
        attempt++;
        final int thisAttempt = attempt;
        appendEvent("connect_attempt", "attempt", thisAttempt);
        final BluetoothDevice device;
        try {
            device = adapter.getRemoteDevice(activeAddress);
            int bondState = BluetoothDevice.BOND_NONE;
            String deviceName = "";
            try { bondState = device.getBondState(); } catch (Exception ignored) {}
            try {
                String n = device.getName();
                deviceName = n == null ? "" : n;
            } catch (Exception ignored) {}
            appendEvent(
                "connect_target",
                "attempt", thisAttempt,
                "bondState", bondState,
                "deviceName", deviceName);
        } catch (Exception e) {
            finishErrorLocked("ble_gatt_bad_address");
            return;
        }

        BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
            @Override public void onConnectionStateChange(
                BluetoothGatt gatt, int status, int newState
            ) {
                synchronized (lock) {
                    if (gatt != activeGatt || callback == null) return;
                    appendEvent(
                        "connection_state",
                        "status", status,
                        "statusClass", classifyStatus(status),
                        "newState", newState);
                    if (status != BluetoothGatt.GATT_SUCCESS) {
                        if (isAsteraInspection() && isAuthenticationStatus(status)) {
                            appendAttemptSnapshot("astera_bond_required");
                            finishErrorLocked("astera_bond_required");
                            return;
                        }
                        retryOrFailLocked(
                            "ble_gatt_connect_status_" + status + "_attempt_" + thisAttempt);
                        return;
                    }
                    if (newState == BluetoothProfile.STATE_CONNECTED) {
                        handler.postDelayed(() -> {
                            synchronized (lock) {
                                if (gatt != activeGatt || callback == null) return;
                                boolean started;
                                try { started = gatt.discoverServices(); }
                                catch (Exception e) { started = false; }
                                appendEvent("service_discovery_start", "started", started);
                                if (!started) {
                                    retryOrFailLocked(
                                        "ble_gatt_service_discovery_start_failed_attempt_" +
                                        thisAttempt);
                                }
                            }
                        }, 250);
                    } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                        retryOrFailLocked(
                            "ble_gatt_disconnected_attempt_" + thisAttempt);
                    }
                }
            }

            @Override public void onServicesDiscovered(BluetoothGatt gatt, int status) {
                synchronized (lock) {
                    if (gatt != activeGatt || callback == null) return;
                    appendEvent("services_discovered", "status", status, "serviceCount", gatt.getServices() == null ? 0 : gatt.getServices().size());
                    if (status != BluetoothGatt.GATT_SUCCESS) {
                        if (isAsteraInspection() && isAuthenticationStatus(status)) {
                            appendAttemptSnapshot("astera_bond_required");
                            finishErrorLocked("astera_bond_required");
                            return;
                        }
                        retryOrFailLocked(
                            "ble_gatt_service_discovery_status_" + status +
                            "_attempt_" + thisAttempt);
                        return;
                    }
                    try {
                        JSONObject out = new JSONObject();
                        out.put("address", activeAddress);
                        out.put("connectAttempts", thisAttempt);
                        out.put("passiveObservationRequested",
                            !passiveNotifyServiceUuid.isEmpty());
                        out.put("passiveObservationServiceUuid",
                            passiveNotifyServiceUuid);
                        out.put("standardCccdWritesOnly", true);
                        out.put("proprietaryCharacteristicWrites", 0);
                        try {
                            BluetoothDevice remote = gatt.getDevice();
                            out.put("bondState",
                                remote == null
                                    ? BluetoothDevice.BOND_NONE
                                    : remote.getBondState());
                            String remoteName =
                                remote == null ? "" : remote.getName();
                            out.put("deviceName",
                                remoteName == null ? "" : remoteName);
                        } catch (Exception ignored) {
                            out.put("bondState", BluetoothDevice.BOND_NONE);
                            out.put("deviceName", "");
                        }

                        JSONArray services = new JSONArray();
                        readable.clear();
                        subscribable.clear();
                        clearJsonArray(readValues);
                        clearJsonArray(subscriptionResults);
                        clearJsonArray(notificationValues);
                        clearJsonObject(deviceInformation);
                        boolean passiveServicePresent = false;

                        for (BluetoothGattService service : gatt.getServices()) {
                            if (service == null) continue;
                            String serviceUuid =
                                normalizeUuid(String.valueOf(service.getUuid()));
                            if (!passiveNotifyServiceUuid.isEmpty() &&
                                passiveNotifyServiceUuid.equals(serviceUuid)) {
                                passiveServicePresent = true;
                            }

                            JSONObject serviceJson = new JSONObject();
                            serviceJson.put("uuid",
                                String.valueOf(service.getUuid()));
                            serviceJson.put("type", service.getType());
                            JSONArray characteristics = new JSONArray();

                            for (BluetoothGattCharacteristic characteristic :
                                service.getCharacteristics()) {
                                if (characteristic == null) continue;
                                JSONObject characteristicJson = new JSONObject();
                                characteristicJson.put("uuid",
                                    String.valueOf(characteristic.getUuid()));
                                int properties = characteristic.getProperties();
                                boolean readableFlag =
                                    (properties &
                                        BluetoothGattCharacteristic.PROPERTY_READ) != 0;
                                boolean writableFlag =
                                    (properties &
                                        BluetoothGattCharacteristic.PROPERTY_WRITE) != 0;
                                boolean writeNoResponseFlag =
                                    (properties &
                                        BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE) != 0;
                                boolean notifyFlag =
                                    (properties &
                                        BluetoothGattCharacteristic.PROPERTY_NOTIFY) != 0;
                                boolean indicateFlag =
                                    (properties &
                                        BluetoothGattCharacteristic.PROPERTY_INDICATE) != 0;

                                characteristicJson.put("properties", properties);
                                characteristicJson.put(
                                    "permissions", characteristic.getPermissions());
                                characteristicJson.put("readable", readableFlag);
                                characteristicJson.put("writable", writableFlag);
                                characteristicJson.put(
                                    "writeNoResponse", writeNoResponseFlag);
                                characteristicJson.put("notifiable", notifyFlag);
                                characteristicJson.put("indicatable", indicateFlag);

                                JSONArray descriptors = new JSONArray();
                                for (BluetoothGattDescriptor descriptor :
                                    characteristic.getDescriptors()) {
                                    if (descriptor == null) continue;
                                    JSONObject descriptorJson =
                                        new JSONObject();
                                    descriptorJson.put("uuid",
                                        String.valueOf(descriptor.getUuid()));
                                    descriptorJson.put("permissions",
                                        descriptor.getPermissions());
                                    descriptors.put(descriptorJson);
                                }
                                characteristicJson.put(
                                    "descriptors", descriptors);
                                characteristics.put(characteristicJson);

                                boolean passiveServiceMatch =
                                    !passiveNotifyServiceUuid.isEmpty() &&
                                    passiveNotifyServiceUuid.equals(serviceUuid);
                                boolean standardDeviceInfoMatch =
                                    DEVICE_INFORMATION_SERVICE.equals(serviceUuid);
                                if (readableFlag &&
                                    (passiveNotifyServiceUuid.isEmpty() ||
                                        passiveServiceMatch ||
                                        standardDeviceInfoMatch)) {
                                    readable.add(characteristic);
                                }
                                if (passiveServiceMatch &&
                                    (notifyFlag || indicateFlag)) {
                                    subscribable.add(characteristic);
                                }
                            }
                            serviceJson.put(
                                "characteristics", characteristics);
                            services.put(serviceJson);
                        }

                        out.put("services", services);
                        out.put("serviceCount", services.length());
                        out.put("passiveObservationServicePresent",
                            passiveServicePresent);
                        out.put(
                            "standardDeviceInformationReadEnabled",
                            isAsteraInspection());
                        out.put("passiveNotificationCharacteristicCount",
                            subscribable.size());
                        if (isAsteraInspection() && !passiveServicePresent) {
                            out.put("diagnosticIncomplete", true);
                            out.put(
                                "diagnosticWarning",
                                "astera_btb_private_service_missing");
                            appendEvent(
                                "astera_service_missing",
                                "expectedServiceUuid",
                                ASTERA_BTB_PRIVATE_SERVICE);
                        }
                        activeProfile = out;

                        readIndex = 0;
                        activeRead = null;
                        subscribeIndex = 0;
                        activeDescriptor = null;
                        activeSubscriptionCharacteristic = null;

                        if (!passiveNotifyServiceUuid.isEmpty() &&
                            !subscribable.isEmpty()) {
                            subscribeNextLocked(gatt);
                        } else {
                            readNextLocked(gatt);
                        }
                    } catch (Exception e) {
                        finishErrorLocked("ble_gatt_result_encode_failed");
                    }
                }
            }

            @Override public void onDescriptorWrite(
                BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status
            ) {
                synchronized (lock) {
                    if (gatt != activeGatt || callback == null ||
                        descriptor == null || descriptor != activeDescriptor) {
                        return;
                    }
                    appendEvent("cccd_write_result", "status", status, "uuid", activeSubscriptionCharacteristic == null || activeSubscriptionCharacteristic.getUuid() == null ? "" : activeSubscriptionCharacteristic.getUuid().toString());
                    appendSubscriptionResult(
                        activeSubscriptionCharacteristic,
                        status,
                        status == BluetoothGatt.GATT_SUCCESS
                            ? ""
                            : "descriptor_write_status_" + status);
                    if (isAsteraInspection() && isAuthenticationStatus(status)) {
                        activeDescriptor = null;
                        activeSubscriptionCharacteristic = null;
                        finishErrorLocked("astera_bond_required");
                        return;
                    }
                    activeDescriptor = null;
                    activeSubscriptionCharacteristic = null;
                    subscribeIndex++;
                    subscribeNextLocked(gatt);
                }
            }

            @Override public void onCharacteristicRead(
                BluetoothGatt gatt,
                BluetoothGattCharacteristic characteristic,
                int status
            ) {
                synchronized (lock) {
                    byte[] value =
                        characteristic == null ? null : characteristic.getValue();
                    handleReadLocked(
                        gatt, characteristic, value, status);
                }
            }

            @Override public void onCharacteristicRead(
                BluetoothGatt gatt,
                BluetoothGattCharacteristic characteristic,
                byte[] value,
                int status
            ) {
                synchronized (lock) {
                    handleReadLocked(
                        gatt, characteristic, value, status);
                }
            }

            @Override public void onCharacteristicChanged(
                BluetoothGatt gatt,
                BluetoothGattCharacteristic characteristic
            ) {
                synchronized (lock) {
                    byte[] value =
                        characteristic == null ? null : characteristic.getValue();
                    handleNotificationLocked(
                        gatt, characteristic, value);
                }
            }

            @Override public void onCharacteristicChanged(
                BluetoothGatt gatt,
                BluetoothGattCharacteristic characteristic,
                byte[] value
            ) {
                synchronized (lock) {
                    handleNotificationLocked(
                        gatt, characteristic, value);
                }
            }
        };

        try {
            activeGatt =
                device.connectGatt(
                    context,
                    false,
                    gattCallback,
                    BluetoothDevice.TRANSPORT_LE);
            if (activeGatt == null) {
                retryOrFailLocked(
                    "ble_gatt_connect_start_failed_attempt_" + thisAttempt);
            }
        } catch (Exception e) {
            activeGatt = null;
            retryOrFailLocked(
                "ble_gatt_connect_start_failed_attempt_" + thisAttempt);
        }
    }

    @SuppressLint("MissingPermission")
    private void retryOrFailLocked(String code) {
        int status = extractTrailingStatus(code);
        appendEvent(
            "retry_or_fail",
            "code", code,
            "status", status,
            "statusClass", classifyStatus(status),
            "attempt", attempt);
        appendAttemptSnapshot(code);
        closeGattOnlyLocked();
        clearAttemptState();
        long remaining =
            deadlineMs - System.currentTimeMillis();
        if (callback != null &&
            attempt < MAX_ATTEMPTS &&
            remaining > 1500L) {
            long delay;
            if (status == 19) {
                // The peer explicitly ended the link. Give the BTB time to settle
                // before opening a fresh LE connection.
                delay = 1800L;
            } else if (status == 133) {
                // Android/AOSP 0x85 GATT_ERROR: close fully and back off before retry.
                delay = 2200L;
            } else {
                delay = attempt == 1 ? 500L : 1000L;
            }
            if (remaining <= delay + 500L) {
                finishErrorLocked(code);
                return;
            }
            appendEvent(
                "retry_scheduled",
                "delayMs", delay,
                "status", status,
                "statusClass", classifyStatus(status));
            final int retryEpoch = inspectionEpoch;
            retryRunnable = () -> {
                synchronized (lock) {
                    retryRunnable = null;
                    if (retryEpoch != inspectionEpoch ||
                        callback == null) return;
                    connectAttemptLocked();
                }
            };
            handler.postDelayed(retryRunnable, delay);
            return;
        }
        finishErrorLocked(code);
    }

    @SuppressLint("MissingPermission")
    private void subscribeNextLocked(BluetoothGatt gatt) {
        if (gatt != activeGatt || callback == null) return;

        while (subscribeIndex < subscribable.size()) {
            BluetoothGattCharacteristic characteristic =
                subscribable.get(subscribeIndex);
            int properties = characteristic.getProperties();
            boolean indicate =
                (properties &
                    BluetoothGattCharacteristic.PROPERTY_INDICATE) != 0;
            boolean notify =
                (properties &
                    BluetoothGattCharacteristic.PROPERTY_NOTIFY) != 0;

            appendEvent("subscribe_start", "uuid", characteristic.getUuid() == null ? "" : characteristic.getUuid().toString());
            boolean localEnabled;
            try {
                localEnabled =
                    gatt.setCharacteristicNotification(
                        characteristic, true);
            } catch (Exception e) {
                localEnabled = false;
            }
            appendEvent("local_notification_enable", "enabled", localEnabled, "uuid", characteristic.getUuid() == null ? "" : characteristic.getUuid().toString());
            if (!localEnabled) {
                appendSubscriptionResult(
                    characteristic, -1,
                    "set_characteristic_notification_failed");
                subscribeIndex++;
                continue;
            }

            BluetoothGattDescriptor cccd =
                characteristic.getDescriptor(CCCD_UUID);
            if (cccd == null) {
                appendSubscriptionResult(
                    characteristic, -1, "cccd_missing");
                subscribeIndex++;
                continue;
            }

            byte[] enableValue =
                notify
                    ? BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                    : indicate
                        ? BluetoothGattDescriptor.ENABLE_INDICATION_VALUE
                        : null;
            if (enableValue == null) {
                appendSubscriptionResult(
                    characteristic, -1,
                    "notify_indicate_property_missing");
                subscribeIndex++;
                continue;
            }

            boolean started = false;
            try {
                cccd.setValue(enableValue);
                activeDescriptor = cccd;
                activeSubscriptionCharacteristic = characteristic;
                started = gatt.writeDescriptor(cccd);
                appendEvent("cccd_write_start", "started", started, "uuid", characteristic.getUuid() == null ? "" : characteristic.getUuid().toString());
            } catch (Exception ignored) {
                started = false;
            }
            if (started) {
                return;
            }

            activeDescriptor = null;
            activeSubscriptionCharacteristic = null;
            appendSubscriptionResult(
                characteristic, -1, "cccd_write_start_failed");
            subscribeIndex++;
        }

        readNextLocked(gatt);
    }

    @SuppressLint("MissingPermission")
    private void readNextLocked(BluetoothGatt gatt) {
        if (gatt != activeGatt || callback == null) return;
        while (readIndex < readable.size()) {
            BluetoothGattCharacteristic characteristic =
                readable.get(readIndex);
            try {
                if (gatt.readCharacteristic(characteristic)) {
                    activeRead = characteristic;
                    appendEvent("read_start", "uuid", characteristic.getUuid() == null ? "" : characteristic.getUuid().toString());
                    return;
                }
                appendRead(
                    characteristic, null, -1, "read_start_failed");
            } catch (Exception e) {
                appendRead(
                    characteristic, null, -1, "read_exception");
            }
            readIndex++;
        }

        appendRuntimeDiagnosticsLocked();

        if (!passiveNotifyServiceUuid.isEmpty() &&
            !subscribable.isEmpty()) {
            long remaining =
                deadlineMs - System.currentTimeMillis();
            if (remaining <= 500L) {
                finishSuccessLocked(activeProfile);
                return;
            }
            final long observeMs =
                Math.max(250L, Math.min(3000L, remaining - 250L));
            try {
                activeProfile.put(
                    "passiveObservationWindowMs", observeMs);
            } catch (Exception ignored) {}
            appendEvent("passive_observation_start", "windowMs", observeMs);
            final int observeEpoch = inspectionEpoch;
            observationFinishRunnable = () -> {
                synchronized (lock) {
                    observationFinishRunnable = null;
                    if (observeEpoch != inspectionEpoch ||
                        callback == null) return;
                    appendEvent("passive_observation_end", "notificationCount", notificationValues.length());
                    appendRuntimeDiagnosticsLocked();
                    finishSuccessLocked(activeProfile);
                }
            };
            handler.postDelayed(
                observationFinishRunnable, observeMs);
            return;
        }

        finishSuccessLocked(activeProfile);
    }

    private void handleReadLocked(
        BluetoothGatt gatt,
        BluetoothGattCharacteristic characteristic,
        byte[] value,
        int status
    ) {
        if (gatt != activeGatt ||
            callback == null ||
            characteristic == null) return;
        if (activeRead != characteristic) return;
        appendEvent("read_result", "status", status, "uuid", characteristic.getUuid() == null ? "" : characteristic.getUuid().toString(), "hex", hex(value));
        appendRead(
            characteristic,
            value,
            status,
            status == BluetoothGatt.GATT_SUCCESS
                ? ""
                : "read_status_" + status);
        if (status == BluetoothGatt.GATT_SUCCESS) {
            captureDeviceInformation(characteristic, value);
        }
        activeRead = null;
        if (isAsteraInspection() && isAuthenticationStatus(status)) {
            finishErrorLocked("astera_bond_required");
            return;
        }
        readIndex++;
        readNextLocked(gatt);
    }

    private void handleNotificationLocked(
        BluetoothGatt gatt,
        BluetoothGattCharacteristic characteristic,
        byte[] value
    ) {
        if (gatt != activeGatt ||
            callback == null ||
            characteristic == null) return;
        try {
            JSONObject item = new JSONObject();
            BluetoothGattService service =
                characteristic.getService();
            item.put(
                "serviceUuid",
                service == null || service.getUuid() == null
                    ? ""
                    : service.getUuid().toString());
            item.put(
                "uuid",
                characteristic.getUuid() == null
                    ? ""
                    : characteristic.getUuid().toString());
            item.put(
                "elapsedMs",
                Math.max(
                    0L,
                    System.currentTimeMillis() -
                    inspectionStartedMs));
            item.put("hex", hex(value));
            String text = printableAscii(value);
            if (!text.isEmpty()) item.put("text", text);
            notificationValues.put(item);
            appendEvent("notification", "uuid", characteristic.getUuid() == null ? "" : characteristic.getUuid().toString(), "hex", hex(value));
            appendRuntimeDiagnosticsLocked();
        } catch (Exception ignored) {}
    }

    private void appendRead(
        BluetoothGattCharacteristic characteristic,
        byte[] value,
        int status,
        String error
    ) {
        try {
            JSONObject item = new JSONObject();
            BluetoothGattService service =
                characteristic == null
                    ? null
                    : characteristic.getService();
            item.put(
                "serviceUuid",
                service == null || service.getUuid() == null
                    ? ""
                    : service.getUuid().toString());
            item.put(
                "uuid",
                characteristic == null ||
                characteristic.getUuid() == null
                    ? ""
                    : characteristic.getUuid().toString());
            item.put("status", status);
            item.put("hex", hex(value));
            String text = printableAscii(value);
            if (!text.isEmpty()) item.put("text", text);
            if (error != null && !error.isEmpty()) {
                item.put("error", error);
            }
            readValues.put(item);
        } catch (Exception ignored) {}
    }

    private void appendSubscriptionResult(
        BluetoothGattCharacteristic characteristic,
        int status,
        String error
    ) {
        try {
            JSONObject item = new JSONObject();
            BluetoothGattService service =
                characteristic == null
                    ? null
                    : characteristic.getService();
            item.put(
                "serviceUuid",
                service == null || service.getUuid() == null
                    ? ""
                    : service.getUuid().toString());
            item.put(
                "uuid",
                characteristic == null ||
                characteristic.getUuid() == null
                    ? ""
                    : characteristic.getUuid().toString());
            item.put("status", status);
            if (error != null && !error.isEmpty()) {
                item.put("error", error);
            }
            subscriptionResults.put(item);
            appendRuntimeDiagnosticsLocked();
        } catch (Exception ignored) {}
    }

    private void appendRuntimeDiagnosticsLocked() {
        if (activeProfile == null) return;
        try {
            activeProfile.put("readValues", readValues);
            activeProfile.put(
                "notificationSubscriptions", subscriptionResults);
            activeProfile.put(
                "notificationValues", notificationValues);
            activeProfile.put(
                "notificationCount", notificationValues.length());
            activeProfile.put("eventTimeline", eventTimeline);
            activeProfile.put("attemptHistory", attemptHistory);
            activeProfile.put(
                "deviceInformation",
                new JSONObject(deviceInformation.toString()));
        } catch (Exception ignored) {}
    }

    private void appendAttemptSnapshot(String code) {
        try {
            JSONObject item = new JSONObject();
            item.put("attempt", attempt);
            item.put("code", code == null ? "" : code);
            item.put(
                "elapsedMs",
                Math.max(
                    0L,
                    System.currentTimeMillis() -
                    inspectionStartedMs));
            if (activeProfile != null) {
                item.put("profile", deepCopyJson(activeProfile));
            } else {
                item.put("readValues", new JSONArray(readValues.toString()));
                item.put(
                    "notificationSubscriptions",
                    new JSONArray(subscriptionResults.toString()));
                item.put(
                    "notificationValues",
                    new JSONArray(notificationValues.toString()));
            }
            attemptHistory.put(item);
        } catch (Exception ignored) {}
    }

    private void captureDeviceInformation(
        BluetoothGattCharacteristic characteristic,
        byte[] value
    ) {
        if (characteristic == null ||
            characteristic.getUuid() == null ||
            value == null) return;
        BluetoothGattService service = characteristic.getService();
        if (service == null || service.getUuid() == null) return;
        String serviceUuid =
            normalizeUuid(service.getUuid().toString());
        if (!DEVICE_INFORMATION_SERVICE.equals(serviceUuid)) return;

        String uuid =
            normalizeUuid(characteristic.getUuid().toString());
        String key = "";
        if (DIS_MODEL_NUMBER.equals(uuid)) key = "modelNumber";
        else if (DIS_SERIAL_NUMBER.equals(uuid)) key = "serialNumber";
        else if (DIS_FIRMWARE_REVISION.equals(uuid)) key = "firmwareRevision";
        else if (DIS_HARDWARE_REVISION.equals(uuid)) key = "hardwareRevision";
        else if (DIS_SOFTWARE_REVISION.equals(uuid)) key = "softwareRevision";
        else if (DIS_MANUFACTURER_NAME.equals(uuid)) key = "manufacturerName";
        if (key.isEmpty()) return;

        try {
            String text =
                new String(value, StandardCharsets.UTF_8).trim();
            deviceInformation.put(key, text);
            appendEvent(
                "device_information",
                "field", key,
                "value", text);
        } catch (Exception ignored) {}
    }

    private void appendEvent(String name, Object... values) {
        try {
            JSONObject event = new JSONObject();
            event.put("event", name == null ? "" : name);
            event.put(
                "elapsedMs",
                Math.max(
                    0L,
                    System.currentTimeMillis() -
                    inspectionStartedMs));
            if (values != null) {
                for (int i = 0; i + 1 < values.length; i += 2) {
                    String key = String.valueOf(values[i]);
                    Object value = values[i + 1];
                    event.put(key, value == null ? JSONObject.NULL : value);
                }
            }
            eventTimeline.put(event);
        } catch (Exception ignored) {}
    }

    private static int extractTrailingStatus(String code) {
        if (code == null) return -1;
        String marker = "status_";
        int at = code.indexOf(marker);
        if (at < 0) return -1;
        int start = at + marker.length();
        int end = start;
        while (end < code.length() &&
            Character.isDigit(code.charAt(end))) {
            end++;
        }
        if (end <= start) return -1;
        try {
            return Integer.parseInt(code.substring(start, end));
        } catch (Exception ignored) {
            return -1;
        }
    }

    private static String classifyStatus(int status) {
        if (status == BluetoothGatt.GATT_SUCCESS) return "success";
        if (status == 5) return "insufficient_authentication";
        if (status == 8) return "insufficient_authorization";
        if (status == 15) return "insufficient_encryption";
        if (status == 19) return "remote_user_terminated_connection";
        if (status == 133) return "android_gatt_error_0x85";
        return status < 0 ? "unknown" : "status_" + status;
    }

    private boolean isAsteraInspection() {
        return ASTERA_BTB_PRIVATE_SERVICE.equals(passiveNotifyServiceUuid);
    }

    private static boolean isAuthenticationStatus(int status) {
        // ATT/GATT standard errors: 0x05 insufficient authentication,
        // 0x0F insufficient encryption.
        return status == 5 || status == 15;
    }

    private static JSONObject deepCopyJson(JSONObject source) {
        if (source == null) return new JSONObject();
        try {
            return new JSONObject(source.toString());
        } catch (Exception ignored) {
            return new JSONObject();
        }
    }

    private static void clearJsonObject(JSONObject object) {
        if (object == null) return;
        JSONArray names = object.names();
        if (names == null) return;
        for (int i = 0; i < names.length(); i++) {
            String name = names.optString(i, "");
            if (!name.isEmpty()) object.remove(name);
        }
    }

    private static void clearJsonArray(JSONArray array) {
        if (array == null) return;
        while (array.length() > 0) {
            array.remove(array.length() - 1);
        }
    }

    private static String normalizeUuid(String value) {
        return value == null
            ? ""
            : value.trim().toLowerCase(java.util.Locale.US);
    }

    private static String hex(byte[] data) {
        if (data == null || data.length == 0) return "";
        StringBuilder out =
            new StringBuilder(data.length * 2);
        for (byte b : data) {
            out.append(
                String.format(
                    java.util.Locale.US,
                    "%02X",
                    b & 0xff));
        }
        return out.toString();
    }

    private static String printableAscii(byte[] data) {
        if (data == null || data.length == 0) return "";
        String text;
        try {
            text =
                new String(data, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "";
        }
        for (int i = 0; i < text.length(); i++) {
            char ch = text.charAt(i);
            if (ch < 0x20 || ch > 0x7e) return "";
        }
        return text;
    }

    @SuppressLint("MissingPermission")
    private void finishSuccessLocked(JSONObject result) {
        Callback cb = callback;
        appendEvent(
            "inspection_success",
            "notificationCount", notificationValues.length(),
            "attempt", attempt);
        callback = null;
        appendRuntimeDiagnosticsLocked();
        JSONObject snapshot =
            deepCopyJson(result == null ? new JSONObject() : result);
        cancelTimersLocked();
        closeGattOnlyLocked();
        clearState();
        activeAddress = "";
        if (cb != null) {
            cb.onComplete(snapshot);
        }
    }

    @SuppressLint("MissingPermission")
    private void finishErrorLocked(String code) {
        Callback cb = callback;
        String resolvedCode =
            code == null ? "ble_gatt_failed" : code;
        appendEvent(
            "inspection_error",
            "code", resolvedCode,
            "attempt", attempt);

        JSONObject failure = new JSONObject();
        try {
            failure.put("address", activeAddress);
            failure.put("connectAttempts", attempt);
            failure.put("failureCode", resolvedCode);
            failure.put(
                "passiveObservationRequested",
                !passiveNotifyServiceUuid.isEmpty());
            failure.put(
                "passiveObservationServiceUuid",
                passiveNotifyServiceUuid);
            failure.put("standardCccdWritesOnly", true);
            failure.put("proprietaryCharacteristicWrites", 0);
            failure.put("diagnosticIncomplete", true);
            failure.put("diagnosticWarning", resolvedCode);
            failure.put("readValues", readValues);
            failure.put(
                "notificationSubscriptions",
                subscriptionResults);
            failure.put(
                "notificationValues",
                notificationValues);
            failure.put(
                "notificationCount",
                notificationValues.length());
            failure.put("eventTimeline", eventTimeline);
            failure.put("attemptHistory", attemptHistory);
        } catch (Exception ignored) {}

        JSONObject snapshot = deepCopyJson(failure);
        callback = null;
        cancelTimersLocked();
        closeGattOnlyLocked();
        clearState();
        activeAddress = "";
        if (cb != null) {
            cb.onError(snapshot, resolvedCode);
        }
    }

    @SuppressLint("MissingPermission")
    private void cancelLocked() {
        inspectionEpoch++;
        callback = null;
        cancelTimersLocked();
        closeGattOnlyLocked();
        clearState();
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
        if (observationFinishRunnable != null) {
            handler.removeCallbacks(observationFinishRunnable);
            observationFinishRunnable = null;
        }
    }

    @SuppressLint("MissingPermission")
    private void closeGattOnlyLocked() {
        BluetoothGatt gatt = activeGatt;
        activeGatt = null;
        if (gatt != null) {
            try { gatt.disconnect(); }
            catch (Exception ignored) {}
            try { gatt.close(); }
            catch (Exception ignored) {}
        }
    }

    private void clearAttemptState() {
        activeProfile = null;
        readable.clear();
        clearJsonArray(readValues);
        readIndex = 0;
        activeRead = null;

        subscribable.clear();
        clearJsonArray(subscriptionResults);
        clearJsonArray(notificationValues);
        subscribeIndex = 0;
        activeDescriptor = null;
        activeSubscriptionCharacteristic = null;
    }

    private void clearState() {
        clearAttemptState();
        passiveNotifyServiceUuid = "";
        inspectionStartedMs = 0L;
    }
}
