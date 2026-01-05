package projects.vendex.util;

import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import projects.vendex.dtos.UserDto;
import projects.vendex.entities.Roles;
import projects.vendex.entities.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    User toUsers(UserDto dto);

    @AfterMapping
    default void setDefaultRole(@MappingTarget User user) {
        user.setRole(Roles.USER);
    }
}
