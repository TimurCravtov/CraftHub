package utm.server.except;

/**
 * This message is displayed as API response for an error. <u>Should not</u> contain sensitive data
 */
public record ErrorMessage(int code, String message) {
}
