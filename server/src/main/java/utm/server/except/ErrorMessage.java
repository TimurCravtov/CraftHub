package utm.server.except;

/**
 * This message is displayed as API response for an error. **Should not** contain sensitive data
 */
public record ErrorMessage(int code, String message) {
}
