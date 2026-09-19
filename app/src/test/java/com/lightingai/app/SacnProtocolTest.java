package com.lightingai.app;

import static org.junit.Assert.*;

import java.nio.charset.StandardCharsets;
import org.junit.Test;

public class SacnProtocolTest {
    private static final byte[] CID = new byte[]{
        0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,
        0x09,0x0a,0x0b,0x0c,0x0d,0x0e,0x0f,0x10
    };

    @Test public void sacnPacketUsesE131LayersAndDmxStartCode() {
        byte[] packet = SacnSender.buildDmxPacket(1, new int[]{255,128,1}, 9, CID, "LightingAI");
        assertEquals(129, packet.length);
        assertEquals(0x00, packet[0] & 0xff);
        assertEquals(0x10, packet[1] & 0xff);
        assertEquals("ASC-E1.17\0\0\0", new String(packet, 4, 12, StandardCharsets.US_ASCII));
        assertEquals(0x70, packet[16] & 0xff);
        assertEquals(0x71, packet[17] & 0xff);
        assertEquals(0x04, packet[21] & 0xff);
        for (int i = 0; i < 16; i++) assertEquals(CID[i] & 0xff, packet[22 + i] & 0xff);
        assertEquals(0x02, packet[43] & 0xff);
        assertEquals(100, packet[108] & 0xff);
        assertEquals(9, packet[111] & 0xff);
        assertEquals(0, packet[113] & 0xff);
        assertEquals(1, packet[114] & 0xff);
        assertEquals(0x02, packet[117] & 0xff);
        assertEquals(0xa1, packet[118] & 0xff);
        assertEquals(0, packet[119] & 0xff);
        assertEquals(0, packet[120] & 0xff);
        assertEquals(0, packet[121] & 0xff);
        assertEquals(1, packet[122] & 0xff);
        assertEquals(0, packet[123] & 0xff);
        assertEquals(4, packet[124] & 0xff);
        assertEquals(0, packet[125] & 0xff);
        assertEquals(255, packet[126] & 0xff);
        assertEquals(128, packet[127] & 0xff);
        assertEquals(1, packet[128] & 0xff);
    }

    @Test public void sacnUsesBigEndianUniverseAndExpectedMulticastAddress() {
        byte[] packet = SacnSender.buildDmxPacket(258, new int[]{1}, 0, CID, "LightingAI");
        assertEquals(1, packet[113] & 0xff);
        assertEquals(2, packet[114] & 0xff);
        assertEquals("239.255.1.2", SacnSender.multicastAddress(258));
    }

    @Test public void sacnPropertyCountIncludesStartCode() {
        byte[] packet = SacnSender.buildDmxPacket(1, new int[512], 255, CID, "LightingAI");
        assertEquals(638, packet.length);
        assertEquals(0x02, packet[123] & 0xff);
        assertEquals(0x01, packet[124] & 0xff);
        assertEquals(0, packet[125] & 0xff);
        assertEquals(255, packet[111] & 0xff);
    }

    @Test public void sacnUniverseIsClampedToStandardRange() {
        assertEquals("239.255.0.1", SacnSender.multicastAddress(0));
        assertEquals("239.255.249.255", SacnSender.multicastAddress(70000));
    }

    @Test public void sourceNameIsLimitedToFramingField() {
        String longName = "LightingAI-ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789-abcdefghijklmnopqrstuvwxyz-extra";
        byte[] packet = SacnSender.buildDmxPacket(1, new int[]{0}, 1, CID, longName);
        byte[] source = new byte[64];
        System.arraycopy(packet, 44, source, 0, 64);
        assertEquals(64, source.length);
        assertFalse(new String(source, StandardCharsets.UTF_8).isEmpty());
    }
}
