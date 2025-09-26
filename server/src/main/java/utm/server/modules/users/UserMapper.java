package utm.server.modules.users;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import utm.server.modules.image.ImageService;
import utm.server.modules.users.dto.UserDto;

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
                .provider(user.getProvider())
                .profilePictureLink(imageService.getPermanentLink(user.getProfilePictureKey()))
                .build();
    }

    public List<UserDto> toDTOs(List<UserEntity> userEntities) {
        return userEntities.stream().map(this::toDTO).toList();
    }
}
