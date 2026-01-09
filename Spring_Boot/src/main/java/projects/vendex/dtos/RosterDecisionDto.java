package projects.vendex.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RosterDecisionDto {

    private List<ShiftAssignmentDecisionDto> assignments;

    private double coveragePercentage;

    private boolean overtimeRisk;
}
