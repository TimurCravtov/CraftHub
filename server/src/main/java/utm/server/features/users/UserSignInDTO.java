package utm.server.features.users;

import lombok.Data;

@Data
public class UserSignInDTO {
    private String email;
    private String password;
}
