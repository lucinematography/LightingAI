package com.lightingai.app;

import java.nio.ByteBuffer;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.concurrent.CancellationException;
import javax.crypto.Cipher;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;

/** Portable password encryption. No files, logging, network, device keys or Android dependencies. */
public final class SceneBackupCrypto {
    public static final int ITERATIONS = 600000;
    public static final int MAX_PLAIN_BYTES = 24 * 1024 * 1024;
    public static final int MAX_FILE_BYTES = 34 * 1024 * 1024;
    private static final byte[] MAGIC = {'L','A','I','S','B',1};
    private static final int HEADER_BYTES = 54; // magic/version, iterations BE32, salt[32], nonce[12]
    private SceneBackupCrypto() { }

    public static byte[] encrypt(byte[] plain, char[] password) throws GeneralSecurityException {
        if (plain == null || plain.length == 0 || plain.length > MAX_PLAIN_BYTES ||
            password == null || password.length < 12 || password.length > 1024)
            throw new IllegalArgumentException("Unsupported backup input");
        byte[] salt = new byte[32], nonce = new byte[12];
        SecureRandom random = new SecureRandom(); random.nextBytes(salt); random.nextBytes(nonce);
        byte[] header = ByteBuffer.allocate(HEADER_BYTES).put(MAGIC).putInt(ITERATIONS).put(salt).put(nonce).array();
        byte[] cipher = crypt(Cipher.ENCRYPT_MODE, plain, password, salt, nonce, header);
        byte[] result = new byte[HEADER_BYTES + cipher.length];
        System.arraycopy(header, 0, result, 0, HEADER_BYTES);
        System.arraycopy(cipher, 0, result, HEADER_BYTES, cipher.length);
        return result;
    }

    public static byte[] decrypt(byte[] encoded, char[] password) throws GeneralSecurityException {
        if (encoded == null || encoded.length < HEADER_BYTES + 17 ||
            encoded.length > MAX_PLAIN_BYTES + HEADER_BYTES + 16 ||
            password == null || password.length == 0 || password.length > 1024)
            throw new IllegalArgumentException("Unsupported backup input");
        ByteBuffer header = ByteBuffer.wrap(encoded, 0, HEADER_BYTES);
        byte[] magic = new byte[6]; header.get(magic);
        // Reject attacker-controlled KDF cost and unknown formats before expensive work.
        if (!Arrays.equals(magic, MAGIC) || header.getInt() != ITERATIONS)
            throw new IllegalArgumentException("Unsupported backup version");
        byte[] salt = new byte[32], nonce = new byte[12]; header.get(salt); header.get(nonce);
        return crypt(Cipher.DECRYPT_MODE, Arrays.copyOfRange(encoded, HEADER_BYTES, encoded.length),
            password, salt, nonce, Arrays.copyOf(encoded, HEADER_BYTES));
    }

    private static byte[] crypt(int mode, byte[] input, char[] password, byte[] salt,
                                byte[] nonce, byte[] aad) throws GeneralSecurityException {
        byte[] key = null;
        PBEKeySpec spec = new PBEKeySpec(password, salt, ITERATIONS, 256);
        try {
            if (Thread.currentThread().isInterrupted()) throw new CancellationException();
            key = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
            if (Thread.currentThread().isInterrupted()) throw new CancellationException();
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(mode, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, nonce));
            cipher.updateAAD(aad);
            return cipher.doFinal(input); // No plaintext leaves this function until the tag is verified.
        } finally {
            spec.clearPassword();
            if (key != null) Arrays.fill(key, (byte) 0);
        }
    }
}
