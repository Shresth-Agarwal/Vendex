package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import projects.vendex.dtos.CreateStaffRequestDto;
import projects.vendex.entities.Staff;
import projects.vendex.services.StaffService;

import java.util.List;

@RestController
@RequestMapping("/demo/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @PostMapping
    public Staff createStaff(@RequestBody CreateStaffRequestDto dto) {
        return staffService.createStaff(dto);
    }

    @GetMapping
    public List<Staff> getAllStaff() {
        return staffService.getAllStaff();
    }

    @PutMapping("/{id}")
    public Staff updateStaff(
            @PathVariable Long id,
            @RequestBody CreateStaffRequestDto dto
    ) {
        return staffService.updateStaff(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deactivateStaff(@PathVariable Long id) {
        staffService.deactivateStaff(id);
    }
}
