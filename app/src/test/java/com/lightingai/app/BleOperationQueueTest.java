package com.lightingai.app;
import org.junit.Test;
import static org.junit.Assert.*;
import java.util.*;

public class BleOperationQueueTest {
    static final class Clock implements BleOperationQueue.Scheduler {
        static final class Task { Runnable r; long at; Task(Runnable r,long at){this.r=r;this.at=at;} }
        long now; final List<Task> tasks=new ArrayList<>();
        public void post(Runnable r,long delay){tasks.add(new Task(r,now+delay));}
        public void remove(Runnable r){tasks.removeIf(t->t.r==r);}
        void advance(long ms){long end=now+ms;while(true){Task t=tasks.stream().filter(x->x.at<=end).min(Comparator.comparingLong(x->x.at)).orElse(null);if(t==null)break;tasks.remove(t);now=t.at;t.r.run();}now=end;}
    }
    static final class Harness implements BleOperationQueue.Listener {
        final Clock clock=new Clock(); final BleOperationQueue q=new BleOperationQueue(clock,this);
        final List<String> sent=new ArrayList<>(); final List<String> done=new ArrayList<>();
        boolean accepted=true,finished; String failure=""; byte[] received;
        public boolean submit(String l,byte[] v){sent.add(l);received=v;return accepted;}
        public void completed(String l,int st){done.add(l+":"+st);}
        public void finished(){finished=true;}
        public void failed(String c){failure=c;}
    }
    @Test public void delayedBootstrapCallbackCannotCompleteColor(){
        Harness h=new Harness();h.q.add("bootstrap",new byte[]{1},0);h.q.add("color",new byte[]{2},150);h.q.start();h.clock.advance(0);
        h.clock.advance(1000);assertEquals(Arrays.asList("bootstrap"),h.sent);assertFalse(h.finished);
        h.q.onCallback(0);assertEquals(Arrays.asList("bootstrap:0"),h.done);h.clock.advance(149);assertEquals(1,h.sent.size());h.clock.advance(1);
        assertEquals("color",h.q.pendingLabel());assertFalse(h.finished);h.q.onCallback(0);assertTrue(h.finished);
    }
    @Test public void noCallbackFailsInsteadOfInventingSuccess(){Harness h=new Harness();h.q.add("color",new byte[]{1},0);h.q.start();h.clock.advance(4000);assertEquals("ble_write_callback_timeout",h.failure);assertFalse(h.finished);h.q.onCallback(0);assertFalse(h.finished);}
    @Test public void rejectedSubmissionStopsRemainingWrites(){Harness h=new Harness();h.accepted=false;h.q.add("wake",new byte[]{1},0);h.q.add("color",new byte[]{2},0);h.q.start();h.clock.advance(10000);assertEquals(Arrays.asList("wake"),h.sent);assertFalse(h.finished);assertEquals("ble_write_start_failed",h.failure);}
    @Test public void failedCallbackStopsRemainingWrites(){Harness h=new Harness();h.q.add("wake",new byte[]{1},0);h.q.add("color",new byte[]{2},0);h.q.start();h.clock.advance(0);h.q.onCallback(133);h.clock.advance(10000);assertEquals(1,h.sent.size());assertEquals("ble_write_status_133",h.failure);}
    @Test public void cancelDiscardsCallbacksAndScheduledWrites(){Harness h=new Harness();h.q.add("color",new byte[]{1},150);h.q.start();h.q.cancel();h.clock.advance(10000);h.q.onCallback(0);assertTrue(h.sent.isEmpty());assertFalse(h.finished);assertEquals("",h.failure);}
    @Test public void cancelledTimeoutCannotPoisonReusedQueue(){Harness h=new Harness();h.q.add("old",new byte[]{1},0);h.q.start();h.clock.advance(0);h.q.cancel();h.q.add("new",new byte[]{2},0);h.q.start();h.clock.advance(0);h.q.onCallback(0);h.clock.advance(10000);assertTrue(h.finished);assertEquals("",h.failure);assertEquals(Arrays.asList("new:0"),h.done);}
    @Test public void payloadIsCopied(){Harness h=new Harness();byte[] b={1};h.q.add("color",b,0);b[0]=9;h.q.start();h.clock.advance(0);assertEquals(1,h.received[0]);}
    @Test public void duplicateCallbackBetweenWritesIsIgnored(){Harness h=new Harness();h.q.add("a",new byte[]{1},0);h.q.add("b",new byte[]{2},150);h.q.start();h.clock.advance(0);h.q.onCallback(0);h.q.onCallback(0);assertEquals(1,h.done.size());h.clock.advance(150);assertFalse(h.finished);h.q.onCallback(0);assertTrue(h.finished);}
    @Test(expected=IllegalStateException.class) public void busyQueueRejectsNewPayload(){Harness h=new Harness();h.q.add("a",new byte[]{1},0);h.q.start();h.q.add("b",new byte[]{2},0);}
}
