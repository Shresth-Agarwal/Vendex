package projects.vendex.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class RosterResponseDto {

    private LocalDate date;

    private List<ShiftAssignmentDto> assignments;

    private double coveragePercentage;
    private boolean overtimeRisk;
}
