package utm.server.modules.users.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Converter
public class AesConverter implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES";
    private static final String ENV_KEY = "TFA_ENCRYPTION_KEY";

    private static final SecretKeySpec SECRET_KEY;

    static {
        String key = System.getenv(ENV_KEY);
        if (key == null || !(key.length() == 16 || key.length() == 24 || key.length() == 32)) {
            throw new IllegalStateException(
                "Environment variable TFA_ENCRYPTION_KEY must be 16, 24 or 32 characters long"
            );
        }
        SECRET_KEY = new SecretKeySpec(
                key.getBytes(StandardCharsets.UTF_8),
                ALGORITHM
        );
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isBlank()) return null;
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, SECRET_KEY);
            return Base64.getEncoder()
                    .encodeToString(cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Failed to encrypt 2FA secret", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return null;
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, SECRET_KEY);
            return new String(
                    cipher.doFinal(Base64.getDecoder().decode(dbData)),
                    StandardCharsets.UTF_8
            );
        } catch (Exception e) {
            throw new IllegalStateException("Failed to decrypt 2FA secret", e);
        }
    }
}
