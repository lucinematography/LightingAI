package com.lightingai.app;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.junit.Test;
import static org.junit.Assert.*;

public class AsteraBtbReplyDecoderTest {
    // Generated synthetic envelopes only. No private captured configs/session IDs.
    private static byte[] wire(byte[] body) {
        byte[] logical = new byte[body.length + 4]; logical[0] = 10; logical[1] = (byte) body.length;
        System.arraycopy(body, 0, logical, 2, body.length);
        int crc = AsteraBtbCapturedFrames.crc16Modbus(logical, 1, body.length + 1);
        logical[logical.length - 2] = (byte) (crc >> 8); logical[logical.length - 1] = (byte) crc;
        ByteArrayOutputStream out = new ByteArrayOutputStream(); out.write(10);
        for (int i = 1; i < logical.length; i++) {
            out.write(logical[i]); if ((logical[i] & 255) == 10) out.write(10);
        }
        return out.toByteArray();
    }
    private static byte[] ascii(String text) { return text.getBytes(StandardCharsets.US_ASCII); }
    @Test public void allTwoNotificationSplitPositionsProduceOneFrame() {
        byte[] b = wire(new byte[]{49, 10, 66});
        for (int split = 0; split <= b.length; split++) {
            AsteraBtbReplyDecoder d = new AsteraBtbReplyDecoder();
            List<AsteraBtbReplyDecoder.Packet> got = new ArrayList<>();
            got.addAll(d.feed(Arrays.copyOfRange(b, 0, split), 1, 7, true));
            got.addAll(d.feed(Arrays.copyOfRange(b, split, b.length), 2, 7, true));
            assertEquals(1, got.size()); assertEquals(3, got.get(0).payloadLength);
            assertEquals("binary_crc_valid_semantics_unknown", got.get(0).kind);
        }
    }
    @Test public void emptyBinaryFrameIsAFrameNotAnExecutionAck() {
        AsteraBtbReplyDecoder d = new AsteraBtbReplyDecoder();
        List<AsteraBtbReplyDecoder.Packet> got = d.feed(wire(new byte[0]), 1, 7, true);
        assertEquals(1, got.size()); assertTrue(got.get(0).empty);
        assertEquals("binary_crc_valid_semantics_unknown", got.get(0).kind);
    }
    @Test public void coalescedFramesAreCountedSeparately() {
        byte[] a = wire(new byte[]{49}), b = wire(new byte[]{50});
        byte[] both = Arrays.copyOf(a, a.length + b.length); System.arraycopy(b, 0, both, a.length, b.length);
        assertEquals(2, new AsteraBtbReplyDecoder().feed(both, 1, 1, false).size());
    }
    @Test public void oneByteFragmentsAndEveryLengthStayBounded() {
        for (int len = 0; len <= 255; len++) {
            byte[] body = new byte[len]; for (int i = 0; i < len; i++) body[i] = (byte) i;
            byte[] bytes = wire(body); AsteraBtbReplyDecoder d = new AsteraBtbReplyDecoder();
            List<AsteraBtbReplyDecoder.Packet> got = new ArrayList<>();
            for (int i = 0; i < bytes.length; i++) got.addAll(d.feed(new byte[]{bytes[i]}, i, 1, false));
            assertEquals("length=" + len, 1, got.stream().filter(p -> p.kind.startsWith("binary")).count());
            assertEquals(len, got.get(got.size() - 1).payloadLength);
            assertEquals(0, d.bufferedBinaryBytes());
        }
    }
    @Test public void corruptCrcNeverBecomesAFrame() {
        byte[] bytes = wire(new byte[]{49}); bytes[bytes.length - 1] ^= 1;
        AsteraBtbReplyDecoder d = new AsteraBtbReplyDecoder();
        assertTrue(d.feed(bytes, 1, 1, false).isEmpty()); assertTrue(d.invalidBinaryCandidates() > 0);
    }
    @Test public void incompleteFrameRetainsItsOriginalOperationAndColorPhase() {
        byte[] b = wire(new byte[]{49, 50}); AsteraBtbReplyDecoder d = new AsteraBtbReplyDecoder();
        assertTrue(d.feed(Arrays.copyOfRange(b, 0, 3), 100, 1, false).isEmpty());
        AsteraBtbReplyDecoder.Packet p = d.feed(Arrays.copyOfRange(b, 3, b.length), 200, 2, true).get(0);
        assertEquals(1, p.operationId); assertFalse(p.afterColorWrite);
        assertEquals(100, p.firstAtMs); assertEquals(200, p.lastAtMs);
    }
    @Test public void disconnectResetDoesNotCombineTwoConnections() {
        byte[] b = wire(new byte[]{49}); AsteraBtbReplyDecoder d = new AsteraBtbReplyDecoder();
        d.feed(Arrays.copyOfRange(b, 0, 3), 1, 1, false); d.reset();
        assertTrue(d.feed(Arrays.copyOfRange(b, 3, b.length), 2, 2, true).isEmpty());
        assertEquals(1, d.feed(b, 3, 2, true).size());
    }
    @Test public void fragmentedXmlAndBinaryAreDistinct() {
        String text = "<?xml version=\"1.0\" ?>\n<reply>\n</reply>\n";
        AsteraBtbReplyDecoder d = new AsteraBtbReplyDecoder(); List<AsteraBtbReplyDecoder.Packet> got = new ArrayList<>();
        byte[] bytes = ascii(text);
        for (int i = 0; i < bytes.length; i++) got.addAll(d.feed(new byte[]{bytes[i]}, i, 1, false));
        assertEquals(1, got.size()); assertEquals("xml_reply_semantics_unknown", got.get(0).kind);
        assertTrue(got.get(0).empty);
        assertEquals(1, d.feed(wire(new byte[]{49}), 100, 1, true).size());
    }
    @Test public void multipleXmlRepliesIncludingNonemptyContentAreCounted() {
        List<AsteraBtbReplyDecoder.Packet> got = new AsteraBtbReplyDecoder().feed(
            ascii("<reply></reply>\n<reply><sample>synthetic</sample></reply>\n"), 1, 1, false);
        assertEquals(2, got.size()); assertTrue(got.get(0).empty); assertFalse(got.get(1).empty);
    }
    @Test public void xmlAfterAColorWriteDoesNotInheritPreviousWhitespaceOrigin() {
        AsteraBtbReplyDecoder d = new AsteraBtbReplyDecoder();
        d.feed(ascii("<reply></reply>\n"), 1, 1, false);
        AsteraBtbReplyDecoder.Packet p = d.feed(ascii("<reply></reply>\n"), 2, 2, true).get(0);
        assertEquals(2, p.operationId); assertTrue(p.afterColorWrite);
    }
    @Test public void unboundedAsciiCannotGrowTheReceiveBuffer() {
        byte[] bytes = new byte[40000]; Arrays.fill(bytes, (byte) 'x'); AsteraBtbReplyDecoder d = new AsteraBtbReplyDecoder();
        assertTrue(d.feed(bytes, 1, 1, false).isEmpty());
        assertTrue(d.bufferedXmlCharacters() <= 8192); assertTrue(d.discardedXmlPrefixes() > 0);
    }
    @Test public void danglingEscapeCannotInventACompletePacket() {
        byte[] b = wire(new byte[]{10}); AsteraBtbReplyDecoder d = new AsteraBtbReplyDecoder();
        assertTrue(d.feed(Arrays.copyOfRange(b, 0, 3), 1, 1, false).isEmpty());
        assertEquals(3, d.bufferedBinaryBytes());
        assertEquals(1, d.feed(Arrays.copyOfRange(b, 3, b.length), 2, 1, false).size());
    }
}
