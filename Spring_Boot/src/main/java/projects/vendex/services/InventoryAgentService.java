package projects.vendex.services;

import projects.vendex.dtos.*;
import projects.vendex.entities.*;
import projects.vendex.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryAgentService {

    private final InventoryMlService inventoryMlService;
    private final ProductRepository productRepository;
    private final SalesRepository salesRepository;
    private final StockRepository stockRepository;

    private static final int FORECAST_LOOKBACK_DAYS = 30;

    public ForecastAndDecisionResponseDto forecastAndDecide(String sku) {

        Product product = productRepository.findById(sku)
                .orElseThrow(() -> new IllegalArgumentException("Invalid SKU: " + sku));

        Stock stock = stockRepository.findById(sku)
                .orElseThrow(() -> new IllegalStateException("Stock not found for SKU: " + sku));

        LocalDate fromDate = LocalDate.now().minusDays(FORECAST_LOOKBACK_DAYS);

        List<SalesRecord> salesRecords =
                salesRepository.findBySkuAndSaleDateAfter(sku, fromDate);

        Map<LocalDate, Integer> dailySalesMap =
                salesRecords.stream()
                        .collect(Collectors.groupingBy(
                                SalesRecord::getSaleDate,
                                Collectors.summingInt(SalesRecord::getQuantitySold)
                        ));

        List<Double> salesHistory =
                dailySalesMap.entrySet().stream()
                        .sorted(Map.Entry.comparingByKey())
                        .map(entry -> entry.getValue().doubleValue())
                        .toList();

        if (salesHistory.isEmpty()) {
            throw new IllegalStateException("Insufficient sales data for SKU: " + sku);
        }

        SalesHistoryDto forecastRequest = new SalesHistoryDto();
        forecastRequest.setSalesHistory(salesHistory);

        ForecastResponseDto forecastResponse =
                inventoryMlService.getForecast(forecastRequest);

        DecisionPayloadDto decisionPayload = new DecisionPayloadDto();
        decisionPayload.setForecast(forecastResponse.getForecast());
        decisionPayload.setConfidence(forecastResponse.getConfidence());
        decisionPayload.setCurrentStock(stock.getOnHand());
        decisionPayload.setUnitCost(product.getUnitCost());

        Object decision =
                inventoryMlService.getDecision(decisionPayload);


        ForecastAndDecisionResponseDto response =
                new ForecastAndDecisionResponseDto();

        response.setForecast(forecastResponse.getForecast());
        response.setConfidence(forecastResponse.getConfidence());
        response.setDecision(decision);

        return response;
    }
}
