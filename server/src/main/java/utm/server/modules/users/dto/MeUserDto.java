package utm.server.modules.users.dto;

import lombok.Getter;
import utm.server.modules.users.UserEntity;

@Getter
public class MeUserDto {

    private final Long id;
    private final String name;

    public MeUserDto(UserEntity user) {
        this.id = user.getId();
        this.name = user.getName();
    }
}
