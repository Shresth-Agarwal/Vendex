package projects.vendex.dtos;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateShiftRequestDto {
    private LocalDate shiftDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String requiredSkill;
}
