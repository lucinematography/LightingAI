package com.lightingai.app;

import java.net.DatagramSocket;
import java.net.InetSocketAddress;

/**
 * Process-wide Art-Net UDP socket.
 *
 * Art-Net 4 requires UDP 0x1936 (6454) as both source and destination.
 * Discovery and DMX output share the same socket so periodic ArtPoll does not
 * compete with a second socket for ArtPollReply packets.
 */
final class ArtNetSocketManager {
    private static final Object LOCK = new Object();
    private static DatagramSocket socket;

    private ArtNetSocketManager() {}

    static DatagramSocket socket() throws Exception {
        synchronized (LOCK) {
            if (socket == null || socket.isClosed()) {
                DatagramSocket created = new DatagramSocket(null);
                try {
                    created.setReuseAddress(true);
                    created.setBroadcast(true);
                    created.bind(new InetSocketAddress(ArtNetSender.ARTNET_PORT));
                    socket = created;
                } catch (Exception e) {
                    created.close();
                    throw e;
                }
            }
            return socket;
        }
    }
}
