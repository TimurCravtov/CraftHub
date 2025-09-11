package utm.server.authentication.service;

import com.twilio.Twilio;
import com.twilio.exception.ApiException;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    // In-memory store for OTPs (replace with database or Redis for production)
    private final Map<Long, OtpData> otpStore = new ConcurrentHashMap<>();

    // Initialize Twilio with account SID and auth token
    public SmsService(@Value("${twilio.account.sid}") String accountSid,
                     @Value("${twilio.auth.token}") String authToken) {
        Twilio.init(accountSid, authToken);
    }

    // Generate a 6-digit OTP
    public String generateOtp(Long userId) {
        SecureRandom random = new SecureRandom();
        int otp = 100_000 + random.nextInt(900_000); // 6-digit OTP
        String otpString = String.valueOf(otp);
        otpStore.put(userId, new OtpData(otpString, System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(5))); // 5-minute expiration
        return otpString;
    }

    // Send OTP via SMS using Twilio
    public void sendOtp(String phoneNumber, String otp) {
        try {
            Message message = Message.creator(
                new PhoneNumber(phoneNumber), // Recipient's phone number
                new PhoneNumber(twilioPhoneNumber), // Twilio phone number
                "Your verification code is: " + otp
            ).create();
            logger.info("SMS sent successfully to {} with message SID: {}", phoneNumber, message.getSid());
        } catch (ApiException e) {
            logger.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage());
            throw new RuntimeException("Failed to send SMS: " + e.getMessage(), e);
        }
    }

    // Verify OTP
    public boolean verifyOtp(Long userId, String otp) {
        OtpData otpData = otpStore.get(userId);
        if (otpData == null || otpData.isExpired()) {
            otpStore.remove(userId);
            logger.warn("OTP verification failed for userId {}: OTP expired or not found", userId);
            return false;
        }
        boolean isValid = otpData.getOtp().equals(otp);
        if (isValid) {
            otpStore.remove(userId); // Clear OTP after successful verification
            logger.info("OTP verified successfully for userId {}", userId);
        } else {
            logger.warn("OTP verification failed for userId {}: Invalid code", userId);
        }
        return isValid;
    }

    // Helper class to store OTP and expiration time
    private static class OtpData {
        private final String otp;
        private final long expirationTime;

        public OtpData(String otp, long expirationTime) {
            this.otp = otp;
            this.expirationTime = expirationTime;
        }

        public String getOtp() {
            return otp;
        }

        public boolean isExpired() {
            return System.currentTimeMillis() > expirationTime;
        }
    }
}