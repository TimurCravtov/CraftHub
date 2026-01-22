package utm.server.modules.billing;

import org.junit.jupiter.api.Test;

import utm.server.modules.users.UserEntity;
import utm.server.modules.users.UserRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

class BillingServiceTest {

    @Test
    void updateBillingInfo_savesBillingEntity() {
        BillingRepository billingRepository = mock(BillingRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        BillingService service = new BillingService(billingRepository, userRepository);

        BillingDTO dto = new BillingDTO();
        dto.setCity("City");
        dto.setAddress("Addr");
        dto.setLastName("LN");
        dto.setPhoneNumber("123");

        UserEntity user = new UserEntity();
        user.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        service.updateBillingInfo(1L, dto);

        verify(billingRepository, times(1)).save(argThat(entity ->
                "City".equals(entity.getCity()) &&
                "Addr".equals(entity.getAddress()) &&
                "LN".equals(entity.getLastName()) &&
                "123".equals(entity.getPhoneNumber()) &&
                entity.getUser() == user
        ));
    }
}
