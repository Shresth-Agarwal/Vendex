package projects.vendex.providers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import projects.vendex.dtos.*;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@Primary
@RequiredArgsConstructor
public class MlRosterDecisionProvider implements RosterDecisionProvider {

    private final WebClient mlWebClient;

    @Override
    public RosterDecisionDto generate(RosterInputDto input) throws java.util.concurrent.TimeoutException {

        try {
            log.info("========== CALLING ML SERVICE (FASTAPI) ==========");
            log.info("Endpoint: POST http://localhost:8000/api/assign-staff");
            log.info("Shifts: {}", input.getShifts().size());
            log.info("Staff: {}", input.getStaff().size());
            log.info("Date: {}", input.getDate());
            
            for (ShiftInputDto shift : input.getShifts()) {
                log.debug("  Shift {}: {} - {} (skill: {})", 
                    shift.getShiftId(), 
                    shift.getStartTime(), 
                    shift.getEndTime(),
                    shift.getRequiredSkill());
            }
            
            for (StaffInputDto staff : input.getStaff()) {
                log.debug("  Staff {}: skills={}, hours={}", 
                    staff.getStaffId(), 
                    staff.getSkills(), 
                    staff.getHoursWorkedThisWeek());
            }
            
            log.info("Sending request to FastAPI...");
            
            RosterDecisionDto response = mlWebClient
                    .post()
                    .uri("/api/assign-staff")
                    .bodyValue(input)
                    .retrieve()
                    .bodyToMono(RosterDecisionDto.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();
            
            log.info("========== ML SERVICE RESPONSE ==========");
            log.info("Assignments: {}", response.getAssignments().size());
            log.info("Coverage: {}%", response.getCoveragePercentage());
            log.info("Overtime Risk: {}", response.isOvertimeRisk());
            log.info("========== END RESPONSE ==========");
            
            return response;

        } catch (WebClientResponseException ex) {
            log.error("ML service returned error: status={}, body={}", 
                ex.getStatusCode(), ex.getResponseBodyAsString());
            return fallbackDecision(input);
        } catch (Exception ex) {
            log.error("Failed to call ML service: {}", ex.getMessage(), ex);
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
