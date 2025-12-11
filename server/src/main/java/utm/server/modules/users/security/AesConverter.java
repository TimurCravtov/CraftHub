package utm.server.modules.users.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
@Converter
public class AesConverter implements AttributeConverter<String, String> {

    private static final Logger log = LoggerFactory.getLogger(AesConverter.class);
    private static final String ALGORITHM = "AES";

    @Value("${tfa.encryption.key}")
    private String key;

    private SecretKeySpec secretKey;

    private void initKey() {
        if (secretKey == null) {
            if (key == null || !(key.length() == 16 || key.length() == 24 || key.length() == 32)) {
                throw new IllegalStateException(
                    "Property tfa.encryption.key must be 16, 24 or 32 characters long"
                );
            }
            secretKey = new SecretKeySpec(
                    key.getBytes(StandardCharsets.UTF_8),
                    ALGORITHM
            );
        }
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isBlank()) return null;
        initKey();
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            return Base64.getEncoder()
                    .encodeToString(cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Failed to encrypt 2FA secret", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return null;
        initKey();
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            return new String(
                    cipher.doFinal(Base64.getDecoder().decode(dbData)),
                    StandardCharsets.UTF_8
            );
        } catch (Exception e) {
            log.error("Failed to decrypt 2FA secret for value: {}. Error: {}", dbData, e.getMessage());
            return null;
        }
    }
}
