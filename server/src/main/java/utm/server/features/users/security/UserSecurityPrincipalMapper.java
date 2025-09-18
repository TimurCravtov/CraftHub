package utm.server.features.users.security;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import utm.server.features.users.UserEntity;
import utm.server.features.users.UserRepository;

@Component
@RequiredArgsConstructor
public class UserSecurityPrincipalMapper {

    private final UserRepository userRepository;

    public UserEntity getUser(UserSecurityPrincipal userSecurityPrincipal) {
        return  userRepository.findById(userSecurityPrincipal.getId()).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
