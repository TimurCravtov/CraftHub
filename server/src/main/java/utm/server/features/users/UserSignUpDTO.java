package utm.server.features.users;

import lombok.Data;

@Data
public class UserSignUpDTO {

    private String name;
    private String email;
    private String password;
    private String accountType;
}
