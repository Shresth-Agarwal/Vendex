package projects.vendex.dtos;

import lombok.Data;

import java.util.Set;

@Data
public class CreateStaffRequestDto {
    private String name;
    private String role;
    private Set<String> skills;
    private double hourlyRate;
}
