package utm.server.features.authentication.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUserDTO {
    @NotBlank
    private String currentPassword;

    private String newPassword;
    private String newEmail;
    private String newName;
    private String role; // <-- adăugat pentru a primi buyer/seller
}
