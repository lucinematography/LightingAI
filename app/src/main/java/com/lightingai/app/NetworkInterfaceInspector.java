package com.lightingai.app;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InterfaceAddress;
import java.net.NetworkInterface;
import java.util.Collections;
import java.util.Enumeration;
import org.json.JSONArray;
import org.json.JSONObject;

public final class NetworkInterfaceInspector {
    private NetworkInterfaceInspector() {}

    public static JSONArray snapshot() {
        JSONArray out = new JSONArray();
        try {
            Enumeration<NetworkInterface> raw = NetworkInterface.getNetworkInterfaces();
            if (raw == null) return out;
            for (NetworkInterface network : Collections.list(raw)) {
                if (network == null) continue;
                boolean up;
                boolean loopback;
                boolean multicast;
                try {
                    up = network.isUp();
                    loopback = network.isLoopback();
                    multicast = network.supportsMulticast();
                } catch (Exception ignored) {
                    continue;
                }
                if (!up || loopback) continue;

                for (InterfaceAddress interfaceAddress : network.getInterfaceAddresses()) {
                    if (interfaceAddress == null) continue;
                    InetAddress address = interfaceAddress.getAddress();
                    if (!(address instanceof Inet4Address) || address.isLoopbackAddress()) continue;

                    JSONObject item = new JSONObject();
                    try {
                        item.put("name", network.getName() == null ? "" : network.getName());
                        item.put("displayName", network.getDisplayName() == null ? "" : network.getDisplayName());
                        item.put("ipv4", address.getHostAddress() == null ? "" : address.getHostAddress());
                        InetAddress broadcast = interfaceAddress.getBroadcast();
                        item.put("broadcast", broadcast == null || broadcast.getHostAddress() == null ? "" : broadcast.getHostAddress());
                        item.put("prefixLength", Math.max(0, interfaceAddress.getNetworkPrefixLength()));
                        item.put("multicast", multicast);
                        out.put(item);
                    } catch (Exception ignored) {
                        // Skip a malformed interface row and continue.
                    }
                }
            }
        } catch (Exception ignored) {
            // Diagnostics must never affect DMX output.
        }
        return out;
    }
}
