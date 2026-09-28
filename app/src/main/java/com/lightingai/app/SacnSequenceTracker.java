package com.lightingai.app;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * ANSI E1.31 sequence numbers are scoped per universe for a source.
 * One tracker is shared by direct and live sACN transmission paths so
 * switching modes cannot make the same CID jump backwards on a universe.
 */
final class SacnSequenceTracker {
    private final ConcurrentHashMap<Integer, AtomicInteger> sequences = new ConcurrentHashMap<>();

    int next(int universe) {
        int u = SacnSender.validateUniverse(universe);
        AtomicInteger counter = sequences.computeIfAbsent(u, ignored -> new AtomicInteger(0));
        return counter.getAndUpdate(value -> value >= 255 ? 0 : value + 1);
    }
}
