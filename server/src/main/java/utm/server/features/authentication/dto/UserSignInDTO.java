package utm.server.features.authentication.dto;

import lombok.Data;

@Data
public class UserSignInDTO {
    private String email;
    private String password;
}
