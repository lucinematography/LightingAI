package com.lightingai.app;

import java.net.DatagramSocket;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public final class SacnLiveEngine {
    private static final long PERIOD_MS = 33L;

    private static final class Frame {
        final int universe;
        final int[] channels;

        Frame(int universe, int[] channels) {
            this.universe = universe;
            this.channels = channels;
        }
    }

    private final Map<Integer, Frame> frames = new ConcurrentHashMap<>();
    private final AtomicInteger sequence = new AtomicInteger(0);
    private final Object lock = new Object();
    private final byte[] cid;
    private final String sourceName;

    private ScheduledExecutorService executor;
    private ScheduledFuture<?> task;
    private DatagramSocket socket;

    public SacnLiveEngine(byte[] cid, String sourceName) {
        this.cid = cid == null ? new byte[16] : Arrays.copyOf(cid, 16);
        this.sourceName = sourceName == null || sourceName.trim().isEmpty() ? "LightingAI" : sourceName.trim();
    }

    public void setFrame(int universe, int[] channels) throws Exception {
        int u = Math.max(SacnSender.MIN_UNIVERSE, Math.min(SacnSender.MAX_UNIVERSE, universe));
        int[] copy = channels == null ? new int[0] : Arrays.copyOf(channels, Math.min(512, channels.length));
        synchronized (lock) {
            ensureRunningLocked();
            frames.put(u, new Frame(u, copy));
        }
    }

    public int activeFrameCount() {
        return frames.size();
    }

    public void stopAll() {
        synchronized (lock) {
            frames.clear();
            if (task != null) {
                task.cancel(false);
                task = null;
            }
            if (executor != null) {
                executor.shutdownNow();
                executor = null;
            }
            if (socket != null) {
                socket.close();
                socket = null;
            }
        }
    }

    private void ensureRunningLocked() throws Exception {
        if (socket == null || socket.isClosed()) socket = new DatagramSocket();
        if (executor == null || executor.isShutdown()) {
            executor = Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "LightingAI-sACN-Live");
                t.setDaemon(true);
                return t;
            });
        }
        if (task == null || task.isCancelled() || task.isDone()) {
            task = executor.scheduleAtFixedRate(this::tick, 0L, PERIOD_MS, TimeUnit.MILLISECONDS);
        }
    }

    private void tick() {
        DatagramSocket activeSocket;
        synchronized (lock) {
            activeSocket = socket;
        }
        if (activeSocket == null || activeSocket.isClosed()) return;

        for (Frame frame : frames.values()) {
            try {
                int seq = sequence.getAndUpdate(v -> v >= 255 ? 0 : v + 1);
                SacnSender.sendDmx(activeSocket, frame.universe, frame.channels, seq, cid, sourceName);
            } catch (Exception ignored) {
                // Keep refreshing; transient Wi-Fi/network failures may recover.
            }
        }
    }
}
