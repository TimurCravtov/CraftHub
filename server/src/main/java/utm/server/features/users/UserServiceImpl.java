package utm.server.features.users;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ArrayList<UserEntity> findAllUsers(){
        return (ArrayList<UserEntity>) userRepository.findAll();
    }

    @Override
    public UserEntity findAllUsersByID(long id){
        Optional<UserEntity> opt = userRepository.findById(id);
        return opt.orElse(null);
    }

    @Override
    public ArrayList<UserEntity> findAllUsersByName(String name){
        return userRepository.findByName(name);
    }
    @Override
    public UserEntity addUser(UserEntity userEntity){

        String encodedPassword = passwordEncoder.encode(userEntity.getPassword());
        userEntity.setPassword(encodedPassword);
        userRepository.save(userEntity);

        return userEntity;
    }

    @Override
    public void deleteAllData(){
        userRepository.deleteAll();
    }

    @Override
    public void deleteUserById(long id){
        if(!userRepository.existsById(id)){
            throw new RuntimeException("User with id " + id + " not found");
        }
        userRepository.deleteById(id);
    }



}
