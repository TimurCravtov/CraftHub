package utm.server.modules.users.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import utm.server.modules.users.AccountType;
import utm.server.modules.authentication.dto.AuthProvider;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String name;
    private String email;
    private Long id;
    private String profilePictureLink;
    private AccountType accountType;
    private AuthProvider provider;
}
