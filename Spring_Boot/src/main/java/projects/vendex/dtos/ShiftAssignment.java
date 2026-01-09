package projects.vendex.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShiftAssignment {
    private Long shiftId;
    private Long staffId;
    private String staffName;
}
