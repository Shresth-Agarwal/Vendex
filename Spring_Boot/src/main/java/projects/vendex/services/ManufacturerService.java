package projects.vendex.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.vendex.dtos.ManufacturerDto;
import projects.vendex.entities.Manufacturer;
import projects.vendex.exceptions.NotFoundException;
import projects.vendex.mappers.ManufacturerMapper;
import projects.vendex.repositories.ManufacturerRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ManufacturerService {

    private final ManufacturerRepository repo;
    private final ManufacturerMapper mapper;

    public ManufacturerDto create(ManufacturerDto dto) {
        Manufacturer saved = repo.save(mapper.toEntity(dto));
        return mapper.toDto(saved);
    }

    public ManufacturerDto get(Long id) {
        return mapper.toDto(
                repo.findById(id)
                        .orElseThrow(() -> new NotFoundException("Manufacturer not found"))
        );
    }

    public ManufacturerDto update(Long id, ManufacturerDto dto) {
        Manufacturer existing = repo.findById(id)
                .orElseThrow(() -> new NotFoundException("Manufacturer not found"));

        existing.setName(dto.getName());
        existing.setEmailId(dto.getEmailId());
        existing.setPhone(dto.getPhone());
        existing.setLocation(dto.getLocation());
        existing.setDistanceKm(dto.getDistanceKm());

        return mapper.toDto(repo.save(existing));
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public List<ManufacturerDto> getAllManufacturers() {
        return mapper.toDtoList(
                repo.findAll()
        );
    }
}
