package projects.vendex.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import projects.vendex.dtos.PurchaseOrderDto;
import projects.vendex.dtos.PurchaseOrderItemDto;
import projects.vendex.entities.PurchaseOrder;
import projects.vendex.entities.PurchaseOrderItem;

@Mapper(componentModel = "spring")
public interface PurchaseOrderMapper {

    @Mapping(target = "manufacturerId", source = "manufacturer.id")
    PurchaseOrderDto toDto(PurchaseOrder entity);

    PurchaseOrderItemDto toItemDto(PurchaseOrderItem entity);
}
