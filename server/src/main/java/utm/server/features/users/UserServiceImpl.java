package utm.server.features.users;
import org.apache.catalina.User;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService{
    @Autowired
    UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public ArrayList<UserEntity> findAllUser(){
        return (ArrayList<UserEntity>) userRepository.findAll();
    }

    @Override
    public UserEntity findAllUserByID(long id){
        Optional<UserEntity> opt = userRepository.findById(id);
        if(opt.isPresent())
            return opt.get();
        else
            return null;
    }

    @Override
    public ArrayList<UserEntity> findAllUserByName(String name){
        return userRepository.findByName(name);
    }

   @Override
   public ArrayList<UserEntity> getUsersByAccountTypeAndName(String accountType, String name){
        return userRepository.findByAccountTypeandName(accountType, name);
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
