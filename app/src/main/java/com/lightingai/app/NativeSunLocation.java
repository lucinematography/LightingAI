package com.lightingai.app;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

public final class NativeSunLocation implements LocationListener {
    public interface Callback {
        void onLocation(Location location);
        void onFailure();
    }

    private static final long TIMEOUT_MS = 12000L;
    private static final long FRESH_LAST_KNOWN_MS = 5L * 60L * 1000L;

    private final Context context;
    private final LocationManager locationManager;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private Callback callback;
    private Location fallbackLocation;
    private boolean running = false;

    private final Runnable timeout = () -> {
        if (!running) return;
        if (fallbackLocation != null) finishSuccess(fallbackLocation);
        else finishFailure();
    };

    public NativeSunLocation(Context context) {
        this.context = context.getApplicationContext();
        this.locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
    }

    public boolean request(Callback callback) {
        cancel();
        this.callback = callback;
        if (locationManager == null || !hasPermission()) {
            finishFailure();
            return false;
        }

        boolean requested = false;
        fallbackLocation = bestLastKnown();
        try {
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0L, 0f, this, Looper.getMainLooper());
                requested = true;
            }
        } catch (Exception ignored) {}
        try {
            if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0L, 0f, this, Looper.getMainLooper());
                requested = true;
            }
        } catch (Exception ignored) {}

        if (!requested) {
            if (fallbackLocation != null) finishSuccess(fallbackLocation);
            else finishFailure();
            return false;
        }

        running = true;
        mainHandler.postDelayed(timeout, TIMEOUT_MS);
        if (fallbackLocation != null && System.currentTimeMillis() - fallbackLocation.getTime() <= FRESH_LAST_KNOWN_MS) {
            mainHandler.postDelayed(() -> {
                if (running && fallbackLocation != null) finishSuccess(fallbackLocation);
            }, 1200L);
        }
        return true;
    }

    private boolean hasPermission() {
        return context.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            context.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    private Location bestLastKnown() {
        Location best = null;
        String[] providers = new String[]{LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER, LocationManager.PASSIVE_PROVIDER};
        for (String provider : providers) {
            try {
                Location candidate = locationManager.getLastKnownLocation(provider);
                if (candidate == null) continue;
                if (best == null || isBetter(candidate, best)) best = candidate;
            } catch (Exception ignored) {}
        }
        return best;
    }

    private boolean isBetter(Location a, Location b) {
        if (a.getTime() > b.getTime() + 30000L) return true;
        if (b.getTime() > a.getTime() + 30000L) return false;
        if (a.hasAccuracy() && b.hasAccuracy()) return a.getAccuracy() < b.getAccuracy();
        return a.hasAccuracy() || !b.hasAccuracy();
    }

    @Override public void onLocationChanged(Location location) {
        if (location == null) return;
        if (fallbackLocation == null || isBetter(location, fallbackLocation)) fallbackLocation = location;
        finishSuccess(location);
    }

    @Override public void onProviderEnabled(String provider) {}
    @Override public void onProviderDisabled(String provider) {}
    @Override public void onStatusChanged(String provider, int status, Bundle extras) {}

    private void finishSuccess(Location location) {
        Callback cb = callback;
        cleanup();
        if (cb != null && location != null) cb.onLocation(location);
    }

    private void finishFailure() {
        Callback cb = callback;
        cleanup();
        if (cb != null) cb.onFailure();
    }

    private void cleanup() {
        running = false;
        mainHandler.removeCallbacks(timeout);
        try { if (locationManager != null) locationManager.removeUpdates(this); } catch (Exception ignored) {}
        callback = null;
        fallbackLocation = null;
    }

    public void cancel() {
        cleanup();
    }
}
