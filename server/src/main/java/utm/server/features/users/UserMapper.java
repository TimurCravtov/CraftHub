package utm.server.features.users;

import utm.server.features.users.dto.UserRequestDTO;

import java.util.ArrayList;
import java.util.List;

public class UserMapper {
    public static UserRequestDTO toDTO(UserEntity user){
        UserRequestDTO dto = new UserRequestDTO();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAccountType(user.getAccountType());
        return dto;
    }

    public static List<UserRequestDTO> toDTOs(List<UserEntity> user_entities)
    {
        List<UserRequestDTO> dtos = new ArrayList<>();
        for(var user : user_entities)
            dtos.add(UserMapper.toDTO(user));

        return dtos;
    }
}
