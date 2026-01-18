package projects.vendex.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.vendex.dtos.CreateShiftRequestDto;
import projects.vendex.entities.Shift;
import projects.vendex.repositories.ShiftRepository;

import java.time.LocalDate;
import java.time.LocalTime;
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

    public List<Shift> generateDefaultShifts(LocalDate date) {
        if (shiftRepository.existsByShiftDate(date)) {
            throw new IllegalStateException(
                    "Shifts already exist for date: " + date
            );
        }

        List<Shift> shifts = List.of(
                createShift(date, "10:00", "13:00", "BILLING"),
                createShift(date, "13:00", "16:00", "BILLING"),
                createShift(date, "16:00", "19:00", "ORDER_PICKING"),
                createShift(date, "19:00", "22:00", "INVENTORY_HANDLING")
        );

        return shiftRepository.saveAll(shifts);
    }

    private Shift createShift(
            LocalDate date,
            String start,
            String end,
            String skill
    ) {
        Shift shift = new Shift();
        shift.setShiftDate(date);
        shift.setStartTime(LocalTime.parse(start));
        shift.setEndTime(LocalTime.parse(end));
        shift.setRequiredSkill(skill);
        shift.setStatus("OPEN");
        shift.setAssignedStaffId(null);
        return shift;
    }
}
