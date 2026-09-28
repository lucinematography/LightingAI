package com.lightingai.app;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InterfaceAddress;
import java.net.NetworkInterface;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.Enumeration;

public final class ArtNetDiscovery {
    private static final Object DISCOVERY_LOCK = new Object();
    private static final byte[] ARTNET_ID = "Art-Net\0".getBytes(StandardCharsets.US_ASCII);
    private static final int POLL_PACKET_LENGTH = 14;
    private static final int REPLY_MIN_LENGTH = 207;

    public static final class Node {
        public final String ip;
        public final String shortName;
        public final String longName;
        public final List<Integer> subscriptions;
        public final boolean subscriptionDataPresent;

        Node(String ip, String shortName, String longName, List<Integer> subscriptions, boolean subscriptionDataPresent) {
            this.ip = ip;
            this.shortName = shortName;
            this.longName = longName;
            this.subscriptions = subscriptions == null ? new ArrayList<>() : new ArrayList<>(subscriptions);
            this.subscriptionDataPresent = subscriptionDataPresent;
        }
    }

    private ArtNetDiscovery() {}

    public static List<Node> discover(int timeoutMs) throws Exception {
        synchronized (DISCOVERY_LOCK) {
            int boundedTimeout = Math.max(250, Math.min(3000, timeoutMs));
            Map<String, Node> nodes = new LinkedHashMap<>();
            DatagramSocket socket = ArtNetSocketManager.socket();
            int previousTimeout = socket.getSoTimeout();
            try {
                socket.setSoTimeout(120);

                byte[] poll = buildPollPacket();
                for (InetAddress broadcast : broadcastTargets()) {
                    try {
                        DatagramPacket outgoing = new DatagramPacket(
                            poll,
                            poll.length,
                            broadcast,
                            ArtNetSender.ARTNET_PORT
                        );
                        socket.send(outgoing);
                    } catch (Exception ignored) {
                        // One interface may be unavailable while another is valid.
                    }
                }

                long deadline = System.currentTimeMillis() + boundedTimeout;
                byte[] buffer = new byte[1024];
                while (System.currentTimeMillis() < deadline) {
                    DatagramPacket incoming = new DatagramPacket(buffer, buffer.length);
                    try {
                        socket.receive(incoming);
                    } catch (SocketTimeoutException timeout) {
                        continue;
                    }
                    Node node = parseReply(incoming.getData(), incoming.getLength(), incoming.getAddress());
                    if (node != null && !node.ip.isEmpty()) {
                        Node existing = nodes.get(node.ip);
                        nodes.put(node.ip, existing == null ? node : mergeNode(existing, node));
                    }
                }
            } finally {
                if (!socket.isClosed()) {
                    try { socket.setSoTimeout(previousTimeout); } catch (Exception ignored) {}
                }
            }
            return new ArrayList<>(nodes.values());
        }
    }

    static List<InetAddress> directedBroadcastTargets() throws Exception {
        Set<InetAddress> targets = new LinkedHashSet<>();
        Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
        if (interfaces != null) {
            while (interfaces.hasMoreElements()) {
                NetworkInterface network = interfaces.nextElement();
                try {
                    if (!network.isUp() || network.isLoopback()) continue;
                    for (InterfaceAddress address : network.getInterfaceAddresses()) {
                        InetAddress broadcast = address.getBroadcast();
                        if (broadcast != null && !"255.255.255.255".equals(broadcast.getHostAddress())) {
                            targets.add(broadcast);
                        }
                    }
                } catch (Exception ignored) {
                    // Continue through the remaining network interfaces.
                }
            }
        }
        return new ArrayList<>(targets);
    }

    static List<InetAddress> broadcastTargets() throws Exception {
        // Art-Net discovery uses directed broadcast only. Limited broadcast
        // (255.255.255.255) is intentionally excluded.
        return directedBroadcastTargets();
    }

    static byte[] buildPollPacket() {
        byte[] packet = new byte[POLL_PACKET_LENGTH];
        System.arraycopy(ARTNET_ID, 0, packet, 0, ARTNET_ID.length);
        packet[8] = 0x00;
        packet[9] = 0x20;
        packet[10] = 0x00;
        packet[11] = 0x0e;
        packet[12] = 0x02;
        packet[13] = 0x00;
        return packet;
    }

    static Node parseReply(byte[] data, int length, InetAddress sourceAddress) {
        if (data == null || length < REPLY_MIN_LENGTH) return null;
        for (int i = 0; i < ARTNET_ID.length; i++) if (data[i] != ARTNET_ID[i]) return null;
        if ((data[8] & 0xff) != 0x00 || (data[9] & 0xff) != 0x21) return null;

        String packetIp =
            (data[10] & 0xff) + "." + (data[11] & 0xff) + "." +
            (data[12] & 0xff) + "." + (data[13] & 0xff);
        String sourceIp = sourceAddress == null ? "" : sourceAddress.getHostAddress();
        String ip = isUsableIp(packetIp) ? packetIp : sourceIp;

        boolean subscriptionDataPresent = length >= 194;
        Set<Integer> subscriptions = new LinkedHashSet<>();
        if (subscriptionDataPresent) {
            int net = data[18] & 0x7f;
            int subnet = data[19] & 0x0f;
            for (int i = 0; i < 4; i++) {
                int portType = data[174 + i] & 0xff;
                if ((portType & 0x40) != 0) {
                    subscriptions.add(portAddress(net, subnet, data[186 + i] & 0x0f));
                }
                if ((portType & 0x80) != 0) {
                    subscriptions.add(portAddress(net, subnet, data[190 + i] & 0x0f));
                }
            }
        }
        return new Node(
            ip,
            ascii(data, 26, 18, length),
            ascii(data, 44, 64, length),
            new ArrayList<>(subscriptions),
            subscriptionDataPresent
        );
    }

    static Node mergeNode(Node existing, Node incoming) {
        if (existing == null) return incoming;
        if (incoming == null) return existing;
        if (!existing.ip.equals(incoming.ip)) {
            throw new IllegalArgumentException("Art-Net node merge requires the same IP");
        }
        Set<Integer> merged = new LinkedHashSet<>(existing.subscriptions);
        merged.addAll(incoming.subscriptions);
        String shortName = existing.shortName == null || existing.shortName.isEmpty() ? incoming.shortName : existing.shortName;
        String longName = existing.longName == null || existing.longName.isEmpty() ? incoming.longName : existing.longName;
        return new Node(
            existing.ip,
            shortName,
            longName,
            new ArrayList<>(merged),
            existing.subscriptionDataPresent || incoming.subscriptionDataPresent
        );
    }

    static boolean isDirectedBroadcastTarget(String value) {
        if (value == null || value.trim().isEmpty()) return false;
        String target = value.trim();
        try {
            for (InetAddress address : directedBroadcastTargets()) {
                if (target.equals(address.getHostAddress())) return true;
            }
        } catch (Exception ignored) {
            // If interfaces cannot be inspected, the sender will still reject AUTO/limited broadcast.
        }
        return false;
    }

    private static int portAddress(int net, int subnet, int universe) {
        return ((net & 0x7f) << 8) | ((subnet & 0x0f) << 4) | (universe & 0x0f);
    }

    private static boolean isUsableIp(String ip) {
        return ip != null && !ip.isEmpty() && !"0.0.0.0".equals(ip);
    }

    private static String ascii(byte[] data, int offset, int maxLength, int actualLength) {
        if (offset >= actualLength) return "";
        int end = Math.min(actualLength, offset + maxLength);
        int stop = offset;
        while (stop < end && data[stop] != 0) stop++;
        return new String(data, offset, Math.max(0, stop - offset), StandardCharsets.US_ASCII).trim();
    }
}
