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
import java.util.concurrent.atomic.AtomicLong;

public final class SacnLiveEngine {
    private static final long LIVE_PERIOD_MS = 33L;
    private static final long KEEPALIVE_PERIOD_MS = 900L;

    private static final class Frame {
        final int universe;
        final int[] channels;

        Frame(int universe, int[] channels) {
            this.universe = universe;
            this.channels = channels;
        }
    }

    private final Map<Integer, Frame> frames = new ConcurrentHashMap<>();
    private final SacnSequenceTracker sequenceTracker;
    private final AtomicInteger priority = new AtomicInteger(SacnSender.DEFAULT_PRIORITY);
    private final AtomicLong packetsSent = new AtomicLong(0);
    private final AtomicLong packetsFailed = new AtomicLong(0);
    private final AtomicLong lastSendAtMs = new AtomicLong(0);
    private volatile String lastError = "";
    private volatile String networkSignature = "";
    private final Object lock = new Object();
    private final byte[] cid;
    private final String sourceName;

    private ScheduledExecutorService executor;
    private ScheduledFuture<?> task;
    private DatagramSocket socket;
    private long periodMs = KEEPALIVE_PERIOD_MS;

    public SacnLiveEngine(byte[] cid, String sourceName) {
        this(cid, sourceName, new SacnSequenceTracker());
    }

    SacnLiveEngine(byte[] cid, String sourceName, SacnSequenceTracker sequenceTracker) {
        this.cid = cid == null ? new byte[16] : Arrays.copyOf(cid, 16);
        this.sourceName = sourceName == null || sourceName.trim().isEmpty() ? "LightingAI" : sourceName.trim();
        this.sequenceTracker = sequenceTracker == null ? new SacnSequenceTracker() : sequenceTracker;
    }

    public void setFrame(int universe, int[] channels) throws Exception {
        setLiveFrame(universe, channels);
    }

    public void setLiveFrame(int universe, int[] channels) throws Exception {
        setFrameInternal(universe, channels, true);
    }

    public void setKeepaliveFrame(int universe, int[] channels) throws Exception {
        setFrameInternal(universe, channels, false);
    }

    public void setKeepaliveRate() throws Exception {
        synchronized (lock) {
            ensureRunningLocked(false);
        }
    }

    private void setFrameInternal(int universe, int[] channels, boolean liveRate) throws Exception {
        int u = SacnSender.validateUniverse(universe);
        String currentNetwork = NetworkInterfaceInspector.signature();
        if (currentNetwork.isEmpty()) throw new IllegalStateException("No active network for sACN");
        SacnSender.validateFullFrame(channels);
        int[] copy = Arrays.copyOf(channels, 512);
        synchronized (lock) {
            if (!networkSignature.isEmpty() && !networkSignature.equals(currentNetwork)) {
                throw new IllegalStateException("Network changed; re-arm required");
            }
            if (frames.isEmpty()) lastError = "";
            networkSignature = currentNetwork;
            frames.put(u, new Frame(u, copy));
            ensureRunningLocked(liveRate);
        }
    }

    public int activeFrameCount() {
        return frames.size();
    }

    public void setPriority(int value) {
        priority.set(SacnSender.normalizePriority(value));
    }

    public int priority() {
        return priority.get();
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

    public boolean stopAll() {
        return stopAll(true);
    }

    private void abortAll() {
        stopAll(false);
    }

    private boolean stopAll(boolean sendTerminationPackets) {
        synchronized (lock) {
            if (task != null) {
                task.cancel(false);
                task = null;
            }
            String currentNetwork = sendTerminationPackets ? NetworkInterfaceInspector.signature() : "";
            boolean terminationRouteSafe = sendTerminationPackets &&
                !networkSignature.isEmpty() &&
                !currentNetwork.isEmpty() &&
                networkSignature.equals(currentNetwork);
            if (sendTerminationPackets && !frames.isEmpty() && !terminationRouteSafe) {
                lastError = "Network changed; sACN termination suppressed";
            } else if (sendTerminationPackets && socket != null && !socket.isClosed() && !frames.isEmpty()) {
                String terminationError = "";
                boolean terminationFailed = false;
                for (int repeat = 0; repeat < 3; repeat++) {
                    for (Frame frame : frames.values()) {
                        try {
                            SacnSender.sendTermination(
                                socket,
                                frame.universe,
                                frame.channels,
                                nextSequence(frame.universe),
                                cid,
                                sourceName,
                                priority.get()
                            );
                            packetsSent.incrementAndGet();
                            lastSendAtMs.set(System.currentTimeMillis());
                        } catch (Exception e) {
                            packetsFailed.incrementAndGet();
                            terminationFailed = true;
                            String message = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
                            if (terminationError.isEmpty()) terminationError = message;
                        }
                    }
                }
                lastError = terminationFailed ? terminationError : "";
            }
            frames.clear();
            if (executor != null) {
                executor.shutdownNow();
                executor = null;
            }
            if (socket != null) {
                socket.close();
                socket = null;
            }
            networkSignature = "";
            return lastError == null || lastError.isEmpty();
        }
    }

    private void ensureRunningLocked(boolean liveRate) throws Exception {
        if (socket == null || socket.isClosed()) socket = SacnSender.openMulticastSocket();
        if (executor == null || executor.isShutdown()) {
            executor = Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "LightingAI-sACN-Live");
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

    private int nextSequence(int universe) {
        return sequenceTracker.next(universe);
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
            abortAll();
            return;
        }

        for (Frame frame : frames.values()) {
            try {
                String routeNow = NetworkInterfaceInspector.signature();
                if (networkSignature.isEmpty() || routeNow.isEmpty() || !networkSignature.equals(routeNow)) {
                    throw new IllegalStateException("Network changed; re-arm required");
                }
                SacnSender.sendDmx(activeSocket, frame.universe, frame.channels, nextSequence(frame.universe), cid, sourceName, priority.get());
                packetsSent.incrementAndGet();
                lastSendAtMs.set(System.currentTimeMillis());
            } catch (Exception e) {
                packetsFailed.incrementAndGet();
                lastError = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
                abortAll();
                return;
            }
        }
        lastError = "";
    }
}
