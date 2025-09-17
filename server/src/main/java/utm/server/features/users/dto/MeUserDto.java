package utm.server.features.users.dto;

import lombok.Getter;
import utm.server.features.users.UserEntity;

@Getter
public class MeUserDto {

    private final Long id;
    private final String name;

    public MeUserDto(UserEntity user) {
        this.id = user.getId();
        this.name = user.getName();
    }
}
