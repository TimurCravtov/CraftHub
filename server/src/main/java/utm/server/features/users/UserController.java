package utm.server.features.users;
import java.util.ArrayList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import utm.server.features.jwt.JwtTokenPair;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/")
    public ResponseEntity<?> addUser(@RequestBody UserEntity user){
        try {
            UserRequestDTO saved = userService.addUser(user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        }

    }

    @GetMapping("/findall")
    public ArrayList<UserRequestDTO> getAllUser(){
        return userService.findAllUser();
    }


    @GetMapping("/findbyname/{name}")
    public ArrayList<UserRequestDTO> getUserUsingName(@PathVariable String name){
        return userService.findAllUserByName(name);

    }

    @GetMapping("/findbytypeandname")
    public ArrayList<UserRequestDTO> getUsersByAccountTypeAndName(@RequestParam String accountType,
                                                              @RequestParam String name){
        return userService.getUsersByAccountTypeAndName(accountType, name);

    }

    @DeleteMapping("/delete")
    public void delete(){
        userService.deleteAllData();
    }


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


