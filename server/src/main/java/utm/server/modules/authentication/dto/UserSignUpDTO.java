package utm.server.modules.authentication.dto;

import lombok.Data;
import utm.server.modules.users.AccountType;

@Data
public class UserSignUpDTO {
    private String name;
    private String email;
    private String password;
    private AuthProvider provider; // in loc de accountType
    private AccountType accountType;
}
