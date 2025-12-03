package utm.server.modules.authentication.service;

import com.nulabinc.zxcvbn.Strength;
import com.nulabinc.zxcvbn.Zxcvbn;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
public class PasswordValidator {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 64;

    private static final Pattern HAS_UPPER = Pattern.compile("[A-Z]");
    private static final Pattern HAS_LOWER = Pattern.compile("[a-z]");
    private static final Pattern HAS_DIGIT = Pattern.compile("[0-9]");
    private static final Pattern HAS_SPECIAL = Pattern.compile("[^a-zA-Z0-9]");

    // Extendable: load from resources/common-passwords.txt if you want thousands
    private static final Set<String> COMMON_PASSWORDS = Set.of(
            "password", "123456", "123456789", "qwerty", "abc123",
            "111111", "123123", "letmein", "welcome", "admin"
    );

    private static final double MIN_ENTROPY = 3.0; // bits per character (heuristic)

    private final Zxcvbn zxcvbn = new Zxcvbn();

    /**
     * Validate password against multiple rules.
     * Returns PasswordValidationResult (valid flag + errors).
     */
    public PasswordValidationResult validate(String password, String email, String name) {
        List<String> errors = new ArrayList<>();

        if (password == null || password.isBlank()) {
            errors.add("Password is required");
            return new PasswordValidationResult(false, errors);
        }

        String normalizedPassword = password.trim();
        String lowerPassword = normalizedPassword.toLowerCase();

        // --- Basic policy checks ---
        if (normalizedPassword.length() < MIN_LENGTH) {
            errors.add("Password must be at least " + MIN_LENGTH + " characters long");
        }
        if (normalizedPassword.length() > MAX_LENGTH) {
            errors.add("Password is too long");
        }
        if (!HAS_UPPER.matcher(normalizedPassword).find()) {
            errors.add("Password must contain an uppercase letter");
        }
        if (!HAS_LOWER.matcher(normalizedPassword).find()) {
            errors.add("Password must contain a lowercase letter");
        }
        if (!HAS_DIGIT.matcher(normalizedPassword).find()) {
            errors.add("Password must contain a digit");
        }
        if (!HAS_SPECIAL.matcher(normalizedPassword).find()) {
            errors.add("Password must contain a special character");
        }

        // --- Common password blacklist ---
        if (COMMON_PASSWORDS.contains(lowerPassword)) {
            errors.add("Password is too common");
        }

        // --- Personal data similarity ---
        if (email != null && email.contains("@")) {
            String localPart = email.substring(0, email.indexOf("@")).toLowerCase();
            if (!localPart.isBlank() && lowerPassword.contains(localPart)) {
                errors.add("Password is too similar to your email");
            }
        }
        if (name != null) {
            for (String token : name.toLowerCase().split("\\s+")) {
                if (!token.isBlank() && lowerPassword.contains(token)) {
                    errors.add("Password is too similar to your name");
                    break;
                }
            }
        }

        // --- Entropy check ---
        if (calculateEntropy(normalizedPassword) < MIN_ENTROPY) {
            errors.add("Password is too predictable (low entropy)");
        }

        // --- HIBP check ---
        if (isLeakedPassword(normalizedPassword)) {
            errors.add("Password has been found in a data breach (choose another)");
        }

        // --- zxcvbn strength check ---
        Strength strength = zxcvbn.measure(normalizedPassword);
        if (strength.getScore() < 3) { // 0=very weak → 4=very strong
            if (strength.getFeedback().getWarning() != null &&
                    !strength.getFeedback().getWarning().isBlank()) {
                errors.add("Password is too weak: " + strength.getFeedback().getWarning());
            }
            if (strength.getFeedback().getSuggestions() != null) {
                errors.addAll(
                        strength.getFeedback().getSuggestions().stream()
                                .filter(s -> !s.isBlank())
                                .collect(Collectors.toList())
                );
            }
        }

        return new PasswordValidationResult(errors.isEmpty(), errors);
    }

    /**
     * Estimate Shannon entropy (bits per character).
     */
    private double calculateEntropy(String password) {
        Map<Character, Integer> freqMap = new HashMap<>();
        for (char c : password.toCharArray()) {
            freqMap.put(c, freqMap.getOrDefault(c, 0) + 1);
        }

        double entropy = 0.0;
        int length = password.length();
        for (int count : freqMap.values()) {
            double p = (double) count / length;
            entropy -= p * (Math.log(p) / Math.log(2));
        }
        return entropy; // average bits per char
    }

    /**
     * Check against HaveIBeenPwned Pwned Passwords API (k-anonymity).
     * Returns true if password has been leaked.
     */
    private boolean isLeakedPassword(String password) {
        try {
            MessageDigest sha1 = MessageDigest.getInstance("SHA-1");
            byte[] hashBytes = sha1.digest(password.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02X", b));
            }
            String hash = sb.toString();
            String prefix = hash.substring(0, 5);
            String suffix = hash.substring(5);

            URL url = new URL("https://api.pwnedpasswords.com/range/" + prefix);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "PasswordValidator");

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    String[] parts = line.split(":");
                    if (parts[0].equalsIgnoreCase(suffix)) {
                        return true; // found in breach
                    }
                }
            }
        } catch (Exception e) {
            // Fail-safe: if API fails, don’t block password
            System.err.println("HIBP check failed: " + e.getMessage());
        }
        return false;
    }
}
