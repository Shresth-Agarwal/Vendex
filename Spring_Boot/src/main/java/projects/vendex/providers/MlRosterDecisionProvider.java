package projects.vendex.providers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import projects.vendex.dtos.RosterDecisionDto;
import projects.vendex.dtos.RosterInputDto;
import projects.vendex.dtos.ShiftAssignmentDecisionDto;
import projects.vendex.dtos.ShiftInputDto;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Component
//@Primary
@RequiredArgsConstructor
public class MlRosterDecisionProvider implements RosterDecisionProvider {

    private final WebClient mlWebClient;

    @Override
    public RosterDecisionDto generate(RosterInputDto input) {

        try {
            return mlWebClient
                    .post()
                    .uri("/roster/decide")
                    .bodyValue(input)
                    .retrieve()
                    .bodyToMono(RosterDecisionDto.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();

        } catch (Exception ex) {
            return fallbackDecision(input);
        }
    }

    private RosterDecisionDto fallbackDecision(RosterInputDto input) {

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
                                            .confidence(0.5)
                                            .build()
                            ));
        }

        double coverage =
                input.getShifts().isEmpty()
                        ? 100.0
                        : (double) assignments.size() / input.getShifts().size() * 100;

        return RosterDecisionDto.builder()
                .assignments(assignments)
                .coveragePercentage(coverage)
                .overtimeRisk(false)
                .build();
    }
}
