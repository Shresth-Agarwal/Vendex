package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projects.vendex.dtos.ForecastAndDecisionResponseDto;
import projects.vendex.dtos.SkuRequestDto;
import projects.vendex.services.InventoryAgentService;

@RestController
@RequestMapping("/agent/inventory")
@RequiredArgsConstructor
public class InventoryAgentController {

    private final InventoryAgentService inventoryAgentService;

    @PostMapping("/forecast-and-decide")
    public ResponseEntity<ForecastAndDecisionResponseDto> forecastAndDecide(
            @RequestBody SkuRequestDto request
    ) {
        return ResponseEntity.ok(
                inventoryAgentService.forecastAndDecide(request.getSku())
        );
    }
}
