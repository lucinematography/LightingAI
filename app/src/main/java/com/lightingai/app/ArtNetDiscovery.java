package com.lightingai.app;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetSocketAddress;
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
    private static final byte[] ARTNET_ID = "Art-Net\0".getBytes(StandardCharsets.US_ASCII);
    private static final int POLL_PACKET_LENGTH = 14;
    private static final int REPLY_MIN_LENGTH = 207;

    public static final class OutputPort {
        public final int index;
        public final int universe;
        public final boolean active;
        public final boolean sacnSelected;

        OutputPort(int index, int universe, boolean active, boolean sacnSelected) {
            this.index = index;
            this.universe = universe;
            this.active = active;
            this.sacnSelected = sacnSelected;
        }
    }

    public static final class Node {
        public final String ip;
        public final String shortName;
        public final String longName;
        public final String nodeReport;
        public final int firmwareVersion;
        public final int numPorts;
        public final int acnPriority;
        public final int bindIndex;
        public final int style;
        public final int maxRefreshRateHz;
        public final boolean rdmCapable;
        public final boolean canSwitchArtNetSacn;
        public final boolean supports15BitPortAddress;
        public final boolean dhcpCapable;
        public final boolean dhcpConfigured;
        public final String mac;
        public final List<OutputPort> outputs;

        Node(
            String ip,
            String shortName,
            String longName,
            String nodeReport,
            int firmwareVersion,
            int numPorts,
            int acnPriority,
            int bindIndex,
            int style,
            int maxRefreshRateHz,
            boolean rdmCapable,
            boolean canSwitchArtNetSacn,
            boolean supports15BitPortAddress,
            boolean dhcpCapable,
            boolean dhcpConfigured,
            String mac,
            List<OutputPort> outputs
        ) {
            this.ip = ip;
            this.shortName = shortName;
            this.longName = longName;
            this.nodeReport = nodeReport;
            this.firmwareVersion = firmwareVersion;
            this.numPorts = numPorts;
            this.acnPriority = acnPriority;
            this.bindIndex = bindIndex;
            this.style = style;
            this.maxRefreshRateHz = maxRefreshRateHz;
            this.rdmCapable = rdmCapable;
            this.canSwitchArtNetSacn = canSwitchArtNetSacn;
            this.supports15BitPortAddress = supports15BitPortAddress;
            this.dhcpCapable = dhcpCapable;
            this.dhcpConfigured = dhcpConfigured;
            this.mac = mac;
            this.outputs = outputs;
        }
    }

    private ArtNetDiscovery() {}

    public static List<Node> discover(int timeoutMs) throws Exception {
        int boundedTimeout = Math.max(250, Math.min(3000, timeoutMs));
        Map<String, Node> nodes = new LinkedHashMap<>();

        try (DatagramSocket socket = new DatagramSocket(null)) {
            socket.setReuseAddress(true);
            socket.setBroadcast(true);
            socket.bind(new InetSocketAddress(ArtNetSender.ARTNET_PORT));
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
                if (node != null && !node.ip.isEmpty()) nodes.put(node.ip, node);
            }
        }
        return new ArrayList<>(nodes.values());
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
        Set<InetAddress> targets = new LinkedHashSet<>(directedBroadcastTargets());
        // ArtPoll may also use limited broadcast during initial discovery.
        targets.add(InetAddress.getByName("255.255.255.255"));
        return new ArrayList<>(targets);
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

        int firmwareVersion = ((data[16] & 0xff) << 8) | (data[17] & 0xff);
        int netSwitch = data[18] & 0x7f;
        int subSwitch = data[19] & 0x0f;
        int status1 = data[23] & 0xff;
        int numPorts = Math.min(4, ((data[172] & 0xff) << 8) | (data[173] & 0xff));
        int acnPriority = data[194] & 0xff;
        int style = data[200] & 0xff;
        int bindIndex = byteAt(data, length, 211);
        int status2 = byteAt(data, length, 212);
        int refreshRaw = (byteAt(data, length, 226) << 8) | byteAt(data, length, 227);
        int maxRefreshRateHz = refreshRaw <= 44 ? 44 : refreshRaw;

        List<OutputPort> outputs = new ArrayList<>();
        for (int i = 0; i < numPorts; i++) {
            int portType = data[174 + i] & 0xff;
            if ((portType & 0x80) == 0) continue;
            int swOut = data[190 + i] & 0x0f;
            int portAddress = (netSwitch << 8) | (subSwitch << 4) | swOut;
            int goodOutput = data[182 + i] & 0xff;
            outputs.add(new OutputPort(
                i + 1,
                portAddress + 1,
                (goodOutput & 0x80) != 0,
                (goodOutput & 0x01) != 0
            ));
        }

        return new Node(
            ip,
            ascii(data, 26, 18, length),
            ascii(data, 44, 64, length),
            ascii(data, 108, 64, length),
            firmwareVersion,
            numPorts,
            acnPriority,
            bindIndex,
            style,
            maxRefreshRateHz,
            (status1 & 0x02) != 0,
            (status2 & 0x10) != 0,
            (status2 & 0x08) != 0,
            (status2 & 0x04) != 0,
            (status2 & 0x02) != 0,
            mac(data, length),
            outputs
        );
    }

    private static boolean isUsableIp(String ip) {
        return ip != null && !ip.isEmpty() && !"0.0.0.0".equals(ip);
    }

    private static int byteAt(byte[] data, int length, int offset) {
        return data != null && offset >= 0 && offset < length ? data[offset] & 0xff : 0;
    }

    private static String mac(byte[] data, int length) {
        if (data == null || length < 207) return "";
        StringBuilder out = new StringBuilder();
        for (int i = 201; i <= 206; i++) {
            if (i > 201) out.append(':');
            out.append(String.format(java.util.Locale.US, "%02X", data[i] & 0xff));
        }
        return out.toString();
    }

    private static String ascii(byte[] data, int offset, int maxLength, int actualLength) {
        if (offset >= actualLength) return "";
        int end = Math.min(actualLength, offset + maxLength);
        int stop = offset;
        while (stop < end && data[stop] != 0) stop++;
        return new String(data, offset, Math.max(0, stop - offset), StandardCharsets.US_ASCII).trim();
    }
}
