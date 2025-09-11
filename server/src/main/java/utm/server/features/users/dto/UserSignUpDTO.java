package utm.server.features.users.dto;

import lombok.Data;
import utm.server.features.users.AccountType;

@Data
public class UserSignUpDTO {

    private String name;
    private String email;
    private String password;
    private AccountType accountType;
}
