package com.lightingai.app;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * ArtDmx sequence numbers are maintained independently for each receiving
 * node and Port-Address. This prevents fan-out or multi-universe output from
 * creating apparent gaps in the sequence seen by any one receiver.
 */
final class ArtNetSequenceTracker {
    private final ConcurrentHashMap<String, AtomicInteger> sequences = new ConcurrentHashMap<>();

    int next(String targetIp, int portAddress) {
        String target = ArtNetSender.normalizeTarget(targetIp);
        if (ArtNetSender.isAutoTarget(target) || !ArtNetSender.isUsableIpv4Target(target)) {
            throw new IllegalArgumentException("Art-Net sequence target must be a unicast IPv4 node");
        }
        int port = ArtNetSender.validatePortAddress(portAddress);
        String key = target + "|" + port;
        AtomicInteger counter = sequences.computeIfAbsent(key, ignored -> new AtomicInteger(1));
        return counter.getAndUpdate(value -> value >= 255 ? 1 : value + 1);
    }
}
