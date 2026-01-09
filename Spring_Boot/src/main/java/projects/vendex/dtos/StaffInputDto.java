package projects.vendex.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffInputDto {

    private Long staffId;

    private Set<String> skills;

    private double hourlyRate;

    private int hoursWorkedThisWeek;

    private List<AvailabilitySlotDto> availability;
}
