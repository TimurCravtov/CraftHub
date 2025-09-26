package utm.server.modules.authentication.advice;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import utm.server.except.ErrorMessage;
import utm.server.modules.authentication.except.WeakPasswordException;

@ControllerAdvice(basePackages = "utm.server.modules.authentication")
public class AuthentificationControllerAdvice {

    @ExceptionHandler(value = WeakPasswordException.class)
    public ResponseEntity<ErrorMessage> handleWeakPassword(WeakPasswordException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorMessage(403, ex.getErrorMessage()));
    }
}
