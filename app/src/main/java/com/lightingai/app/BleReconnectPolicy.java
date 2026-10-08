package com.lightingai.app;

/** Reconnect only before proprietary writes; their execution is not idempotently proven. */
public final class BleReconnectPolicy {
    private BleReconnectPolicy() {}
    public static boolean authenticationRequired(int status) { return status == 5 || status == 15; }
    public static long delayMs(int status, int attempt) {
        if (status == 133) return 2200L;
        if (status == 19) return 1800L;
        return attempt == 1 ? 700L : 1200L;
    }
    public static boolean canRetry(int status, int attempt, long remainingMs, boolean wrote) {
        return !wrote && !authenticationRequired(status) && attempt < 3 &&
            remainingMs > delayMs(status, attempt) + 12000L;
    }
}
