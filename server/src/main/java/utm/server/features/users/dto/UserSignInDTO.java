package utm.server.features.users.dto;

import lombok.Data;

@Data
public class UserSignInDTO {
    private String email;
    private String password;
}
