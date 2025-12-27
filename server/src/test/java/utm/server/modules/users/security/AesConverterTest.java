package utm.server.modules.users.security;

import org.junit.jupiter.api.Test;
import utm.server.modules.users.security.AesConverter;

import javax.crypto.spec.SecretKeySpec;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class AesConverterTest {

    @Test
    void encryptDecrypt_roundTrip() throws Exception {
        AesConverter converter = new AesConverter();
        SecretKeySpec sk = new SecretKeySpec("0123456789abcdef".getBytes(StandardCharsets.UTF_8), "AES");
        Field secretKeyField = AesConverter.class.getDeclaredField("secretKey");
        secretKeyField.setAccessible(true);
        secretKeyField.set(converter, sk);

        String original = "hello-2fa";
        String db = converter.convertToDatabaseColumn(original);
        assertNotNull(db);
        assertNotEquals(original, db);

        String back = converter.convertToEntityAttribute(db);
        assertEquals(original, back);
    }

    @Test
    void nullAndBlankHandled() throws Exception {
        AesConverter converter = new AesConverter();
        SecretKeySpec sk = new SecretKeySpec("0123456789abcdef".getBytes(StandardCharsets.UTF_8), "AES");
        Field secretKeyField = AesConverter.class.getDeclaredField("secretKey");
        secretKeyField.setAccessible(true);
        secretKeyField.set(converter, sk);

        assertNull(converter.convertToDatabaseColumn(null));
        assertNull(converter.convertToDatabaseColumn(""));
        assertNull(converter.convertToEntityAttribute(null));
        assertNull(converter.convertToEntityAttribute(""));
    }
}
