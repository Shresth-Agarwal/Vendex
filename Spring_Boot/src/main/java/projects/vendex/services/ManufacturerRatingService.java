package projects.vendex.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.vendex.dtos.ManufacturerRatingDto;
import projects.vendex.entities.Manufacturer;
import projects.vendex.entities.ManufacturerRating;
import projects.vendex.exceptions.NotFoundException;
import projects.vendex.mappers.ManufacturerRatingMapper;
import projects.vendex.repositories.ManufacturerRatingRepository;
import projects.vendex.repositories.ManufacturerRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ManufacturerRatingService {

    private final ManufacturerRatingRepository repo;
    private final ManufacturerRepository manufacturerRepo;
    private final ManufacturerRatingMapper mapper;

    public ManufacturerRatingDto create(Long manufacturerId, ManufacturerRatingDto dto) {
        Manufacturer m = manufacturerRepo.findById(manufacturerId)
                .orElseThrow(() -> new NotFoundException("Manufacturer not found"));

        ManufacturerRating entity = mapper.toEntity(dto);
        entity.setManufacturer(m);
        entity.setRatedAt(LocalDateTime.now());

        return mapper.toDto(repo.save(entity));
    }

    public List<ManufacturerRatingDto> getByManufacturer(Long manufacturerId) {
        return repo.findByManufacturerId(manufacturerId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }
}