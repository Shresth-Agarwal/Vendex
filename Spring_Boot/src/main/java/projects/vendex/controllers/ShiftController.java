package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import projects.vendex.dtos.CreateShiftRequestDto;
import projects.vendex.entities.Shift;
import projects.vendex.services.ShiftService;

import java.util.List;

@RestController
@RequestMapping("/demo/shifts")
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;

    @PostMapping
    public Shift createShift(@RequestBody CreateShiftRequestDto dto) {
        return shiftService.createShift(dto);
    }

    @GetMapping
    public List<Shift> getAllShifts() {
        return shiftService.getAllShifts();
    }

    @GetMapping("/open")
    public List<Shift> getOpenShifts() {
        return shiftService.getOpenShifts();
    }

    @PostMapping("/{shiftId}/assign/{staffId}")
    public Shift assignStaff(
            @PathVariable Long shiftId,
            @PathVariable Long staffId
    ) {
        return shiftService.manuallyAssignStaff(shiftId, staffId);
    }
}
