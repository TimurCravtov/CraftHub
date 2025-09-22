package utm.server.features.users.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import utm.server.features.users.AccountType;
import utm.server.features.authentication.dto.AuthProvider;

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
