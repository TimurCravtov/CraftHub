package utm.server.features.users;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import utm.server.features.jwt.JwtTokenPair;
import utm.server.features.users.dto.MeUserDto;
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
    public List<UserRequestDTO> getAllUser(){
        return userService.findAllUser();
    }

    @GetMapping("{id}")
    public UserRequestDTO getUserUsingId(@PathVariable Long id){
        return userService.findUserById(id);
    }
    @GetMapping("/findbyname/{name}")
    public List<UserRequestDTO> getUserUsingName(@PathVariable String name){
        return userService.findAllUserByName(name);

    }

    @GetMapping("/findbytypeandname")
    public List<UserRequestDTO> getUsersByAccountTypeAndName(@RequestParam String accountType,
                                                              @RequestParam String name){
        return userService.getUsersByAccountTypeAndName(accountType, name);

    }

    @DeleteMapping("/delete")
    public void delete(){
        userService.deleteAllData();
    }







}


