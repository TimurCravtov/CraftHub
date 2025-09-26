package utm.server.modules.authentication.except;

import lombok.Getter;
import utm.server.except.ErrorMessage;

import java.util.List;

public class WeakPasswordException extends RuntimeException {

    @Getter private String password;
    @Getter private List<String> errors;
    @Getter private String errorMessage;

    public WeakPasswordException(String password, List<String> errors) {
        super( "Weak password:" + String.join("", errors));
        this.errorMessage =  "Weak password:" + String.join("", errors);
        this.password = password;
        this.errors = errors;
    }
}

