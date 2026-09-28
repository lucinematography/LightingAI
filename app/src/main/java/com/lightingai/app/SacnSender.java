package com.lightingai.app;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.MulticastSocket;
import java.net.NetworkInterface;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.TreeSet;

public final class SacnSender {
    public static final int SACN_PORT = 5568;
    public static final int MIN_UNIVERSE = 1;
    public static final int MAX_UNIVERSE = 63999;
    public static final int DEFAULT_PRIORITY = 100;
    public static final int MAX_PRIORITY = 200;
    static final int DISCOVERY_UNIVERSE = 64214;
    static final String DISCOVERY_MULTICAST_ADDRESS = "239.255.250.214";
    static final int DISCOVERY_PAGE_SIZE = 512;
    private static final byte[] ACN_PACKET_ID = new byte[]{
        0x41,0x53,0x43,0x2d,0x45,0x31,0x2e,0x31,0x37,0x00,0x00,0x00
    };

    private SacnSender() {}

    public static void sendDmx(int universe, int[] channels, int sequence, byte[] cid, String sourceName) throws Exception {
        sendDmx(universe, channels, sequence, cid, sourceName, DEFAULT_PRIORITY);
    }

    public static void sendDmx(int universe, int[] channels, int sequence, byte[] cid, String sourceName, int priority) throws Exception {
        try (DatagramSocket socket = openMulticastSocket()) {
            sendDmx(socket, universe, channels, sequence, cid, sourceName, priority);
        }
    }

    static MulticastSocket openMulticastSocket() throws Exception {
        NetworkInterface route = NetworkInterfaceInspector.requireSingleMulticastIpv4Interface();
        MulticastSocket socket = new MulticastSocket();
        try {
            socket.setNetworkInterface(route);
            return socket;
        } catch (Exception e) {
            socket.close();
            throw e;
        }
    }

    public static void sendDmx(DatagramSocket socket, int universe, int[] channels, int sequence, byte[] cid, String sourceName) throws Exception {
        sendDmx(socket, universe, channels, sequence, cid, sourceName, DEFAULT_PRIORITY);
    }

    public static void sendDmx(DatagramSocket socket, int universe, int[] channels, int sequence, byte[] cid, String sourceName, int priority) throws Exception {
        if (socket == null) throw new IllegalArgumentException("DatagramSocket is required");
        validateFullFrame(channels);
        int u = validateUniverse(universe);
        byte[] packet = buildDmxPacket(u, channels, sequence, cid, sourceName, 0, priority);
        InetAddress address = InetAddress.getByName(multicastAddress(u));
        socket.send(new DatagramPacket(packet, packet.length, address, SACN_PORT));
    }

    static byte[] buildDmxPacket(int universe, int[] channels, int sequence, byte[] cid, String sourceName) {
        return buildDmxPacket(universe, channels, sequence, cid, sourceName, 0, DEFAULT_PRIORITY);
    }

    static byte[] buildDmxPacket(int universe, int[] channels, int sequence, byte[] cid, String sourceName, int options) {
        return buildDmxPacket(universe, channels, sequence, cid, sourceName, options, DEFAULT_PRIORITY);
    }

    static byte[] buildDmxPacket(int universe, int[] channels, int sequence, byte[] cid, String sourceName, int options, int priority) {
        int u = validateUniverse(universe);
        int[] safeChannels = channels == null ? new int[0] : Arrays.copyOf(channels, Math.min(512, channels.length));
        int slotCount = safeChannels.length;
        int packetLength = 126 + slotCount;
        byte[] packet = new byte[packetLength];

        packet[0] = 0x00;
        packet[1] = 0x10;
        packet[2] = 0x00;
        packet[3] = 0x00;
        System.arraycopy(ACN_PACKET_ID, 0, packet, 4, ACN_PACKET_ID.length);

        writeFlagsAndLength(packet, 16, packetLength - 16);
        writeInt(packet, 18, 0x00000004);

        byte[] safeCid = cid == null ? new byte[16] : Arrays.copyOf(cid, 16);
        System.arraycopy(safeCid, 0, packet, 22, 16);

        writeFlagsAndLength(packet, 38, packetLength - 38);
        writeInt(packet, 40, 0x00000002);

        byte[] source = (sourceName == null ? "LightingAI" : sourceName).getBytes(StandardCharsets.UTF_8);
        System.arraycopy(source, 0, packet, 44, Math.min(63, source.length));
        packet[108] = (byte) normalizePriority(priority);
        packet[109] = 0x00;
        packet[110] = 0x00;
        packet[111] = (byte) (sequence & 0xff);
        packet[112] = (byte) (options & 0xff);
        packet[113] = (byte) ((u >> 8) & 0xff);
        packet[114] = (byte) (u & 0xff);

        writeFlagsAndLength(packet, 115, packetLength - 115);
        packet[117] = 0x02;
        packet[118] = (byte) 0xa1;
        packet[119] = 0x00;
        packet[120] = 0x00;
        packet[121] = 0x00;
        packet[122] = 0x01;

        int propertyCount = slotCount + 1;
        packet[123] = (byte) ((propertyCount >> 8) & 0xff);
        packet[124] = (byte) (propertyCount & 0xff);
        packet[125] = 0x00;

        for (int i = 0; i < slotCount; i++) {
            packet[126 + i] = (byte) Math.max(0, Math.min(255, safeChannels[i]));
        }
        return packet;
    }

    static void sendTermination(DatagramSocket socket, int universe, int[] channels, int sequence, byte[] cid, String sourceName) throws Exception {
        sendTermination(socket, universe, channels, sequence, cid, sourceName, DEFAULT_PRIORITY);
    }

    static void sendTermination(DatagramSocket socket, int universe, int[] channels, int sequence, byte[] cid, String sourceName, int priority) throws Exception {
        if (socket == null) throw new IllegalArgumentException("DatagramSocket is required");
        validateFullFrame(channels);
        int u = validateUniverse(universe);
        byte[] packet = buildDmxPacket(u, channels, sequence, cid, sourceName, 0x40, priority);
        InetAddress address = InetAddress.getByName(multicastAddress(u));
        socket.send(new DatagramPacket(packet, packet.length, address, SACN_PORT));
    }

    static int sendUniverseDiscovery(DatagramSocket socket, int[] universes, byte[] cid, String sourceName) throws Exception {
        if (socket == null) throw new IllegalArgumentException("DatagramSocket is required");
        byte[][] packets = buildUniverseDiscoveryPackets(universes, cid, sourceName);
        InetAddress address = InetAddress.getByName(DISCOVERY_MULTICAST_ADDRESS);
        for (byte[] packet : packets) {
            socket.send(new DatagramPacket(packet, packet.length, address, SACN_PORT));
        }
        return packets.length;
    }

    static byte[][] buildUniverseDiscoveryPackets(int[] universes, byte[] cid, String sourceName) {
        TreeSet<Integer> sorted = new TreeSet<>();
        if (universes != null) {
            for (int universe : universes) sorted.add(validateUniverse(universe));
        }
        int[] values = new int[sorted.size()];
        int p = 0;
        for (Integer value : sorted) values[p++] = value.intValue();

        int pageCount = Math.max(1, (values.length + DISCOVERY_PAGE_SIZE - 1) / DISCOVERY_PAGE_SIZE);
        byte[][] packets = new byte[pageCount][];
        int lastPage = pageCount - 1;
        for (int page = 0; page < pageCount; page++) {
            int start = page * DISCOVERY_PAGE_SIZE;
            int count = Math.min(DISCOVERY_PAGE_SIZE, Math.max(0, values.length - start));
            int[] pageUniverses = Arrays.copyOfRange(values, start, start + count);
            packets[page] = buildUniverseDiscoveryPacket(pageUniverses, cid, sourceName, page, lastPage);
        }
        return packets;
    }

    private static byte[] buildUniverseDiscoveryPacket(int[] universes, byte[] cid, String sourceName, int page, int lastPage) {
        int count = universes == null ? 0 : universes.length;
        if (count > DISCOVERY_PAGE_SIZE) throw new IllegalArgumentException("Too many universes on discovery page");
        if (page < 0 || lastPage < page || lastPage > 255) throw new IllegalArgumentException("Invalid discovery page");
        int packetLength = 120 + (count * 2);
        byte[] packet = new byte[packetLength];

        packet[0] = 0x00;
        packet[1] = 0x10;
        packet[2] = 0x00;
        packet[3] = 0x00;
        System.arraycopy(ACN_PACKET_ID, 0, packet, 4, ACN_PACKET_ID.length);

        writeFlagsAndLength(packet, 16, packetLength - 16);
        writeInt(packet, 18, 0x00000008);

        byte[] safeCid = cid == null ? new byte[16] : Arrays.copyOf(cid, 16);
        System.arraycopy(safeCid, 0, packet, 22, 16);

        writeFlagsAndLength(packet, 38, packetLength - 38);
        writeInt(packet, 40, 0x00000002);

        byte[] source = (sourceName == null ? "LightingAI" : sourceName).getBytes(StandardCharsets.UTF_8);
        System.arraycopy(source, 0, packet, 44, Math.min(63, source.length));

        writeFlagsAndLength(packet, 112, packetLength - 112);
        writeInt(packet, 114, 0x00000001);
        packet[118] = (byte) (page & 0xff);
        packet[119] = (byte) (lastPage & 0xff);

        for (int i = 0; i < count; i++) {
            int universe = validateUniverse(universes[i]);
            packet[120 + (i * 2)] = (byte) ((universe >> 8) & 0xff);
            packet[121 + (i * 2)] = (byte) (universe & 0xff);
        }
        return packet;
    }

    static String multicastAddress(int universe) {
        int u = validateUniverse(universe);
        return "239.255." + ((u >> 8) & 0xff) + "." + (u & 0xff);
    }

    static int validateUniverse(int universe) {
        if (universe < MIN_UNIVERSE || universe > MAX_UNIVERSE) {
            throw new IllegalArgumentException("sACN universe out of range: " + universe);
        }
        return universe;
    }

    static void validateFullFrame(int[] channels) {
        if (channels == null || channels.length != 512) {
            throw new IllegalArgumentException("DMX frame must contain exactly 512 channels");
        }
        for (int value : channels) {
            if (value < 0 || value > 255) throw new IllegalArgumentException("DMX channel out of range");
        }
    }

    static int normalizePriority(int priority) {
        return Math.max(0, Math.min(MAX_PRIORITY, priority));
    }

    private static void writeFlagsAndLength(byte[] packet, int offset, int length) {
        int value = 0x7000 | (length & 0x0fff);
        packet[offset] = (byte) ((value >> 8) & 0xff);
        packet[offset + 1] = (byte) (value & 0xff);
    }

    private static void writeInt(byte[] packet, int offset, int value) {
        packet[offset] = (byte) ((value >> 24) & 0xff);
        packet[offset + 1] = (byte) ((value >> 16) & 0xff);
        packet[offset + 2] = (byte) ((value >> 8) & 0xff);
        packet[offset + 3] = (byte) (value & 0xff);
    }
}
