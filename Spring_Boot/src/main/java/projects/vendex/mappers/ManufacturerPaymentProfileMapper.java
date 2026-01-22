package projects.vendex.mappers;

import org.mapstruct.Mapper;
import projects.vendex.dtos.ManufacturerPaymentProfileDto;
import projects.vendex.entities.ManufacturerPaymentProfile;

@Mapper(componentModel = "spring")
public interface ManufacturerPaymentProfileMapper {

    ManufacturerPaymentProfile toEntity(ManufacturerPaymentProfileDto dto);

    ManufacturerPaymentProfileDto toDto(ManufacturerPaymentProfile entity);
}
