package com.lightingai.app;

import java.net.Inet4Address;
import java.net.Inet6Address;
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
                    if (!(address instanceof Inet4Address) && !(address instanceof Inet6Address)) continue;
                    if (address.isLoopbackAddress()) continue;

                    JSONObject item = new JSONObject();
                    try {
                        item.put("name", network.getName() == null ? "" : network.getName());
                        item.put("displayName", network.getDisplayName() == null ? "" : network.getDisplayName());
                        if (address instanceof Inet4Address) {
                            item.put("ipv4", address.getHostAddress() == null ? "" : address.getHostAddress());
                            item.put("ipv6", "");
                        } else {
                            item.put("ipv4", "");
                            item.put("ipv6", stripIpv6Scope(address.getHostAddress()));
                        }
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

    static List<NetworkInterface> multicastIpv6Interfaces() {
        List<NetworkInterface> result = new ArrayList<>();
        try {
            Enumeration<NetworkInterface> raw = NetworkInterface.getNetworkInterfaces();
            if (raw == null) return result;
            for (NetworkInterface network : Collections.list(raw)) {
                if (network == null) continue;
                try {
                    if (!network.isUp() || network.isLoopback() || !network.supportsMulticast()) continue;
                    boolean hasIpv6 = false;
                    for (InterfaceAddress interfaceAddress : network.getInterfaceAddresses()) {
                        if (interfaceAddress == null) continue;
                        InetAddress address = interfaceAddress.getAddress();
                        if (address instanceof Inet6Address && !address.isLoopbackAddress()) {
                            hasIpv6 = true;
                            break;
                        }
                    }
                    if (hasIpv6) result.add(network);
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

    static List<NetworkInterface> dualStackMulticastInterfaces() {
        List<NetworkInterface> result = new ArrayList<>();
        for (NetworkInterface v4 : multicastIpv4Interfaces()) {
            String name = v4.getName();
            for (NetworkInterface v6 : multicastIpv6Interfaces()) {
                if (String.valueOf(name).equals(String.valueOf(v6.getName()))) {
                    result.add(v4);
                    break;
                }
            }
        }
        result.sort((a,b) -> String.valueOf(a.getName()).compareTo(String.valueOf(b.getName())));
        return result;
    }

    static String normalizeSacnIpMode(String mode) {
        String value = mode == null ? "" : mode.trim().toLowerCase(java.util.Locale.ROOT);
        if ("ipv6".equals(value) || "dual".equals(value)) return value;
        return "ipv4";
    }

    static List<NetworkInterface> sacnMulticastInterfaces(String mode) {
        String normalized = normalizeSacnIpMode(mode);
        if ("ipv6".equals(normalized)) return multicastIpv6Interfaces();
        if ("dual".equals(normalized)) return dualStackMulticastInterfaces();
        return multicastIpv4Interfaces();
    }

    public static int sacnMulticastInterfaceCount(String mode) {
        return sacnMulticastInterfaces(mode).size();
    }

    public static String singleSacnMulticastInterfaceName(String mode) {
        List<NetworkInterface> routes = sacnMulticastInterfaces(mode);
        if (routes.size() != 1) return "";
        String name = routes.get(0).getName();
        return name == null ? "" : name;
    }

    static NetworkInterface requireSingleSacnMulticastInterface(String mode) {
        String normalized = normalizeSacnIpMode(mode);
        List<NetworkInterface> routes = sacnMulticastInterfaces(normalized);
        if (routes.isEmpty()) throw new IllegalStateException("No active " + normalized + " multicast interface for sACN");
        if (routes.size() != 1) throw new IllegalStateException("Multiple " + normalized + " multicast interfaces; re-arm on a dedicated lighting network");
        return routes.get(0);
    }

    public static String sacnSignature(String mode) {
        String normalized = normalizeSacnIpMode(mode);
        List<NetworkInterface> routes = sacnMulticastInterfaces(normalized);
        if (routes.size() != 1) return "";
        NetworkInterface network = routes.get(0);
        List<String> addresses = new ArrayList<>();
        for (InterfaceAddress interfaceAddress : network.getInterfaceAddresses()) {
            if (interfaceAddress == null) continue;
            InetAddress address = interfaceAddress.getAddress();
            if (address == null || address.isLoopbackAddress()) continue;
            if ("ipv4".equals(normalized) && address instanceof Inet4Address) {
                addresses.add("4:" + address.getHostAddress());
            } else if ("ipv6".equals(normalized) && address instanceof Inet6Address) {
                addresses.add("6:" + stripIpv6Scope(address.getHostAddress()));
            } else if ("dual".equals(normalized) && (address instanceof Inet4Address || address instanceof Inet6Address)) {
                addresses.add((address instanceof Inet4Address ? "4:" : "6:") + stripIpv6Scope(address.getHostAddress()));
            }
        }
        Collections.sort(addresses);
        if (addresses.isEmpty()) return "";
        return normalized + "|" + String.valueOf(network.getName()) + "|" + String.join(",", addresses);
    }

    private static String stripIpv6Scope(String value) {
        if (value == null) return "";
        int percent = value.indexOf('%');
        return percent >= 0 ? value.substring(0, percent) : value;
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
