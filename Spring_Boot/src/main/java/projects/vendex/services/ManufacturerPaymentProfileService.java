package projects.vendex.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.vendex.dtos.ManufacturerPaymentProfileDto;
import projects.vendex.entities.Manufacturer;
import projects.vendex.entities.ManufacturerPaymentProfile;
import projects.vendex.exceptions.NotFoundException;
import projects.vendex.mappers.ManufacturerPaymentProfileMapper;
import projects.vendex.repositories.ManufacturerPaymentProfileRepository;
import projects.vendex.repositories.ManufacturerRepository;
@Service
@RequiredArgsConstructor
public class ManufacturerPaymentProfileService {

    private final ManufacturerPaymentProfileRepository repo;
    private final ManufacturerRepository manufacturerRepo;
    private final ManufacturerPaymentProfileMapper mapper;

    public ManufacturerPaymentProfileDto save(
            Long manufacturerId,
            ManufacturerPaymentProfileDto dto
    ) {
        Manufacturer m = manufacturerRepo.findById(manufacturerId)
                .orElseThrow(() -> new NotFoundException("Manufacturer not found"));

        ManufacturerPaymentProfile entity =
                repo.findByManufacturerId(manufacturerId).orElse(null);

        if (entity == null) {
            entity = mapper.toEntity(dto);
            entity.setManufacturer(m);
        } else {
            entity.setAdvanceRequired(dto.getAdvanceRequired());
            entity.setPreferredPaymentMode(dto.getPreferredPaymentMode());
        }

        return mapper.toDto(repo.save(entity));
    }

    public ManufacturerPaymentProfileDto get(Long manufacturerId) {
        return mapper.toDto(
                repo.findByManufacturerId(manufacturerId)
                        .orElseThrow(() -> new NotFoundException("Payment profile not found"))
        );
    }
}
