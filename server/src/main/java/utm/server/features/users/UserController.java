package utm.server.features.users;
import java.util.ArrayList;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import utm.server.features.jwt.JwtTokenPair;
import utm.server.features.users.dto.UserRequestDTO;
import utm.server.features.users.dto.UserSignInDTO;
import utm.server.features.users.dto.UserSignUpDTO;


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

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserEntity user) {
        return ResponseEntity.ok(new MeUserDto(user));
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







}


