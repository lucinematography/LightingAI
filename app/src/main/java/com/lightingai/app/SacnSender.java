package com.lightingai.app;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

public final class SacnSender {
    public static final int SACN_PORT = 5568;
    public static final int MIN_UNIVERSE = 1;
    public static final int MAX_UNIVERSE = 63999;
    private static final byte[] ACN_PACKET_ID = new byte[]{
        0x41,0x53,0x43,0x2d,0x45,0x31,0x2e,0x31,0x37,0x00,0x00,0x00
    };

    private SacnSender() {}

    public static void sendDmx(int universe, int[] channels, int sequence, byte[] cid, String sourceName) throws Exception {
        try (DatagramSocket socket = new DatagramSocket()) {
            sendDmx(socket, universe, channels, sequence, cid, sourceName);
        }
    }

    public static void sendDmx(DatagramSocket socket, int universe, int[] channels, int sequence, byte[] cid, String sourceName) throws Exception {
        if (socket == null) throw new IllegalArgumentException("DatagramSocket is required");
        int u = normalizeUniverse(universe);
        byte[] packet = buildDmxPacket(u, channels, sequence, cid, sourceName, 0);
        InetAddress address = InetAddress.getByName(multicastAddress(u));
        socket.send(new DatagramPacket(packet, packet.length, address, SACN_PORT));
    }

    static byte[] buildDmxPacket(int universe, int[] channels, int sequence, byte[] cid, String sourceName) {
        return buildDmxPacket(universe, channels, sequence, cid, sourceName, 0);
    }

    static byte[] buildDmxPacket(int universe, int[] channels, int sequence, byte[] cid, String sourceName, int options) {
        int u = normalizeUniverse(universe);
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
        packet[108] = 100;
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
        if (socket == null) throw new IllegalArgumentException("DatagramSocket is required");
        int u = normalizeUniverse(universe);
        byte[] packet = buildDmxPacket(u, channels, sequence, cid, sourceName, 0x40);
        InetAddress address = InetAddress.getByName(multicastAddress(u));
        socket.send(new DatagramPacket(packet, packet.length, address, SACN_PORT));
    }

    static String multicastAddress(int universe) {
        int u = normalizeUniverse(universe);
        return "239.255." + ((u >> 8) & 0xff) + "." + (u & 0xff);
    }

    private static int normalizeUniverse(int universe) {
        return Math.max(MIN_UNIVERSE, Math.min(MAX_UNIVERSE, universe));
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
