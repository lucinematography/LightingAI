package com.lightingai.app;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.InterfaceAddress;
import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
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

    static List<NetworkInterface> multicastIpv4Interfaces() {
        List<NetworkInterface> result = new ArrayList<>();
        try {
            Enumeration<NetworkInterface> raw = NetworkInterface.getNetworkInterfaces();
            if (raw == null) return result;
            for (NetworkInterface network : Collections.list(raw)) {
                if (network == null) continue;
                try {
                    if (!network.isUp() || network.isLoopback() || !network.supportsMulticast()) continue;
                    boolean hasIpv4 = false;
                    for (InterfaceAddress interfaceAddress : network.getInterfaceAddresses()) {
                        if (interfaceAddress == null) continue;
                        InetAddress address = interfaceAddress.getAddress();
                        if (address instanceof Inet4Address && !address.isLoopbackAddress()) {
                            hasIpv4 = true;
                            break;
                        }
                    }
                    if (hasIpv4) result.add(network);
                } catch (Exception ignored) {
                    // Skip interfaces that cannot be inspected reliably.
                }
            }
        } catch (Exception ignored) {
            // Treat enumeration failure as no safe multicast route.
        }
        result.sort((a,b) -> String.valueOf(a.getName()).compareTo(String.valueOf(b.getName())));
        return result;
    }

    public static int multicastIpv4InterfaceCount() {
        return multicastIpv4Interfaces().size();
    }

    public static String singleMulticastIpv4InterfaceName() {
        List<NetworkInterface> routes = multicastIpv4Interfaces();
        if (routes.size() != 1) return "";
        String name = routes.get(0).getName();
        return name == null ? "" : name;
    }

    static NetworkInterface requireSingleMulticastIpv4Interface() {
        List<NetworkInterface> routes = multicastIpv4Interfaces();
        if (routes.isEmpty()) throw new IllegalStateException("No active IPv4 multicast interface");
        if (routes.size() != 1) throw new IllegalStateException("Multiple IPv4 multicast interfaces; re-arm on a dedicated lighting network");
        return routes.get(0);
    }

    public static String signature() {
        return signature(snapshot());
    }

    static String signature(JSONArray snapshot) {
        if (snapshot == null || snapshot.length() == 0) return "";
        List<String> rows = new ArrayList<>();
        for (int i = 0; i < snapshot.length(); i++) {
            JSONObject item = snapshot.optJSONObject(i);
            if (item == null) continue;
            String name = item.optString("name", "");
            String ipv4 = item.optString("ipv4", "");
            String broadcast = item.optString("broadcast", "");
            int prefix = item.optInt("prefixLength", -1);
            boolean multicast = item.optBoolean("multicast", false);
            if (ipv4.isEmpty()) continue;
            rows.add(name + "|" + ipv4 + "|" + broadcast + "|" + prefix + "|" + multicast);
        }
        Collections.sort(rows);
        return String.join(";", rows);
    }
}
