package com.lightingai.app;

import android.annotation.SuppressLint;
import android.bluetooth.*;
import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import org.json.JSONArray;
import org.json.JSONObject;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.UUID;

/** Persistent experimental transport. No Radio PIN, session ACK or new command is inferred. */
@SuppressLint("MissingPermission")
public final class AsteraBtbColorReplayProbe {
    public interface Callback {
        void onComplete(JSONObject result);
        void onError(JSONObject result, String code);
    }
    public interface StateListener { void onState(String address, boolean connected, String reason); }
    private static final UUID NOTIFY_UUID = UUID.fromString("0a6c6c72-9ca6-ffaf-3440-b2dae8c86a67");
    private static final UUID CCCD_UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
    private static final long POST_WRITE_OBSERVATION_MS = 5000L;
    private static final int MAX_NOTIFICATION_SAMPLES = 128;
    private final Context context;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Object lock = new Object();
    private final BleOperationQueue writes;
    private final AsteraBtbReplyDecoder replies = new AsteraBtbReplyDecoder();
    private BluetoothGatt activeGatt;
    private BluetoothGattCharacteristic writeCharacteristic, notifyCharacteristic;
    private BluetoothGattDescriptor activeCccd;
    private boolean gattConnected, transportReady, proprietaryWriteSubmitted;
    private boolean finalColorWriteStarted;
    private boolean mtuPending, mtuVerified;
    private int effectiveMtu = 23;
    private int operationId, binaryReplyCount, emptyBinaryReplyCount, xmlReplyCount, emptyXmlReplyCount;
    private int postColorBinaryReplyCount, postColorXmlReplyCount, droppedNotificationSamples;
    private JSONArray assembledReplySamples = new JSONArray();
    private int generation, attempt, notificationCount, postColorNotificationCount;
    private long deadlineMs;
    private String activeAddress = "", activeDeviceName = "", operation = "", closeReason = "";
    private String observedAddress = "", observedName = "";
    private long observedUntilMs;
    private AsteraBtbCapturedFrames.Preset preset;
    private Callback callback;
    private StateListener stateListener;
    private JSONObject activeResult;
    private JSONArray eventTimeline = new JSONArray(), notificationSamples = new JSONArray();
    private Runnable timeoutRunnable, retryRunnable, observationRunnable, phaseTimeoutRunnable;

    public AsteraBtbColorReplayProbe(Context context) {
        this.context = context.getApplicationContext();
        writes = new BleOperationQueue(new BleOperationQueue.Scheduler() {
            private final java.util.IdentityHashMap<Runnable, Runnable> posted = new java.util.IdentityHashMap<>();
            public void post(Runnable task, long ms) {
                Runnable wrapped = () -> { synchronized (lock) { posted.remove(task); task.run(); } };
                posted.put(task, wrapped); handler.postDelayed(wrapped, ms);
            }
            public void remove(Runnable task) {
                Runnable wrapped = posted.remove(task);
                if (wrapped != null) handler.removeCallbacks(wrapped);
            }
        }, new BleOperationQueue.Listener() {
            public boolean submit(String label, byte[] value) { return writeValueLocked(label, value); }
            public void completed(String label, int status) {
                event("write_callback", "label", label, "status", status);
                if ("color".equals(label)) {
                    put("writeCallbackObserved", true); put("writeCallbackStatus", status);
                }
                if (BleReconnectPolicy.authenticationRequired(status)) fail("astera_bond_required");
            }
            public void finished() {
                if (!transportReady) {
                    transportReady = true;
                    put("transportReady", true);
                    event("bootstrap_submitted", "sessionVerified", false);
                    emitState("transport_ready_session_unverified");
                    if (preset == null) complete(); else sendColorLocked();
                } else observeLocked();
            }
            public void failed(String code) { fail(code); }
        });
    }
    public void setStateListener(StateListener listener) { synchronized (lock) { stateListener = listener; } }
    public void recordObservedDevice(String address, String name) {
        synchronized (lock) {
            observedAddress = address == null ? "" : address;
            observedName = name == null ? "" : name;
            observedUntilMs = SystemClock.elapsedRealtime() + 300000L;
        }
    }
    public void connect(String address, int timeoutMs, Callback cb) { begin(address, null, timeoutMs, cb); }
    public void replay(String address, String value, int timeoutMs, Callback cb) {
        final AsteraBtbCapturedFrames.Preset parsed;
        try { parsed = AsteraBtbCapturedFrames.parsePreset(value); }
        catch (Exception e) { deliverError(cb, new JSONObject(), "astera_capture_preset_invalid"); return; }
        if (!AsteraBtbCapturedFrames.isValidFrame(AsteraBtbCapturedFrames.frameFor(parsed))) {
            deliverError(cb, new JSONObject(), "astera_capture_frame_crc_invalid"); return;
        }
        begin(address, parsed, timeoutMs, cb);
    }
    private void begin(String address, AsteraBtbCapturedFrames.Preset requested, int timeoutMs, Callback cb) {
        synchronized (lock) {
            if (callback != null) { deliverError(cb, new JSONObject(), "ble_operation_busy"); return; }
            String target = address == null ? "" : address.trim();
            if (!BluetoothAdapter.checkBluetoothAddress(target)) { deliverError(cb, new JSONObject(), "ble_gatt_bad_address"); return; }
            if (!target.equals(activeAddress)) closeLocked("target_changed");
            activeAddress = target; preset = requested; callback = cb;
            closeReason = "";
            operation = requested == null ? "CONNECT" : requested.name();
            activeResult = new JSONObject();
            operationId++;
            binaryReplyCount = 0; emptyBinaryReplyCount = 0; xmlReplyCount = 0; emptyXmlReplyCount = 0;
            postColorBinaryReplyCount = 0; postColorXmlReplyCount = 0; droppedNotificationSamples = 0;
            assembledReplySamples = new JSONArray();
            notificationSamples = new JSONArray(); notificationCount = 0; postColorNotificationCount = 0;
            finalColorWriteStarted = false;
            put("kind", "LightingAI-Astera-BTB-captured-color-replay"); put("address", target); put("preset", operation);
            put("captureRevision", AsteraBtbCapturedFrames.CAPTURE_REVISION);
            put("bootstrapRevision", "2026-10-07-public-safe-stage-a");
            put("serviceUuid", AsteraBtbCapturedFrames.SERVICE_UUID.toString());
            put("characteristicUuid", AsteraBtbCapturedFrames.WRITE_UUID.toString());
            put("notifyUuid", NOTIFY_UUID.toString()); put("writeType", "WRITE_WITHOUT_RESPONSE");
            put("protocolGeneralized", false); put("bootstrapUsesPrivateSessionFields", false);
            put("bootstrapScope", "captured_subset_session_configuration_omitted");
            put("sessionVerificationReason", "no_confirmed_astera_session_response_decoder");
            put("binaryReplyMeaningVerified", false);
            put("negotiatedMtu", effectiveMtu); put("mtuVerified", mtuVerified);
            put("deviceAppliedColorVerified", false); put("sessionVerified", false);
            put("transportReady", transportReady); put("writeCallbackObserved", false);
            put("deviceName", activeDeviceName);
            put("resultScope", "transport_only_unverified"); put("postWriteObservationMs", POST_WRITE_OBSERVATION_MS);
            event("operation_start", "operation", operation, "reuseConnection", transportReady && gattConnected);
            int bounded = Math.max(20000, Math.min(45000, timeoutMs));
            deadlineMs = SystemClock.elapsedRealtime() + bounded;
            timeoutRunnable = () -> { synchronized (lock) { if (callback != null) fail("astera_capture_timeout"); } };
            handler.postDelayed(timeoutRunnable, bounded);
            try { BleConnectionService.start(context); }
            catch (Exception e) { fail("ble_foreground_service_unavailable"); return; }
            if (transportReady && gattConnected) {
                if (preset == null) complete();
                else if (!AsteraBtbCapturedFrames.supportsDeviceName(activeDeviceName)) fail("astera_capture_target_not_verified");
                else sendColorLocked();
            }
            else { attempt = 0; connectAttemptLocked(); }
        }
    }
    private void connectAttemptLocked() {
        if (callback == null) return;
        closeGattOnlyLocked();
        final int token = ++generation;
        attempt++; put("connectAttempts", attempt);
        BluetoothManager manager = (BluetoothManager) context.getSystemService(Context.BLUETOOTH_SERVICE);
        BluetoothAdapter adapter = manager == null ? null : manager.getAdapter();
        if (adapter == null) { fail("bluetooth_unavailable"); return; }
        try {
            if (!adapter.isEnabled()) { fail("bluetooth_disabled"); return; }
            BluetoothDevice device = adapter.getRemoteDevice(activeAddress);
            activeDeviceName = device.getName();
            // Android's cached GAP name can be empty even when ScanRecord has a name.
            if ((activeDeviceName == null || activeDeviceName.trim().isEmpty()) &&
                activeAddress.equals(observedAddress) && SystemClock.elapsedRealtime() < observedUntilMs) {
                activeDeviceName = observedName;
                put("deviceNameSource", "native_scan_record");
            } else put("deviceNameSource", "android_device_cache");
            put("deviceName", activeDeviceName); put("bondState", device.getBondState());
            if (!AsteraBtbCapturedFrames.supportsDeviceName(activeDeviceName)) {
                fail("astera_capture_target_not_verified"); return;
            }
            event("connect_attempt", "attempt", attempt, "bondState", device.getBondState());
            activeGatt = device.connectGatt(context, false, new BluetoothGattCallback() {
                private boolean current(BluetoothGatt g) { return token == generation && g == activeGatt; }
                @Override public void onConnectionStateChange(BluetoothGatt g, int status, int state) {
                    synchronized (lock) {
                        if (!current(g)) return;
                        boolean wasConnected = gattConnected;
                        gattConnected = status == 0 && state == BluetoothProfile.STATE_CONNECTED;
                        put("connectionStatus", status); put("connectionState", state);
                        event("connection_state", "status", status, "newState", state, "attempt", attempt);
                        if (status != 0 || state == BluetoothProfile.STATE_DISCONNECTED) {
                            if (callback == null) closeLocked("remote_disconnect_" + status);
                            else retryOrFailLocked(status, "astera_capture_connect_status_" + status + "_attempt_" + attempt);
                            return;
                        }
                        if (state == BluetoothProfile.STATE_CONNECTED && !wasConnected) {
                            schedulePhaseTimeoutLocked(token, 6000L, "ble_gatt_discovery_timeout");
                            handler.postDelayed(() -> { synchronized (lock) {
                                if (!current(g) || callback == null) return;
                                event("service_discovery_start");
                                try {
                                    if (!g.discoverServices()) retryOrFailLocked(-1, "ble_gatt_service_discovery_start_failed");
                                } catch (SecurityException e) { fail("ble_permission_denied"); }
                                catch (Exception e) { retryOrFailLocked(-1, "ble_gatt_service_discovery_exception"); }
                            } }, 300L);
                        }
                    }
                }
                @Override public void onServicesDiscovered(BluetoothGatt g, int status) {
                    synchronized (lock) {
                        if (!current(g) || callback == null) return;
                        event("services_discovered", "status", status);
                        if (status != 0) { retryOrFailLocked(status, "ble_gatt_service_discovery_status_" + status); return; }
                        try {
                        BluetoothGattService s = g.getService(AsteraBtbCapturedFrames.SERVICE_UUID);
                        if (s == null) { fail("astera_capture_service_missing"); return; }
                        writeCharacteristic = s.getCharacteristic(AsteraBtbCapturedFrames.WRITE_UUID);
                        notifyCharacteristic = s.getCharacteristic(NOTIFY_UUID);
                        if (writeCharacteristic == null || (writeCharacteristic.getProperties() & BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE) == 0) {
                            fail("astera_capture_characteristic_not_write_nr"); return;
                        }
                        if (notifyCharacteristic == null || (notifyCharacteristic.getProperties() & BluetoothGattCharacteristic.PROPERTY_NOTIFY) == 0) {
                            fail("astera_capture_notify_property_missing"); return;
                        }
                        mtuPending = true;
                        schedulePhaseTimeoutLocked(token, 4000L, "ble_gatt_mtu_timeout");
                        boolean ok = g.requestMtu(BleMtuPolicy.REQUESTED_MTU);
                        event("mtu_request", "requested", BleMtuPolicy.REQUESTED_MTU, "started", ok);
                        if (!ok) retryOrFailLocked(-1, "ble_gatt_mtu_start_failed");
                        } catch (SecurityException e) { fail("ble_permission_denied"); }
                        catch (Exception e) { fail("astera_capture_mtu_exception"); }
                    }
                }
                @Override public void onMtuChanged(BluetoothGatt g, int mtu, int status) {
                    synchronized (lock) {
                        if (!current(g) || callback == null || !mtuPending) return;
                        mtuPending = false;
                        event("mtu_result", "mtu", mtu, "status", status);
                        if (status != 0) { retryOrFailLocked(status, "ble_gatt_mtu_status_" + status); return; }
                        if (!BleMtuPolicy.valid(mtu)) { fail("ble_gatt_mtu_invalid"); return; }
                        effectiveMtu = mtu; mtuVerified = true;
                        put("negotiatedMtu", mtu); put("mtuVerified", true);
                        subscribeLocked(token);
                    }
                }
                @Override public void onDescriptorWrite(BluetoothGatt g, BluetoothGattDescriptor d, int status) {
                    synchronized (lock) {
                        if (!current(g) || callback == null || d != activeCccd) return;
                        activeCccd = null;
                        if (phaseTimeoutRunnable != null) handler.removeCallbacks(phaseTimeoutRunnable);
                        phaseTimeoutRunnable = null; event("cccd_write_result", "status", status);
                        if (status != 0) { retryOrFailLocked(status, "astera_capture_cccd_write_status_" + status); return; }
                        startBootstrapLocked();
                    }
                }
                @Override public void onCharacteristicWrite(BluetoothGatt g, BluetoothGattCharacteristic ch, int status) {
                    synchronized (lock) { if (current(g) && ch == writeCharacteristic) writes.onCallback(status); }
                }
                @Override public void onCharacteristicChanged(BluetoothGatt g, BluetoothGattCharacteristic ch, byte[] value) {
                    synchronized (lock) {
                        if (!current(g) || ch == null || !NOTIFY_UUID.equals(ch.getUuid())) return;
                        notificationCount++; if (finalColorWriteStarted) postColorNotificationCount++;
                        long receivedAt = SystemClock.elapsedRealtime();
                        event("notification", "hex", hex(value), "afterColorWrite", finalColorWriteStarted);
                        for (AsteraBtbReplyDecoder.Packet packet : replies.feed(value, receivedAt, operationId, finalColorWriteStarted)) {
                            recordReplyLocked(packet);
                        }
                        if (notificationSamples.length() >= MAX_NOTIFICATION_SAMPLES) {
                            notificationSamples.remove(0); droppedNotificationSamples++;
                        }
                        {
                            JSONObject sample = new JSONObject();
                            try { sample.put("atMs", receivedAt); sample.put("hex", hex(value));
                                sample.put("afterColorWrite", finalColorWriteStarted); notificationSamples.put(sample); }
                            catch (Exception ignored) {}
                        }
                        // Raw responses are evidence only. No ACK meaning is guessed.
                    }
                }
                @Override @SuppressWarnings("deprecation") public void onCharacteristicChanged(BluetoothGatt g, BluetoothGattCharacteristic ch) {
                    onCharacteristicChanged(g, ch, ch == null ? null : ch.getValue());
                }
            }, BluetoothDevice.TRANSPORT_LE);
            if (activeGatt == null) retryOrFailLocked(-1, "ble_gatt_connect_start_failed");
            else schedulePhaseTimeoutLocked(token, 8000L, "ble_gatt_connect_timeout");
        } catch (SecurityException e) { fail("ble_permission_denied"); }
        catch (Exception e) { retryOrFailLocked(-1, "ble_gatt_connect_start_failed"); }
    }
    private void subscribeLocked(int token) {
        try {
            if (!activeGatt.setCharacteristicNotification(notifyCharacteristic, true)) { fail("astera_capture_notify_enable_failed"); return; }
            activeCccd = notifyCharacteristic.getDescriptor(CCCD_UUID);
            if (activeCccd == null) { fail("astera_capture_cccd_missing"); return; }
            schedulePhaseTimeoutLocked(token, 4000L, "ble_gatt_cccd_timeout");
            boolean ok;
            if (Build.VERSION.SDK_INT >= 33) ok = activeGatt.writeDescriptor(activeCccd, BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE) == BluetoothStatusCodes.SUCCESS;
            else { activeCccd.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE); ok = activeGatt.writeDescriptor(activeCccd); }
            event("cccd_write_start", "started", ok);
            if (!ok) fail("astera_capture_cccd_write_start_failed");
        } catch (SecurityException e) { fail("ble_permission_denied"); }
        catch (Exception e) { fail("astera_capture_subscription_exception"); }
    }
    private void recordReplyLocked(AsteraBtbReplyDecoder.Packet packet) {
        boolean binary = "binary_crc_valid_semantics_unknown".equals(packet.kind);
        boolean thisOperation = packet.operationId == operationId;
        if (thisOperation) {
            if (binary) { binaryReplyCount++; if (packet.empty) emptyBinaryReplyCount++; }
            else { xmlReplyCount++; if (packet.empty) emptyXmlReplyCount++; }
            if (packet.afterColorWrite) {
                if (binary) postColorBinaryReplyCount++; else postColorXmlReplyCount++;
            }
        }
        event("assembled_reply", "kind", packet.kind, "payloadLength", packet.payloadLength,
            "firstAtMs", packet.firstAtMs, "lastAtMs", packet.lastAtMs,
            "originOperationId", packet.operationId, "thisOperation", thisOperation,
            "afterColorWrite", packet.afterColorWrite, "meaningVerified", false);
        if (thisOperation && assembledReplySamples.length() < 128) {
            JSONObject sample = new JSONObject();
            try {
                sample.put("kind", packet.kind); sample.put("payloadLength", packet.payloadLength);
                sample.put("firstAtMs", packet.firstAtMs); sample.put("lastAtMs", packet.lastAtMs);
                sample.put("afterColorWrite", packet.afterColorWrite); sample.put("empty", packet.empty);
                sample.put("meaningVerified", false); assembledReplySamples.put(sample);
            } catch (Exception ignored) {}
        }
    }
    private void startBootstrapLocked() {
        writes.cancel();
        // Existing captured bytes only. Gaps are conservative pacing, not protocol semantics.
        writes.add("wake", decodeHex("0A"), 150L);
        writes.add("s0", "s0=0\n".getBytes(StandardCharsets.US_ASCII), 650L);
        writes.add("s1002", "s1002\n".getBytes(StandardCharsets.US_ASCII), 150L);
        writes.add("status", decodeHex("0A038D041E8312"), 850L);
        writes.add("radio", decodeHex("0A068804000000018853"), 250L);
        writes.add("stage", decodeHex("0A057F932700020A0A09"), 950L);
        writes.add("poll", decodeHex("0A017FC041"), 750L);
        writes.start();
    }
    private void sendColorLocked() {
        byte[] value = AsteraBtbCapturedFrames.frameFor(preset);
        if (!AsteraBtbCapturedFrames.isValidFrame(value)) { fail("astera_capture_frame_crc_invalid"); return; }
        writes.cancel(); writes.add("color", value, 650L); writes.start();
    }
    private boolean writeValueLocked(String label, byte[] value) {
        if (activeGatt == null || !gattConnected || writeCharacteristic == null) return false;
        if (!mtuVerified || !BleMtuPolicy.fitsWrite(effectiveMtu, value.length)) {
            fail("ble_gatt_payload_exceeds_verified_mtu"); return false;
        }
        try {
            int status;
            if (Build.VERSION.SDK_INT >= 33) status = activeGatt.writeCharacteristic(writeCharacteristic, value, BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE);
            else { writeCharacteristic.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE); writeCharacteristic.setValue(value); status = activeGatt.writeCharacteristic(writeCharacteristic) ? 0 : -1; }
            event("write_start", "label", label, "hex", hex(value), "status", status);
            if (status != 0) return false;
            proprietaryWriteSubmitted = true;
            if ("color".equals(label)) {
                finalColorWriteStarted = true; put("writeStarted", true); put("frame", hex(value));
                put("writeStartStatus", status); put("writeCallbackObserved", false);
            }
            return true;
        } catch (SecurityException e) { fail("ble_permission_denied"); return false; }
        catch (Exception e) { fail("astera_capture_write_exception"); return false; }
    }
    private void observeLocked() {
        final int token = generation;
        event("post_write_observation_start");
        observationRunnable = () -> { synchronized (lock) {
            if (token != generation || callback == null || !gattConnected) return;
            event("post_write_observation_complete", "postColorNotificationCount", postColorNotificationCount);
            complete();
        } };
        handler.postDelayed(observationRunnable, POST_WRITE_OBSERVATION_MS);
    }
    private void retryOrFailLocked(int status, String code) {
        if (BleReconnectPolicy.authenticationRequired(status)) { fail("astera_bond_required"); return; }
        boolean retry = BleReconnectPolicy.canRetry(status, attempt, deadlineMs - SystemClock.elapsedRealtime(), proprietaryWriteSubmitted);
        cancelOperationTimersLocked(); writes.cancel(); generation++; closeGattOnlyLocked();
        if (!retry) { fail(code); return; }
        long delay = BleReconnectPolicy.delayMs(status, attempt);
        event("retry_scheduled", "attempt", attempt + 1, "delayMs", delay, "status", status);
        final int token = generation;
        retryRunnable = () -> { synchronized (lock) {
            retryRunnable = null;
            if (token != generation || callback == null) return;
            connectAttemptLocked();
        } };
        handler.postDelayed(retryRunnable, delay);
        timeoutRunnable = () -> { synchronized (lock) { if (token <= generation && callback != null) fail("astera_capture_timeout"); } };
        handler.postDelayed(timeoutRunnable, Math.max(1L, deadlineMs - SystemClock.elapsedRealtime()));
    }
    private void complete() {
        put("transportReady", transportReady && gattConnected);
        put("notificationCount", notificationCount); put("postColorNotificationCount", postColorNotificationCount);
        put("notificationSamples", notificationSamples); put("deviceAppliedColorVerified", false);
        event("operation_complete", "connectionRetained", gattConnected, "sessionVerified", false);
        JSONObject result = snapshot(); Callback cb = callback; callback = null;
        cancelOperationTimersLocked(); preset = null; activeResult = null;
        if (cb != null) cb.onComplete(result);
    }
    private void fail(String code) {
        put("error", code); put("notificationSamples", notificationSamples);
        put("notificationCount", notificationCount); put("postColorNotificationCount", postColorNotificationCount);
        event("operation_error", "code", code);
        Callback cb = callback; callback = null;
        JSONObject result = snapshot();
        closeLocked(code);
        try {
            result.put("transportReady", false); result.put("closeReason", code);
            result.put("eventTimeline", new JSONArray(eventTimeline.toString()));
        }
        catch (Exception ignored) {}
        activeResult = null; preset = null;
        if (cb != null) cb.onError(result, code);
    }
    public void cancel() {
        synchronized (lock) {
            if (callback != null) fail("ble_operation_cancelled"); else closeLocked("operator_or_lifecycle_disconnect");
        }
    }
    private void closeLocked(String reason) {
        cancelOperationTimersLocked(); writes.cancel(); generation++;
        closeReason = reason; event("connection_close", "reason", reason);
        closeGattOnlyLocked(); emitState(reason);
        if (!"target_changed".equals(reason)) BleConnectionService.stop(context);
    }
    private void closeGattOnlyLocked() {
        BluetoothGatt gatt = activeGatt; activeGatt = null;
        boolean wasConnected = gattConnected; gattConnected = false; transportReady = false;
        proprietaryWriteSubmitted = false; writeCharacteristic = null; notifyCharacteristic = null; activeCccd = null;
        mtuPending = false; mtuVerified = false; effectiveMtu = 23; replies.reset();
        if (gatt != null) {
            if (wasConnected) { try { gatt.disconnect(); } catch (Exception ignored) {} }
            try { gatt.close(); } catch (Exception ignored) {}
        }
    }
    private void schedulePhaseTimeoutLocked(int token, long ms, String code) {
        if (phaseTimeoutRunnable != null) handler.removeCallbacks(phaseTimeoutRunnable);
        phaseTimeoutRunnable = () -> { synchronized (lock) {
            if (token == generation && callback != null) retryOrFailLocked(-1, code);
        } };
        handler.postDelayed(phaseTimeoutRunnable, ms);
    }
    private void cancelOperationTimersLocked() {
        if (phaseTimeoutRunnable != null) handler.removeCallbacks(phaseTimeoutRunnable);
        phaseTimeoutRunnable = null;
        if (timeoutRunnable != null) handler.removeCallbacks(timeoutRunnable);
        if (retryRunnable != null) handler.removeCallbacks(retryRunnable);
        if (observationRunnable != null) handler.removeCallbacks(observationRunnable);
        timeoutRunnable = null; retryRunnable = null; observationRunnable = null;
    }
    private void emitState(String reason) { if (stateListener != null) stateListener.onState(activeAddress, transportReady && gattConnected, reason); }
    private void event(String type, Object... pairs) {
        try {
            JSONObject e = new JSONObject(); e.put("type", type); e.put("atMs", SystemClock.elapsedRealtime()); e.put("attempt", attempt);
            for (int i = 0; i + 1 < pairs.length; i += 2) e.put(String.valueOf(pairs[i]), pairs[i+1]);
            if (eventTimeline.length() >= 256) eventTimeline.remove(0);
            eventTimeline.put(e);
        } catch (Exception ignored) {}
    }
    private void put(String key, Object value) { try { if (activeResult != null) activeResult.put(key, value); } catch (Exception ignored) {} }
    private JSONObject snapshot() {
        put("eventTimeline", eventTimeline); put("closeReason", closeReason);
        put("binaryReplyCount", binaryReplyCount); put("emptyBinaryReplyCount", emptyBinaryReplyCount);
        put("xmlReplyCount", xmlReplyCount); put("emptyXmlReplyCount", emptyXmlReplyCount);
        put("postColorBinaryReplyCount", postColorBinaryReplyCount); put("postColorXmlReplyCount", postColorXmlReplyCount);
        put("assembledReplies", assembledReplySamples); put("droppedNotificationSamples", droppedNotificationSamples);
        put("replyFramingInterpretation", "observed_candidate_no_session_or_color_ack");
        put("bufferedBinaryBytes", replies.bufferedBinaryBytes());
        put("bufferedXmlCharacters", replies.bufferedXmlCharacters());
        put("invalidBinaryCandidates", replies.invalidBinaryCandidates());
        put("discardedXmlPrefixes", replies.discardedXmlPrefixes());
        try { return activeResult == null ? new JSONObject() : new JSONObject(activeResult.toString()); }
        catch (Exception e) { return new JSONObject(); }
    }
    private static String hex(byte[] value) {
        if (value == null) return "";
        StringBuilder b = new StringBuilder(); for (byte v : value) b.append(String.format(Locale.US, "%02X", v & 255)); return b.toString();
    }
    private static byte[] decodeHex(String s) {
        byte[] value = new byte[s.length()/2];
        for (int i=0; i<value.length; i++) value[i]=(byte)Integer.parseInt(s.substring(i*2,i*2+2),16);
        return value;
    }
    private static void deliverError(Callback cb, JSONObject result, String code) {
        try { result.put("error", code); } catch (Exception ignored) {}
        if (cb != null) cb.onError(result, code);
    }
}
