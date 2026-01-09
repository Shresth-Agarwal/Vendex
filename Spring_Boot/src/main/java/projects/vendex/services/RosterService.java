package projects.vendex.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.vendex.dtos.RosterResponseDto;
import projects.vendex.dtos.ShiftAssignment;
import projects.vendex.entities.Shift;
import projects.vendex.entities.Staff;
import projects.vendex.repositories.ShiftRepository;
import projects.vendex.repositories.StaffRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RosterService {

    private final StaffRepository staffRepository;
    private final ShiftRepository shiftRepository;

    public RosterResponseDto generateRoster(LocalDate date) {

        List<Staff> staffList = staffRepository.findByActiveTrue();
        List<Shift> shifts = shiftRepository.findByStatus("OPEN");

        List<ShiftAssignment> assignments = new ArrayList<>();

        for (Shift shift : shifts) {
            staffList.stream()
                    .filter(s -> s.getSkills().contains(shift.getRequiredSkill()))
                    .findFirst()
                    .ifPresent(staff -> {
                        shift.setAssignedStaffId(staff.getId());
                        shift.setStatus("ASSIGNED");
                        assignments.add(
                                ShiftAssignment.builder()
                                        .shiftId(shift.getId())
                                        .staffId(staff.getId())
                                        .staffName(staff.getName())
                                        .build()
                        );
                    });
        }

        shiftRepository.saveAll(shifts);

        return RosterResponseDto.builder()
                .date(date)
                .assignments(assignments)
                .coveragePercentage(
                        (double) assignments.size() / shifts.size() * 100
                )
                .overtimeRisk(false)
                .build();
    }
}
