package utm.server.features.users;

import utm.server.features.users.dto.UserRequestDTO;

import java.util.ArrayList;

public class UserMapper {
    public static UserRequestDTO toDTO(UserEntity user){
        UserRequestDTO dto = new UserRequestDTO();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAccountType(user.getAccountType());
        return dto;
    }

    public static ArrayList<UserRequestDTO> toDTOs(ArrayList<UserEntity> user_entities)
    {
        ArrayList<UserRequestDTO> dtos = new ArrayList<>();
        for(var user : user_entities)
            dtos.add(UserMapper.toDTO(user));

        return dtos;
    }
}
