package projects.vendex.mappers;

import org.mapstruct.Mapper;
import projects.vendex.dtos.ManufacturerDto;
import projects.vendex.entities.Manufacturer;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ManufacturerMapper {

    Manufacturer toEntity(ManufacturerDto dto);

    ManufacturerDto toDto(Manufacturer entity);

    List<ManufacturerDto> toDtoList(List<Manufacturer> manufacturers);
}
