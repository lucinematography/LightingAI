package com.lightingai.app;
import java.util.Locale;
import java.util.UUID;
public final class AsteraBtbCapturedFrames {
 public enum Preset { RED, WHITE, GREEN, BLUE }
 public static final UUID SERVICE_UUID=UUID.fromString("0a6c6c72-9ca6-ffaf-3440-b2dae8c86a65");
 public static final UUID WRITE_UUID=UUID.fromString("0a6c6c72-9ca6-ffaf-3440-b2dae8c86a66");
 public static final String CAPTURE_REVISION="2026-10-07-titan-fp1-btb";
 private static final byte[] RED=decodeHex("0A107EDF36000000007D63130D000E000CFF406A");
 private static final byte[] WHITE=decodeHex("0A107EDF36000000007D63130DD30E960CFFBE0F");
 private static final byte[] GREEN=decodeHex("0A107EDF36000000007D63130C010E030DFFC1A7");
 private static final byte[] BLUE=decodeHex("0A107EDF36000000007D63130C070D010EFFB58E");
 private AsteraBtbCapturedFrames(){}
 // These frames came from one fixture/session, not a generalized Astera driver.
 public static boolean supportsDeviceName(String name){return name!=null&&"TITAN 01021450".equals(name.trim().toUpperCase(Locale.US));}
 public static Preset parsePreset(String v){String n=v==null?"":v.trim().toUpperCase(Locale.US);for(Preset p:Preset.values())if(p.name().equals(n))return p;throw new IllegalArgumentException("unsupported captured preset");}
 public static byte[] frameFor(String v){return frameFor(parsePreset(v));}
 public static byte[] frameFor(Preset p){byte[] s;switch(p){case RED:s=RED;break;case WHITE:s=WHITE;break;case GREEN:s=GREEN;break;case BLUE:s=BLUE;break;default:throw new IllegalArgumentException();}return s.clone();}
 public static String hexFor(Preset p){return toHex(frameFor(p));}
 public static boolean isValidFrame(byte[] f){if(f==null||f.length!=20||(f[0]&255)!=10)return false;int len=f[1]&255;if(len!=16||f.length!=len+4)return false;int exp=((f[f.length-2]&255)<<8)|(f[f.length-1]&255);return crc16Modbus(f,1,f.length-3)==exp;}
 public static int[] capturedRgb(Preset p){byte[] f=frameFor(p);int r=-1,g=-1,b=-1;for(int i=12;i<=16;i+=2){int c=f[i]&255,v=f[i+1]&255;if(c==12)r=v;else if(c==13)g=v;else if(c==14)b=v;}return new int[]{r,g,b};}
 static int crc16Modbus(byte[] d,int o,int l){int c=0xffff;for(int i=o;i<o+l;i++){c^=d[i]&255;for(int bit=0;bit<8;bit++)c=(c&1)!=0?(c>>>1)^0xa001:c>>>1;}return c&0xffff;}
 private static byte[] decodeHex(String h){if(h==null||(h.length()&1)!=0)throw new IllegalArgumentException();byte[] o=new byte[h.length()/2];for(int i=0;i<o.length;i++){int a=Character.digit(h.charAt(i*2),16),b=Character.digit(h.charAt(i*2+1),16);if(a<0||b<0)throw new IllegalArgumentException();o[i]=(byte)((a<<4)|b);}return o;}
 private static String toHex(byte[] d){StringBuilder o=new StringBuilder();for(byte b:d)o.append(String.format(Locale.US,"%02X",b&255));return o.toString();}
}
