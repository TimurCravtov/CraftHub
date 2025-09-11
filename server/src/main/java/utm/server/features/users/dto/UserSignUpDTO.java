package utm.server.features.users.dto;

import lombok.Data;

@Data
public class UserSignUpDTO {

    private String name;
    private String email;
    private String password;
    private String accountType;
}
