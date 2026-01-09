package projects.vendex.providers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import projects.vendex.dtos.RosterDecisionDto;
import projects.vendex.dtos.RosterInputDto;
import projects.vendex.dtos.ShiftAssignmentDecisionDto;
import projects.vendex.dtos.ShiftInputDto;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RuleBasedRosterDecisionProvider implements RosterDecisionProvider {

    @Override
    public RosterDecisionDto generate(RosterInputDto input) {

        List<ShiftAssignmentDecisionDto> assignments = new ArrayList<>();

        for (ShiftInputDto shift : input.getShifts()) {
            input.getStaff().stream()
                    .filter(staff ->
                            staff.getSkills().contains(shift.getRequiredSkill()))
                    .findFirst()
                    .ifPresent(staff ->
                            assignments.add(
                                    ShiftAssignmentDecisionDto.builder()
                                            .shiftId(shift.getShiftId())
                                            .staffId(staff.getStaffId())
                                            .confidence(0.6)
                                            .build()
                            ));
        }

        double coverage =
                (double) assignments.size() / input.getShifts().size() * 100;

        return RosterDecisionDto.builder()
                .assignments(assignments)
                .coveragePercentage(coverage)
                .overtimeRisk(false)
                .build();
    }
}
