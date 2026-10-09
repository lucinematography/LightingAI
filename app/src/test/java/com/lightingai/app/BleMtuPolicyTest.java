package com.lightingai.app;

import org.junit.Test;
import static org.junit.Assert.*;

public class BleMtuPolicyTest {
    @Test public void mtuRequestUsesStandardMaximumWithoutAssumingResponseSize() {
        assertEquals(517, BleMtuPolicy.REQUESTED_MTU);
        assertTrue(BleMtuPolicy.valid(23)); assertTrue(BleMtuPolicy.valid(512));
        assertTrue(BleMtuPolicy.valid(517)); assertFalse(BleMtuPolicy.valid(22));
        assertFalse(BleMtuPolicy.valid(518));
    }
    @Test public void defaultMtuSupportsExistingColorButNotLongConfig() {
        assertTrue(BleMtuPolicy.fitsWrite(23, 20));
        assertFalse(BleMtuPolicy.fitsWrite(23, 21));
        assertFalse(BleMtuPolicy.fitsWrite(23, 75));
    }
    @Test public void longWriteRequiresThreeAttHeaderBytesAndNeverChunks() {
        assertFalse(BleMtuPolicy.fitsWrite(77, 75));
        assertTrue(BleMtuPolicy.fitsWrite(78, 75));
        assertTrue(BleMtuPolicy.fitsWrite(512, 75));
        assertTrue(BleMtuPolicy.fitsWrite(512, 509));
        assertFalse(BleMtuPolicy.fitsWrite(512, 510));
        assertFalse(BleMtuPolicy.fitsWrite(22, 1));
        assertFalse(BleMtuPolicy.fitsWrite(517, 0));
    }
}
