package utm.server.modules.users;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')") // This requires the role name to be "ROLE_ADMIN" in the database if default prefix is used, or just "ADMIN" if configured otherwise.
    // Spring Security default is ROLE_ prefix. So if I store "ROLE_ADMIN", hasRole('ADMIN') works.
    // If I store "ADMIN", hasAuthority('ADMIN') works.
    // Let's stick to standard: Store "ROLE_ADMIN", use hasRole('ADMIN').
    public String adminDashboard() {
        return "Welcome to Admin Dashboard";
    }
}
