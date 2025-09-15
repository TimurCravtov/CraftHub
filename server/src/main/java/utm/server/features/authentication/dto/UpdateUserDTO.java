package utm.server.authentication.dto;

import lombok.Data;

@Data
public class UpdateUserDTO {
    private String currentPassword;
    private String newPassword;
    private String newEmail;
    private String newName;
}
