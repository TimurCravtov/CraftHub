package utm.server.features.users;
import java.util.List;

//import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import utm.server.features.users.dto.MeUserDto;
import utm.server.features.users.dto.UserDto;
import utm.server.features.users.security.UserSecurityPrincipal;
import utm.server.features.users.security.UserSecurityPrincipalMapper;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor 
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final UserSecurityPrincipalMapper userSecurityPrincipalMapper;

    @PostMapping("/")
    public ResponseEntity<?> addUser(@RequestBody UserEntity user){
        try {
            UserDto saved = userService.addUser(user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        }

    }


    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserSecurityPrincipal user) {
        return ResponseEntity.ok(userMapper.toDTO(userSecurityPrincipalMapper.getUser(user)));
    }

    @GetMapping("/findall")
    public List<UserDto> getAllUser(){
        return userService.findAllUser();
    }

    @GetMapping("{id}")
    public UserDto getUserUsingId(@PathVariable Long id){
        return userService.findUserById(id);
    }
    @GetMapping("/findbyname/{name}")
    public List<UserDto> getUserUsingName(@PathVariable String name){
        return userService.findAllUserByName(name);

    }

    @GetMapping("/findbytypeandname")
    public List<UserDto> getUsersByAccountTypeAndName(@RequestParam String accountType,
                                                      @RequestParam String name){
        return userService.getUsersByAccountTypeAndName(accountType, name);

    }

    @DeleteMapping("/delete")
    public void delete(){
        userService.deleteAllData();
    }
}

