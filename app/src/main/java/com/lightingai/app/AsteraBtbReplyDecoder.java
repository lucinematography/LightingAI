package com.lightingai.app;

import java.util.ArrayList;
import java.util.List;

/** Bounded receive-only framing diagnostics. CRC-valid frames have unknown semantics. */
public final class AsteraBtbReplyDecoder {
    public static final class Packet {
        public final String kind;
        public final int payloadLength, operationId;
        public final long firstAtMs, lastAtMs;
        public final boolean empty, afterColorWrite;
        private Packet(String kind, int length, long first, long last, int operation,
                       boolean afterColor, boolean empty) {
            this.kind = kind; payloadLength = length; firstAtMs = first; lastAtMs = last;
            operationId = operation; afterColorWrite = afterColor; this.empty = empty;
        }
    }
    private final byte[] binary = new byte[259];
    private int size, expected, origin;
    private boolean escapePending, afterColor;
    private long firstAt;
    private long markerAt;
    private int markerOrigin;
    private boolean markerAfterColor;
    private final StringBuilder xml = new StringBuilder();
    private long xmlFirstAt;
    private int xmlOrigin;
    private boolean xmlAfterColor;
    private int invalidBinaryCandidates, discardedXmlPrefixes;
    private boolean xmlTrailerPending;

    public List<Packet> feed(byte[] value, long atMs, int operationId, boolean afterColorWrite) {
        List<Packet> packets = new ArrayList<>();
        if (value == null) return packets;
        for (byte raw : value) {
            int b = raw & 255;
            // The observed XML wrapper ends with LF; keep that trailer out of binary framing.
            if (xmlTrailerPending) {
                xmlTrailerPending = false;
                if (b == 10) { clearBinary(); continue; }
            }
            feedXml(b, atMs, operationId, afterColorWrite, packets);
            if (size == 0) {
                if (b == 10) start(atMs, operationId, afterColorWrite);
                continue;
            }
            if (escapePending) {
                escapePending = false;
                if (b != 10) {
                    // An undoubled marker resynchronizes a provisional candidate.
                    // This also prevents XML newline candidates retaining later binary replies.
                    invalidBinaryCandidates++;
                    start(markerAt, markerOrigin, markerAfterColor);
                    append(b, atMs, packets);
                    continue;
                }
            } else if (b == 10) {
                escapePending = true; markerAt = atMs; markerOrigin = operationId;
                markerAfterColor = afterColorWrite; continue;
            }
            append(b, atMs, packets);
        }
        return packets;
    }
    private void start(long at, int operation, boolean after) {
        size = 1; binary[0] = 10; expected = 0; escapePending = false;
        firstAt = at; origin = operation; afterColor = after;
    }
    private void append(int b, long at, List<Packet> packets) {
        binary[size++] = (byte) b;
        if (size == 2) expected = b + 4;
        if (expected == 0 || size < expected) return;
        int stored = ((binary[size - 2] & 255) << 8) | (binary[size - 1] & 255);
        if (AsteraBtbCapturedFrames.crc16Modbus(binary, 1, size - 3) == stored) {
            int length = binary[1] & 255;
            packets.add(new Packet("binary_crc_valid_semantics_unknown", length, firstAt, at,
                origin, afterColor, length == 0));
            xml.setLength(0);
        } else invalidBinaryCandidates++;
        clearBinary();
    }
    private void feedXml(int b, long at, int operation, boolean after, List<Packet> packets) {
        if (b > 126 || (b < 32 && b != 9 && b != 10 && b != 13)) { xml.setLength(0); return; }
        if (xml.length() == 0 && (b == 9 || b == 10 || b == 13 || b == 32)) return;
        if (xml.length() == 0) { xmlFirstAt = at; xmlOrigin = operation; xmlAfterColor = after; }
        xml.append((char) b);
        // Match the observed wrapper only, not a general XML/authentication protocol.
        int open = xml.indexOf("<reply>");
        int close = open < 0 ? -1 : xml.indexOf("</reply>", open + 7);
        if (close >= 0) {
            String body = xml.substring(open + 7, close);
            packets.add(new Packet("xml_reply_semantics_unknown", body.length(), xmlFirstAt, at,
                xmlOrigin, xmlAfterColor, body.trim().isEmpty()));
            xml.delete(0, close + 8);
            clearBinary(); xmlTrailerPending = true;
            xmlFirstAt = at; xmlOrigin = operation; xmlAfterColor = after;
        }
        if (xml.length() > 8192) {
            // Preserve a possible split opening tag, never turn truncation into a complete reply.
            xml.delete(0, xml.length() - 6); discardedXmlPrefixes++;
            xmlFirstAt = at; xmlOrigin = operation; xmlAfterColor = after;
        }
    }
    public int bufferedBinaryBytes() { return size + (escapePending ? 1 : 0); }
    public int bufferedXmlCharacters() { return xml.length(); }
    public int invalidBinaryCandidates() { return invalidBinaryCandidates; }
    public int discardedXmlPrefixes() { return discardedXmlPrefixes; }
    private void clearBinary() { size = 0; expected = 0; escapePending = false; }
    public void reset() {
        clearBinary(); xml.setLength(0); xmlTrailerPending = false;
        invalidBinaryCandidates = 0; discardedXmlPrefixes = 0;
    }
}
