package utm.server.features.users;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import utm.server.features.image.ImageService;
import utm.server.features.users.dto.UserDto;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final ImageService imageService;

    public UserDto toDTO(UserEntity user) {

        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .accountType(user.getAccountType())
                .profilePictureLink(imageService.getPermanentLink(user.getProfilePictureKey()))
                .build();
    }

    public List<UserDto> toDTOs(List<UserEntity> userEntities) {
        return userEntities.stream().map(this::toDTO).toList();
    }
}
