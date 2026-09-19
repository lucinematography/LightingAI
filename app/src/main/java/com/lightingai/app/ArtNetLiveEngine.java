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

public final class ArtNetLiveEngine {
    private static final long PERIOD_MS = 33L;

    private static final class Frame {
        final String targetIp;
        final int universe;
        final int[] channels;

        Frame(String targetIp, int universe, int[] channels) {
            this.targetIp = targetIp;
            this.universe = universe;
            this.channels = channels;
        }
    }

    private final Map<String, Frame> frames = new ConcurrentHashMap<>();
    private final AtomicInteger sequence = new AtomicInteger(1);
    private final Object lock = new Object();

    private ScheduledExecutorService executor;
    private ScheduledFuture<?> task;
    private DatagramSocket socket;

    public void setFrame(String targetIp, int universe, int[] channels) throws Exception {
        String ip = normalizeIp(targetIp);
        int u = Math.max(1, universe);
        int[] copy = channels == null ? new int[0] : Arrays.copyOf(channels, Math.min(512, channels.length));
        synchronized (lock) {
            ensureRunningLocked();
            frames.put(key(ip, u), new Frame(ip, u, copy));
        }
    }

    public void removeFrame(String targetIp, int universe) {
        frames.remove(key(normalizeIp(targetIp), Math.max(1, universe)));
        stopIfIdle();
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

    private void stopIfIdle() {
        if (!frames.isEmpty()) return;
        stopAll();
    }

    private void ensureRunningLocked() throws Exception {
        if (socket == null || socket.isClosed()) {
            socket = new DatagramSocket();
            socket.setBroadcast(true);
        }
        if (executor == null || executor.isShutdown()) {
            executor = Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "LightingAI-ArtNet-Live");
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
                int seq = sequence.getAndUpdate(v -> v >= 255 ? 1 : v + 1);
                ArtNetSender.sendDmx(activeSocket, frame.targetIp, frame.universe, frame.channels, seq);
            } catch (Exception ignored) {
                // Keep the engine alive; a later frame/network state may recover.
            }
        }
    }

    private static String normalizeIp(String targetIp) {
        if (targetIp == null || targetIp.trim().isEmpty()) return "255.255.255.255";
        return targetIp.trim();
    }

    private static String key(String targetIp, int universe) {
        return normalizeIp(targetIp) + "|" + Math.max(1, universe);
    }
}
