package com.lightingai.app;

/** Standard ATT sizing only; never fragments proprietary application commands. */
public final class BleMtuPolicy {
    public static final int REQUESTED_MTU = 517;
    private BleMtuPolicy() {}
    public static boolean valid(int mtu) { return mtu >= 23 && mtu <= 517; }
    public static boolean fitsWrite(int mtu, int bytes) {
        return valid(mtu) && bytes > 0 && bytes <= mtu - 3;
    }
}
