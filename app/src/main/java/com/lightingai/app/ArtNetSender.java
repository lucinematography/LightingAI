package com.lightingai.app;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.nio.charset.StandardCharsets;

public final class ArtNetSender {
    public static final int ARTNET_PORT = 6454;

    private ArtNetSender() {}

    public static void sendDmx(String targetIp, int universe, int[] channels, int sequence) throws Exception {
        if (targetIp == null || targetIp.trim().isEmpty()) targetIp = "255.255.255.255";
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

        InetAddress address = InetAddress.getByName(targetIp.trim());
        try (DatagramSocket socket = new DatagramSocket()) {
            socket.setBroadcast(true);
            socket.send(new DatagramPacket(packet, packet.length, address, ARTNET_PORT));
        }
    }
}
