package projects.vendex.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.vendex.dtos.CreateStaffRequestDto;
import projects.vendex.entities.Staff;
import projects.vendex.exceptions.NotFoundException;
import projects.vendex.repositories.StaffRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;

    public Staff createStaff(CreateStaffRequestDto dto) {
        Staff staff = Staff.builder()
                .name(dto.getName())
                .role(dto.getRole())
                .skills(dto.getSkills())
                .hourlyRate(dto.getHourlyRate())
                .active(true)
                .build();
        return staffRepository.save(staff);
    }

    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    public Staff updateStaff(Long staffId, CreateStaffRequestDto dto) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new NotFoundException("Staff not found"));

        staff.setName(dto.getName());
        staff.setRole(dto.getRole());
        staff.setSkills(dto.getSkills());
        staff.setHourlyRate(dto.getHourlyRate());

        return staffRepository.save(staff);
    }

    public void deactivateStaff(Long staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new NotFoundException("Staff not found"));
        staff.setActive(false);
        staffRepository.save(staff);
    }
}
