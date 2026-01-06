package projects.vendex.util;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import projects.vendex.dtos.*;
import projects.vendex.entities.Product;
import projects.vendex.entities.Stock;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InventoryAgentMapper {

    @Mapping(target = "forecast", source = "forecast")
    @Mapping(target = "confidence", source = "confidence")
    @Mapping(target = "currentStock", source = "stock.onHand")
    @Mapping(target = "unitCost", source = "product.unitCost")
    DecisionPayloadDto toDecisionPayloadDto(
            int forecast,
            double confidence,
            Stock stock,
            Product product
    );

    @Mapping(target = "forecast", source = "forecast")
    @Mapping(target = "confidence", source = "confidence")
    @Mapping(target = "decision", source = "decision")
    ForecastAndDecisionResponseDto toForecastAndDecisionResponse(
            int forecast,
            double confidence,
            Object decision
    );
}
