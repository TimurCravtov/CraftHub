package utm.server.features.users.dto;


import lombok.Data;

@Data
public class UserRequestDTO {
    private String name;
    private String email;
    private String accountType;
}
