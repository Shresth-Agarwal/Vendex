package projects.vendex.services;

import projects.vendex.dtos.*;
import projects.vendex.entities.Staff;
import projects.vendex.entities.StaffAvailability;
import projects.vendex.entities.Shift;
import projects.vendex.providers.RosterDecisionProvider;
import projects.vendex.repositories.StaffAvailabilityRepository;
import projects.vendex.repositories.StaffRepository;
import projects.vendex.repositories.ShiftRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RosterService {

    private final StaffRepository staffRepository;
    private final StaffAvailabilityRepository availabilityRepository;
    private final ShiftRepository shiftRepository;
    private final RosterDecisionProvider decisionProvider;

    public RosterResponseDto generateRoster(LocalDate date) {

        // 1. Fetch open shifts for the date
        List<Shift> openShifts =
                shiftRepository.findByStatusAndShiftDate("OPEN", date);

        if (openShifts.isEmpty()) {
            return RosterResponseDto.builder()
                    .date(date)
                    .assignments(List.of())
                    .coveragePercentage(100.0)
                    .overtimeRisk(false)
                    .build();
        }

        // 2. Fetch active staff
        List<Staff> activeStaff =
                staffRepository.findByActiveTrue();

        // 3. Build ML-ready input
        RosterInputDto input =
                buildRosterInput(date, openShifts, activeStaff);

        // 4. Get decision (rule-based now, ML later)
        RosterDecisionDto decision =
                decisionProvider.generate(input);

        // 5. Apply decisions with backend enforcement
        List<ShiftAssignmentDto> appliedAssignments =
                applyAssignments(decision);

        return RosterResponseDto.builder()
                .date(date)
                .assignments(appliedAssignments)
                .coveragePercentage(decision.getCoveragePercentage())
                .overtimeRisk(decision.isOvertimeRisk())
                .build();
    }


    private RosterInputDto buildRosterInput(
            LocalDate date,
            List<Shift> shifts,
            List<Staff> staffList
    ) {

        List<ShiftInputDto> shiftInputs =
                shifts.stream()
                        .map(shift ->
                                ShiftInputDto.builder()
                                        .shiftId(shift.getId())
                                        .startTime(shift.getStartTime())
                                        .endTime(shift.getEndTime())
                                        .requiredSkill(shift.getRequiredSkill())
                                        .build()
                        )
                        .toList();

        List<StaffInputDto> staffInputs =
                staffList.stream()
                        .map(this::mapStaffToInput)
                        .toList();

        return RosterInputDto.builder()
                .date(date)
                .shifts(shiftInputs)
                .staff(staffInputs)
                .build();
    }

    private StaffInputDto mapStaffToInput(Staff staff) {

        List<AvailabilitySlotDto> availability =
                availabilityRepository.findByStaffId(staff.getId())
                        .stream()
                        .map(this::mapAvailability)
                        .toList();

        return StaffInputDto.builder()
                .staffId(staff.getId())
                .skills(staff.getSkills())
                .hourlyRate(staff.getHourlyRate())
                .hoursWorkedThisWeek(0) // placeholder, can be improved later
                .availability(availability)
                .build();
    }

    private AvailabilitySlotDto mapAvailability(StaffAvailability availability) {
        return AvailabilitySlotDto.builder()
                .day(availability.getDayOfWeek())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .build();
    }

    private List<ShiftAssignmentDto> applyAssignments(
            RosterDecisionDto decision
    ) {

        List<ShiftAssignmentDto> applied = new ArrayList<>();

        for (ShiftAssignmentDecisionDto assignment :
                decision.getAssignments()) {

            Shift shift = shiftRepository.findById(assignment.getShiftId())
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "Shift not found: " + assignment.getShiftId()
                            )
                    );

            // Skip if already assigned (manager override safety)
            if (!"OPEN".equals(shift.getStatus())) {
                continue;
            }

            Staff staff = staffRepository.findById(assignment.getStaffId())
                    .orElseThrow(() ->
                            new IllegalStateException(
                                    "Staff not found: " + assignment.getStaffId()
                            )
                    );

            // Backend enforcement
            shift.setAssignedStaffId(staff.getId());
            shift.setStatus("ASSIGNED");
            shiftRepository.save(shift);

            applied.add(
                    ShiftAssignmentDto.builder()
                            .shiftId(shift.getId())
                            .staffId(staff.getId())
                            .staffName(staff.getName())
                            .build()
            );
        }

        return applied;
    }
}
