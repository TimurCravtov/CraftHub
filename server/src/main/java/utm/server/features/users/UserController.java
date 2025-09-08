package utm.server.features.users;
import java.util.ArrayList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/")
    public ResponseEntity<?> addUser(@RequestBody UserEntity user){
        try {
            UserEntity saved = userService.addUser(user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        }

    }

    @GetMapping("/findall")
    public ArrayList<UserEntity> getAllUser(){
        return userService.findAllUsers();
    }

    @GetMapping("/findbyid/{id}")
    public UserEntity getUserUsingId(@PathVariable long id){
        return userService.findAllUsersByID(id);
    }

    @GetMapping("/findbyname/{name}")
    public ArrayList<UserEntity> getUserUsingName(@PathVariable String name){
        return userService.findAllUsersByName(name);
    }

    @GetMapping("/findbytypeandname")
    public ArrayList<UserEntity> getUsersByAccountTypeAndName(@RequestParam String accountType,
                                                              @RequestParam String name){
        return userService.getUsersByAccountTypeAndName(accountType, name);
    }

    @DeleteMapping("/delete")
    public void delete(){
        userService.deleteAllData();
    }

}


