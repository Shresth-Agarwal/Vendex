package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import projects.vendex.entities.StaffAvailability;
import projects.vendex.services.StaffAvailabilityService;

import java.util.List;

@RestController
@RequestMapping("/demo/staff/availability")
@RequiredArgsConstructor
public class StaffAvailabilityController {

    private final StaffAvailabilityService availabilityService;

    @PostMapping
    public StaffAvailability addAvailability(
            @RequestBody StaffAvailability availability
    ) {
        return availabilityService.addAvailability(availability);
    }

    @GetMapping("/{staffId}")
    public List<StaffAvailability> getAvailability(@PathVariable Long staffId) {
        return availabilityService.getAvailabilityForStaff(staffId);
    }

    @DeleteMapping("/{id}")
    public void removeAvailability(@PathVariable Long id) {
        availabilityService.removeAvailability(id);
    }
}
