package projects.vendex.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftAssignmentDecisionDto {

    private Long shiftId;

    private Long staffId;

    private double confidence;
}
