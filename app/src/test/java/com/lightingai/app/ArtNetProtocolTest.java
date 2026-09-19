package com.lightingai.app;

import static org.junit.Assert.*;

import java.net.InetAddress;
import java.nio.charset.StandardCharsets;
import org.junit.Test;

public class ArtNetProtocolTest {
    @Test public void dmxPacketUsesArtNetHeaderUniverseAndEvenLength() {
        byte[] packet = ArtNetSender.buildDmxPacket(1, new int[]{255, 128, 1}, 7);
        assertEquals(22, packet.length);
        assertEquals("Art-Net\0", new String(packet, 0, 8, StandardCharsets.US_ASCII));
        assertEquals(0x00, packet[8] & 0xff);
        assertEquals(0x50, packet[9] & 0xff);
        assertEquals(0x00, packet[10] & 0xff);
        assertEquals(0x0e, packet[11] & 0xff);
        assertEquals(7, packet[12] & 0xff);
        assertEquals(0, packet[14] & 0xff);
        assertEquals(0, packet[15] & 0xff);
        assertEquals(0, packet[16] & 0xff);
        assertEquals(4, packet[17] & 0xff);
        assertEquals(255, packet[18] & 0xff);
        assertEquals(128, packet[19] & 0xff);
        assertEquals(1, packet[20] & 0xff);
        assertEquals(0, packet[21] & 0xff);
    }

    @Test public void dmxPacketMapsOneBasedUiUniverseToPortAddress() {
        byte[] packet = ArtNetSender.buildDmxPacket(258, new int[]{1, 2}, 1);
        assertEquals(1, packet[14] & 0xff);
        assertEquals(1, packet[15] & 0x7f);
    }

    @Test public void automaticDmxTargetMigratesLimitedBroadcastToAuto() {
        assertEquals("AUTO", ArtNetSender.normalizeTarget(null));
        assertEquals("AUTO", ArtNetSender.normalizeTarget(""));
        assertEquals("AUTO", ArtNetSender.normalizeTarget("255.255.255.255"));
        assertEquals("AUTO", ArtNetSender.normalizeTarget("auto"));
        assertEquals("192.168.1.50", ArtNetSender.normalizeTarget(" 192.168.1.50 "));
        assertTrue(ArtNetSender.isAutoTarget("255.255.255.255"));
        assertFalse(ArtNetSender.isAutoTarget("192.168.1.50"));
    }

    @Test public void artPollPacketHasCorrectOpcodeAndProtocolVersion() {
        byte[] packet = ArtNetDiscovery.buildPollPacket();
        assertEquals(14, packet.length);
        assertEquals("Art-Net\0", new String(packet, 0, 8, StandardCharsets.US_ASCII));
        assertEquals(0x00, packet[8] & 0xff);
        assertEquals(0x20, packet[9] & 0xff);
        assertEquals(0x00, packet[10] & 0xff);
        assertEquals(0x0e, packet[11] & 0xff);
    }

    @Test public void artPollReplyParsesIpAndNames() throws Exception {
        byte[] reply = new byte[239];
        byte[] id = "Art-Net\0".getBytes(StandardCharsets.US_ASCII);
        System.arraycopy(id, 0, reply, 0, id.length);
        reply[8] = 0x00;
        reply[9] = 0x21;
        reply[10] = (byte) 192;
        reply[11] = (byte) 168;
        reply[12] = 1;
        reply[13] = 50;
        putAscii(reply, 26, 18, "Node A");
        putAscii(reply, 44, 64, "LightingAI Test Node");

        ArtNetDiscovery.Node node = ArtNetDiscovery.parseReply(reply, reply.length, InetAddress.getByName("192.168.1.99"));
        assertNotNull(node);
        assertEquals("192.168.1.50", node.ip);
        assertEquals("Node A", node.shortName);
        assertEquals("LightingAI Test Node", node.longName);
    }

    @Test public void artPollReplyFallsBackToPacketSourceWhenReplyIpIsZero() throws Exception {
        byte[] reply = new byte[239];
        byte[] id = "Art-Net\0".getBytes(StandardCharsets.US_ASCII);
        System.arraycopy(id, 0, reply, 0, id.length);
        reply[8] = 0x00;
        reply[9] = 0x21;

        ArtNetDiscovery.Node node = ArtNetDiscovery.parseReply(reply, reply.length, InetAddress.getByName("10.0.0.42"));
        assertNotNull(node);
        assertEquals("10.0.0.42", node.ip);
    }

    @Test public void invalidReplyIsRejected() throws Exception {
        byte[] reply = new byte[239];
        ArtNetDiscovery.Node node = ArtNetDiscovery.parseReply(reply, reply.length, InetAddress.getByName("10.0.0.1"));
        assertNull(node);
    }

    private static void putAscii(byte[] target, int offset, int maxLength, String value) {
        byte[] raw = value.getBytes(StandardCharsets.US_ASCII);
        System.arraycopy(raw, 0, target, offset, Math.min(maxLength - 1, raw.length));
    }
}
