package projects.vendex.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.vendex.entities.StaffAvailability;
import projects.vendex.repositories.StaffAvailabilityRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffAvailabilityService {

    private final StaffAvailabilityRepository availabilityRepository;

    public StaffAvailability addAvailability(StaffAvailability availability) {
        return availabilityRepository.save(availability);
    }

    public List<StaffAvailability> getAvailabilityForStaff(Long staffId) {
        return availabilityRepository.findByStaffId(staffId);
    }

    public void removeAvailability(Long availabilityId) {
        availabilityRepository.deleteById(availabilityId);
    }
}
