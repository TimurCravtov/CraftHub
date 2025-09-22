package utm.server.features.authentication.dto;

import com.twilio.rest.api.v2010.Account;

import lombok.Data;
import utm.server.features.authentication.dto.AuthProvider;
import utm.server.features.users.AccountType;

@Data
public class UserSignUpDTO {
    private String name;
    private String email;
    private String password;
    private AuthProvider provider; // in loc de accountType
    private AccountType accountType;
}
