package projects.vendex.mappers;

import org.mapstruct.Mapper;
import projects.vendex.dtos.ManufacturerRatingDto;
import projects.vendex.entities.ManufacturerRating;

@Mapper(componentModel = "spring")
public interface ManufacturerRatingMapper {

    ManufacturerRating toEntity(ManufacturerRatingDto dto);

    ManufacturerRatingDto toDto(ManufacturerRating entity);
}
