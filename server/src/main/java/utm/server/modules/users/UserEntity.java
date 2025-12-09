package utm.server.modules.users;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import utm.server.modules.billing.BillingEntity;
import utm.server.modules.authentication.dto.AuthProvider;
import utm.server.modules.shops.ShopEntity;
import utm.server.modules.users.security.AesConverter;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@AllArgsConstructor
@Entity
@Builder
@Table
public class UserEntity implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    @Builder.Default
    private UUID uuid = UUID.randomUUID();

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // ===================== 2FA =====================

    @Convert(converter = AesConverter.class)
    @Column
    private String twoFactorSecret;

    @Convert(converter = AesConverter.class)
    @Column
    private String tempTwoFactorSecret;

    @Column(nullable = false)
    private boolean twoFactorEnabled = false;

    // ===================== RELATIONS =====================

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private BillingEntity billingInfo;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ShopEntity> shops;

    // ===================== AUTH =====================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider = AuthProvider.LOCAL;

    private String providerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType accountType = AccountType.BUYER;

    @Column
    private String profilePictureKey;

    // ===================== CONSTRUCTORS =====================

    public UserEntity(String name, String email, String password, AuthProvider provider) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.provider = provider != null ? provider : AuthProvider.LOCAL;
    }

    public UserEntity(String name, String email, AuthProvider provider) {
        this.name = name;
        this.email = email;
        this.password = ""; // OAuth users
        this.provider = provider != null ? provider : AuthProvider.LOCAL;
    }

    // ===================== UserDetails =====================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
