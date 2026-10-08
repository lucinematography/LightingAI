package com.lightingai.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

/** Keeps an explicitly opened BLE transport alive across Activity pauses. No automatic replay. */
public final class BleConnectionService extends Service {
    private static final String CHANNEL = "lightingai_ble_connection";
    private static AsteraBtbColorReplayProbe transport;

    public static synchronized AsteraBtbColorReplayProbe acquire(Context context) {
        if (transport == null) transport = new AsteraBtbColorReplayProbe(context.getApplicationContext());
        return transport;
    }

    public static void start(Context context) {
        context.startForegroundService(new Intent(context, BleConnectionService.class));
    }

    public static void stop(Context context) {
        context.stopService(new Intent(context, BleConnectionService.class));
    }

    @Override public void onCreate() {
        super.onCreate();
        NotificationManager manager = getSystemService(NotificationManager.class);
        manager.createNotificationChannel(new NotificationChannel(CHANNEL, "LightingAI Bluetooth", NotificationManager.IMPORTANCE_LOW));
        PendingIntent open = PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification notification = new Notification.Builder(this, CHANNEL)
            .setSmallIcon(getApplicationInfo().icon)
            .setContentTitle("LightingAI Bluetooth")
            .setContentText("BLE veza aktivna; Astera sesija nije potvrđena")
            .setContentIntent(open).setOngoing(true).build();
        if (Build.VERSION.SDK_INT >= 29) startForeground(408, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE);
        else startForeground(408, notification);
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) { return START_NOT_STICKY; }
    @Override public IBinder onBind(Intent intent) { return null; }
    @Override public void onDestroy() {
        // A new service can use this transport later. Never restore or replay a previous command.
        AsteraBtbColorReplayProbe current;
        synchronized (BleConnectionService.class) { current = transport; }
        if (current != null) current.cancel();
        super.onDestroy();
    }
}
