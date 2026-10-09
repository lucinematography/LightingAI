package com.lightingai.app;
import org.junit.Test;
import static org.junit.Assert.*;
public class BleReconnectPolicyTest {
    @Test public void transient133BeforeWritesRetriesWithBackoff(){assertTrue(BleReconnectPolicy.canRetry(133,1,30000,false));assertEquals(2200,BleReconnectPolicy.delayMs(133,1));}
    @Test public void neverReplaysAnUnacknowledgedWriteAfterDisconnect(){assertFalse(BleReconnectPolicy.canRetry(133,1,45000,true));assertFalse(BleReconnectPolicy.canRetry(19,1,45000,true));}
    @Test public void authenticationIsNotBlindlyRetried(){assertFalse(BleReconnectPolicy.canRetry(5,1,45000,false));assertFalse(BleReconnectPolicy.canRetry(15,1,45000,false));assertFalse(BleReconnectPolicy.authenticationRequired(133));}
    @Test public void boundedAttemptsAndDeadline(){assertFalse(BleReconnectPolicy.canRetry(133,3,45000,false));assertFalse(BleReconnectPolicy.canRetry(133,1,10000,false));}
}
