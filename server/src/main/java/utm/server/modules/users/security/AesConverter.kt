package utm.server.modules.users.security

import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.nio.charset.StandardCharsets
import java.util.*
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec

@Component
@Converter
class AesConverter : AttributeConverter<String?, String?> {
    @Value("\${tfa.encryption.key}")
    private val key: String? = null

    private var secretKey: SecretKeySpec? = null

    private fun initKey() {
        if (secretKey == null) {
            check(!(key == null || !(key.length == 16 || key.length == 24 || key.length == 32))) { "Property tfa.encryption.key must be 16, 24 or 32 characters long" }
            secretKey = SecretKeySpec(
                key.toByteArray(StandardCharsets.UTF_8),
                ALGORITHM
            )
        }
    }

    override fun convertToDatabaseColumn(attribute: String?): String? {
        if (attribute == null || attribute.isBlank()) return null
        initKey()
        try {
            val cipher = Cipher.getInstance(ALGORITHM)
            cipher.init(Cipher.ENCRYPT_MODE, secretKey)
            return Base64.getEncoder()
                .encodeToString(cipher.doFinal(attribute.toByteArray(StandardCharsets.UTF_8)))
        } catch (e: Exception) {
            throw IllegalStateException("Failed to encrypt 2FA secret", e)
        }
    }

    override fun convertToEntityAttribute(dbData: String?): String? {
        if (dbData == null || dbData.isBlank()) return null
        initKey()
        try {
            val cipher = Cipher.getInstance(ALGORITHM)
            cipher.init(Cipher.DECRYPT_MODE, secretKey)
            return String(
                cipher.doFinal(Base64.getDecoder().decode(dbData)),
                StandardCharsets.UTF_8
            )
        } catch (e: Exception) {
            log.error("Failed to decrypt 2FA secret for value: {}. Error: {}", dbData, e.message)
            return null
        }
    }

    companion object {
        private val log: Logger = LoggerFactory.getLogger(AesConverter::class.java)
        private const val ALGORITHM = "AES"
    }
}
