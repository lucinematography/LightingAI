package com.lightingai.app;

import java.net.DatagramSocket;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

public final class ArtNetLiveEngine {
    private static final long LIVE_PERIOD_MS = 33L;
    private static final long KEEPALIVE_PERIOD_MS = 900L;

    private static final class Frame {
        final String targetIp;
        final int portAddress;
        final int[] channels;

        Frame(String targetIp, int portAddress, int[] channels) {
            this.targetIp = targetIp;
            this.portAddress = portAddress;
            this.channels = channels;
        }
    }

    private final Map<String, Frame> frames = new ConcurrentHashMap<>();
    private final ArtNetSequenceTracker sequenceTracker;
    private final AtomicLong packetsSent = new AtomicLong(0);
    private final AtomicLong packetsFailed = new AtomicLong(0);
    private final AtomicLong lastSendAtMs = new AtomicLong(0);
    private volatile String lastError = "";
    private volatile String networkSignature = "";
    private final Object lock = new Object();

    private ScheduledExecutorService executor;
    private ScheduledFuture<?> task;
    private DatagramSocket socket;
    private long periodMs = KEEPALIVE_PERIOD_MS;

    public ArtNetLiveEngine() {
        this(new ArtNetSequenceTracker());
    }

    ArtNetLiveEngine(ArtNetSequenceTracker sequenceTracker) {
        this.sequenceTracker = sequenceTracker == null ? new ArtNetSequenceTracker() : sequenceTracker;
    }

    public void setFrame(String targetIp, int portAddress, int[] channels) throws Exception {
        setLiveFrame(targetIp, portAddress, channels);
    }

    public void setLiveFrame(String targetIp, int portAddress, int[] channels) throws Exception {
        setFrameInternal(targetIp, portAddress, channels, true);
    }

    public void setKeepaliveFrame(String targetIp, int portAddress, int[] channels) throws Exception {
        setFrameInternal(targetIp, portAddress, channels, false);
    }

    public void setKeepaliveRate() throws Exception {
        synchronized (lock) {
            ensureRunningLocked(false);
        }
    }

    private void setFrameInternal(String targetIp, int portAddress, int[] channels, boolean liveRate) throws Exception {
        String ip = normalizeIp(targetIp);
        int u = ArtNetSender.validatePortAddress(portAddress);
        String currentNetwork = NetworkInterfaceInspector.signature();
        if (currentNetwork.isEmpty()) throw new IllegalStateException("No active network for Art-Net");
        ArtNetSender.validateFullFrame(channels);
        int[] copy = Arrays.copyOf(channels, 512);
        synchronized (lock) {
            if (!networkSignature.isEmpty() && !networkSignature.equals(currentNetwork)) {
                throw new IllegalStateException("Network changed; re-arm required");
            }
            if (frames.isEmpty()) lastError = "";
            networkSignature = currentNetwork;
            frames.put(key(ip, u), new Frame(ip, u, copy));
            ensureRunningLocked(liveRate);
        }
    }

    public void removeFrame(String targetIp, int portAddress) {
        frames.remove(key(normalizeIp(targetIp), ArtNetSender.validatePortAddress(portAddress)));
        stopIfIdle();
    }

    public int activeFrameCount() {
        return frames.size();
    }

    public long packetsSent() {
        return packetsSent.get();
    }

    public long packetsFailed() {
        return packetsFailed.get();
    }

    public long lastSendAtMs() {
        return lastSendAtMs.get();
    }

    public String lastError() {
        return lastError == null ? "" : lastError;
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
            socket = null;
            networkSignature = "";
        }
    }

    private void stopIfIdle() {
        if (!frames.isEmpty()) return;
        stopAll();
    }

    private void ensureRunningLocked(boolean liveRate) throws Exception {
        if (socket == null || socket.isClosed()) {
            socket = ArtNetSocketManager.socket();
        }
        if (executor == null || executor.isShutdown()) {
            executor = Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "LightingAI-ArtNet-Live");
                t.setDaemon(true);
                return t;
            });
        }
        long desired = liveRate ? LIVE_PERIOD_MS : KEEPALIVE_PERIOD_MS;
        if (task == null || task.isCancelled() || task.isDone() || periodMs != desired) {
            if (task != null) task.cancel(false);
            periodMs = desired;
            task = executor.scheduleAtFixedRate(this::tick, 0L, periodMs, TimeUnit.MILLISECONDS);
        }
    }

    private void tick() {
        DatagramSocket activeSocket;
        synchronized (lock) {
            activeSocket = socket;
        }
        if (activeSocket == null || activeSocket.isClosed()) return;
        String currentNetwork = NetworkInterfaceInspector.signature();
        if (networkSignature.isEmpty() || currentNetwork.isEmpty() || !networkSignature.equals(currentNetwork)) {
            packetsFailed.incrementAndGet();
            lastError = "Network changed; re-arm required";
            stopAll();
            return;
        }

        for (Frame frame : frames.values()) {
            try {
                String routeNow = NetworkInterfaceInspector.signature();
                if (networkSignature.isEmpty() || routeNow.isEmpty() || !networkSignature.equals(routeNow)) {
                    throw new IllegalStateException("Network changed; re-arm required");
                }
                int seq = sequenceTracker.next(frame.targetIp, frame.portAddress);
                ArtNetSender.sendDmx(activeSocket, frame.targetIp, frame.portAddress, frame.channels, seq);
                packetsSent.incrementAndGet();
                lastSendAtMs.set(System.currentTimeMillis());
            } catch (Exception e) {
                packetsFailed.incrementAndGet();
                lastError = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
                stopAll();
                return;
            }
        }
        lastError = "";
    }

    private static String normalizeIp(String targetIp) {
        return ArtNetSender.normalizeTarget(targetIp);
    }

    private static String key(String targetIp, int portAddress) {
        return normalizeIp(targetIp) + "|" + ArtNetSender.validatePortAddress(portAddress);
    }
}
