package utm.server.features.users.dto;


import lombok.Data;
import utm.server.features.users.AccountType;

@Data
public class UserRequestDTO {
    private String name;
    private String email;
    private AccountType accountType;
}
