package projects.vendex.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.vendex.dtos.ManufacturerProductDto;
import projects.vendex.entities.Manufacturer;
import projects.vendex.entities.ManufacturerProduct;
import projects.vendex.exceptions.NotFoundException;
import projects.vendex.mappers.ManufacturerProductMapper;
import projects.vendex.repositories.ManufacturerProductRepository;
import projects.vendex.repositories.ManufacturerRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ManufacturerProductService {

    private final ManufacturerProductRepository repo;
    private final ManufacturerRepository manufacturerRepo;
    private final ManufacturerProductMapper mapper;

    public ManufacturerProductDto create(Long manufacturerId, ManufacturerProductDto dto) {
        Manufacturer m = manufacturerRepo.findById(manufacturerId)
                .orElseThrow(() -> new NotFoundException("Manufacturer not found"));

        ManufacturerProduct entity = mapper.toEntity(dto);
        entity.setManufacturer(m);

        return mapper.toDto(repo.save(entity));
    }

    public List<ManufacturerProductDto> getByManufacturer(Long manufacturerId) {
        return repo.findByManufacturerId(manufacturerId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public ManufacturerProductDto update(Long productId, ManufacturerProductDto dto) {
        ManufacturerProduct existing = repo.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        existing.setBrand(dto.getBrand());
        existing.setCategory(dto.getCategory());
        existing.setProductName(dto.getProductName());
        existing.setMinimumOrderQuantity(dto.getMinimumOrderQuantity());
        existing.setCostPrice(dto.getCostPrice());

        return mapper.toDto(repo.save(existing));
    }

    public void delete(Long productId) {
        repo.deleteById(productId);
    }
}
