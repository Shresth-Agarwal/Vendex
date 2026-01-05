package projects.vendex.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import projects.vendex.entities.Roles;

@Data
@NoArgsConstructor
public class RoleUpdateDto {
    @NotNull
    private int userId;
    @NotNull
    private Roles role;
}
