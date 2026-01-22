package utm.server.modules.users;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class RoleInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    @Transactional
    public void run(String... args) {
        String roleName = "ROLE_ADMIN";
        
        if (roleRepository.findByName(roleName).isEmpty()) {
            RoleEntity adminRole = RoleEntity.builder()
                    .name(roleName)
                    .build();
            roleRepository.save(adminRole);
            log.info("Created role: {}", roleName);
        } else {
            log.info("Role {} already exists", roleName);
        }
    }
}
