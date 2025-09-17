package utm.server.features.users;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import utm.server.features.order.Status;

@Getter
@RequiredArgsConstructor
public enum AccountType {
    BUYER("Buyer"),
    SELLER("Seller");

    private final String value;

    public static AccountType fromString(String value) {
        return Status.fromString(value);
    }
}