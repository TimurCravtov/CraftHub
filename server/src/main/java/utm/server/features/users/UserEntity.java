package utm.server.features.users;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import utm.server.features.billing.BillingEntity;

import utm.server.features.authentication.dto.AuthProvider;
import utm.server.features.products.Product;
import utm.server.features.shops.ShopEntity;

import java.util.Collection;
import java.util.List;

@Data
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@AllArgsConstructor
@Entity
@Table
@Builder
public class UserEntity implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)

    @Enumerated(EnumType.STRING)
    private AccountType accountType;
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private BillingEntity billingInfo;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ShopEntity> shops;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider = AuthProvider.LOCAL; 

    // @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, orphanRemoval = true)
    // private List<Product> products;

    @Column
    private String twoFactorSecret;

    @Column(nullable = false)
    private boolean twoFactorEnabled = false;
    
    @Column
    private String tempTwoFactorSecret; 

    public UserEntity(String name, String email, String password, AccountType accountType) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.accountType = accountType;
        this.provider = AuthProvider.LOCAL; 
    }

    // public UserEntity(String name, String email, String accountType, AuthProvider provider) {
    //     this.name = name;
    //     this.email = email;
    //     this.accountType = accountType;
    //     this.provider = provider;
    //     this.password = ""; 
    // }   
    //ACEASTA FUNCTIE ERA INITIALA SI AM EROARE CA NU RECUNOASTE accountType CA PARAMETRU
    public UserEntity(String name, String email, String accountType, AuthProvider provider) {
        this.name = name;
        this.email = email;
        try {
            this.accountType = AccountType.valueOf(accountType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid account type: " + accountType);
        }
        this.provider = provider;
        this.password = ""; 
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return password;
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
