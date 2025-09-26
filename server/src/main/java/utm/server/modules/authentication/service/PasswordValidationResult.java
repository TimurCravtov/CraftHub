package utm.server.modules.authentication.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PasswordValidationResult {
    private boolean isValid;
    private List<String> errors;

}
