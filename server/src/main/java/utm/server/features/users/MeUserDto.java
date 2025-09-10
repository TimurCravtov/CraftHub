package utm.server.features.users;

import lombok.Getter;

@Getter
public class MeUserDto {

    private final Long id;
    private final String name;

    public MeUserDto(UserEntity user) {
        this.id = user.getId();
        this.name = user.getName();
    }
}
