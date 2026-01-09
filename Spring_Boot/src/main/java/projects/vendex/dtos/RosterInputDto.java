package projects.vendex.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RosterInputDto {

    private LocalDate date;

    private List<ShiftInputDto> shifts;

    private List<StaffInputDto> staff;
}
