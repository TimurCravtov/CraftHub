package utm.server.features.order;

import utm.server.features.users.AccountType;

public enum Status {

    IN_CART("In_cart"),
    PENDING("Pending"),
    CONFIRMED("Confirmed"),
    OUT_FOR_DELIVERY("Out_for_delivery"),
    DELIVERED("Delivered"),
    CANCELLED("Cancelled");


    private final String value;

    Status(String value) {
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
