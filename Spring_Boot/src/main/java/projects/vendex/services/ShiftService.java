package projects.vendex.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.vendex.dtos.CreateShiftRequestDto;
import projects.vendex.entities.Shift;
import projects.vendex.repositories.ShiftRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShiftService {

    private final ShiftRepository shiftRepository;

    public Shift createShift(CreateShiftRequestDto dto) {
        Shift shift = Shift.builder()
                .shiftDate(dto.getShiftDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .requiredSkill(dto.getRequiredSkill())
                .status("OPEN")
                .build();
        return shiftRepository.save(shift);
    }

    public List<Shift> getAllShifts() {
        return shiftRepository.findAll();
    }

    public List<Shift> getOpenShifts() {
        return shiftRepository.findByStatus("OPEN");
    }

    public Shift manuallyAssignStaff(Long shiftId, Long staffId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new IllegalArgumentException("Shift not found"));

        shift.setAssignedStaffId(staffId);
        shift.setStatus("ASSIGNED");
        return shiftRepository.save(shift);
    }
}
