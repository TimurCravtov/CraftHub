package utm.server.modules.billing;

import lombok.Data;

@Data
public class BillingDTO {
    private Long id;
    private String lastName;
    private String phoneNumber;
    private String city;
    private String address;
}
