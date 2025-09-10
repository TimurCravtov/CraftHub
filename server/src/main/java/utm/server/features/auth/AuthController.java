package utm.server.features.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import utm.server.features.jwt.JwtTokenPair;
import utm.server.features.users.UserService;
import utm.server.features.users.dto.UserSignInDTO;
import utm.server.features.users.dto.UserSignUpDTO;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    UserService userService;
    
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody UserSignUpDTO request){
        try{
            JwtTokenPair tokenPair = userService.signUp(request);
            return ResponseEntity.ok(tokenPair);
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("SignUp Error" + e.getMessage());
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody UserSignInDTO request){
        try{
            JwtTokenPair tokenPair = userService.signIn(request);
            return ResponseEntity.ok(tokenPair);
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("SignIn Error: " + e.getMessage());
        }
    }
}
