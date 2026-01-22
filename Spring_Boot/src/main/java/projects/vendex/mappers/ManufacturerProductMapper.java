package projects.vendex.mappers;

import org.mapstruct.Mapper;
import projects.vendex.dtos.ManufacturerProductDto;
import projects.vendex.entities.ManufacturerProduct;

@Mapper(componentModel = "spring")
public interface ManufacturerProductMapper {

    ManufacturerProduct toEntity(ManufacturerProductDto dto);

    ManufacturerProductDto toDto(ManufacturerProduct entity);
}
