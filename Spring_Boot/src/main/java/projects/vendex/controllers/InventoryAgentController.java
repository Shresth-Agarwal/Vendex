package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projects.vendex.dtos.ForecastAndDecisionResponseDto;
import projects.vendex.dtos.SkuRequestDto;
import projects.vendex.services.InventoryAgentService;

import java.util.List;

@RestController
@RequestMapping("/agent/inventory")
@RequiredArgsConstructor
public class InventoryAgentController {

    private final InventoryAgentService inventoryAgentService;

    @PostMapping("/forecast")
    public ResponseEntity<ForecastAndDecisionResponseDto> forecastAndDecide(
            @RequestBody SkuRequestDto request
    ) {
        return ResponseEntity.ok(
                inventoryAgentService.forecastAndDecide(request.getSku())
        );
    }

    @GetMapping("/forecast/all")
    public ResponseEntity<List<ForecastAndDecisionResponseDto>> bulkForecastAndDecide() {
        return ResponseEntity.ok(inventoryAgentService.bulkForecastAndDecide());
    }
}
