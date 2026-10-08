package com.lightingai.app;

import java.util.ArrayDeque;

/** One Android GATT operation at a time. A local callback is never a fixture ACK. */
public final class BleOperationQueue {
    public interface Scheduler {
        void post(Runnable task, long delayMs);
        void remove(Runnable task);
    }
    public interface Listener {
        boolean submit(String label, byte[] value);
        void completed(String label, int status);
        void finished();
        void failed(String code);
    }
    private static final class Entry {
        final String label;
        final byte[] value;
        final long delayMs;
        Entry(String label, byte[] value, long delayMs) {
            this.label = label; this.value = value.clone(); this.delayMs = delayMs;
        }
    }
    private final Scheduler scheduler;
    private final Listener listener;
    private final ArrayDeque<Entry> entries = new ArrayDeque<>();
    private Entry pending;
    private Runnable delayed, timeout;
    private int generation;
    private boolean running;
    public BleOperationQueue(Scheduler scheduler, Listener listener) {
        this.scheduler = scheduler; this.listener = listener;
    }
    public void add(String label, byte[] value, long delayMs) {
        if (running) throw new IllegalStateException("queue_running");
        if (value == null || value.length == 0) throw new IllegalArgumentException("empty_payload");
        entries.add(new Entry(label, value, Math.max(0L, delayMs)));
    }
    public void start() {
        if (running) throw new IllegalStateException("queue_running");
        running = true; advance();
    }
    private void advance() {
        pending = null;
        if (entries.isEmpty()) { running = false; listener.finished(); return; }
        final Entry next = entries.remove();
        final int token = generation;
        delayed = () -> {
            delayed = null;
            if (token != generation || !running) return;
            pending = next;
            timeout = () -> { if (token == generation && pending == next) fail("ble_write_callback_timeout"); };
            scheduler.post(timeout, 4000L);
            if (!listener.submit(next.label, next.value.clone()) && pending == next) fail("ble_write_start_failed");
        };
        scheduler.post(delayed, next.delayMs);
    }
    public void onCallback(int status) {
        if (!running || pending == null) return;
        Entry completed = pending;
        pending = null;
        if (timeout != null) scheduler.remove(timeout);
        timeout = null;
        listener.completed(completed.label, status);
        // The listener can cancel on an application error.
        if (!running) return;
        if (status != 0) { fail("ble_write_status_" + status); return; }
        advance();
    }
    public String pendingLabel() { return pending == null ? "" : pending.label; }
    public void cancel() {
        generation++; running = false; pending = null; entries.clear();
        if (delayed != null) scheduler.remove(delayed);
        if (timeout != null) scheduler.remove(timeout);
        delayed = null; timeout = null;
    }
    private void fail(String code) { cancel(); listener.failed(code); }
}
