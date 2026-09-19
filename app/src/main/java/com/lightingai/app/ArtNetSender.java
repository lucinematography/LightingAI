package com.lightingai.app;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.nio.charset.StandardCharsets;

public final class ArtNetSender {
    public static final int ARTNET_PORT = 6454;
    public static final String AUTO_TARGET = "AUTO";

    private ArtNetSender() {}

    public static void sendDmx(String targetIp, int universe, int[] channels, int sequence) throws Exception {
        try (DatagramSocket socket = new DatagramSocket()) {
            socket.setBroadcast(true);
            sendDmx(socket, targetIp, universe, channels, sequence);
        }
    }

    public static void sendDmx(DatagramSocket socket, String targetIp, int universe, int[] channels, int sequence) throws Exception {
        if (socket == null) throw new IllegalArgumentException("DatagramSocket is required");
        String target = normalizeTarget(targetIp);
        byte[] packet = buildDmxPacket(universe, channels, sequence);

        if (isAutoTarget(target)) {
            java.util.List<InetAddress> broadcasts = ArtNetDiscovery.directedBroadcastTargets();
            if (broadcasts.isEmpty()) {
                throw new IllegalStateException("No directed IPv4 broadcast target is available");
            }
            for (InetAddress address : broadcasts) {
                socket.send(new DatagramPacket(packet, packet.length, address, ARTNET_PORT));
            }
            return;
        }

        InetAddress address = InetAddress.getByName(target);
        socket.send(new DatagramPacket(packet, packet.length, address, ARTNET_PORT));
    }

    static String normalizeTarget(String targetIp) {
        if (targetIp == null) return AUTO_TARGET;
        String value = targetIp.trim();
        if (value.isEmpty() || "255.255.255.255".equals(value) || AUTO_TARGET.equalsIgnoreCase(value)) {
            return AUTO_TARGET;
        }
        return value;
    }

    static boolean isAutoTarget(String targetIp) {
        return AUTO_TARGET.equalsIgnoreCase(normalizeTarget(targetIp));
    }

    static byte[] buildDmxPacket(int universe, int[] channels, int sequence) {
        int logicalUniverse = Math.max(1, universe) - 1;
        int length = Math.max(2, Math.min(512, channels == null ? 0 : channels.length));
        if ((length & 1) != 0) length++;

        byte[] packet = new byte[18 + length];
        byte[] id = "Art-Net\0".getBytes(StandardCharsets.US_ASCII);
        System.arraycopy(id, 0, packet, 0, id.length);

        packet[8] = 0x00;
        packet[9] = 0x50;
        packet[10] = 0x00;
        packet[11] = 0x0e;
        packet[12] = (byte) (sequence & 0xff);
        packet[13] = 0x00;
        packet[14] = (byte) (logicalUniverse & 0xff);
        packet[15] = (byte) ((logicalUniverse >> 8) & 0x7f);
        packet[16] = (byte) ((length >> 8) & 0xff);
        packet[17] = (byte) (length & 0xff);

        for (int i = 0; i < length; i++) {
            int value = channels != null && i < channels.length ? channels[i] : 0;
            packet[18 + i] = (byte) Math.max(0, Math.min(255, value));
        }
        return packet;
    }
}
