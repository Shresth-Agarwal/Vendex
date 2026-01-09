package projects.vendex.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftInputDto {

    private Long shiftId;

    private LocalTime startTime;

    private LocalTime endTime;

    private String requiredSkill;
}
