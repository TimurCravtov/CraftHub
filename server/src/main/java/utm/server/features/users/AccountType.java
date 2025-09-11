package utm.server.features.users;

public enum AccountType {
    BUYER("Buyer"),
    SELLER("Seller");

    private final String value;

    AccountType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static AccountType fromString(String value) {
        for (AccountType type : AccountType.values()) {
            if (type.getValue().equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unexpected value: " + value);
    }
}