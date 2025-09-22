package utm.server.features.authentication.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserSignInDTO {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;
}
