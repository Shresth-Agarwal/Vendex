package projects.vendex.services;

import projects.vendex.dtos.*;
import projects.vendex.entities.*;
import projects.vendex.exceptions.NotFoundException;
import projects.vendex.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import projects.vendex.util.InventoryAgentMapper;

import java.time.LocalDate;
import java.util.ArrayList;
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
    private final InventoryAgentMapper inventoryAgentMapper;
    private final PurchaseOrderService purchaseOrderService;

    private static final int FORECAST_LOOKBACK_DAYS = 30;

    public ForecastAndDecisionResponseDto forecastAndDecide(String sku) {

        Product product = productRepository.findById(sku)
                .orElseThrow(() -> new IllegalArgumentException("Invalid SKU: " + sku));

        Stock stock = stockRepository.findById(sku)
                .orElseThrow(() -> new NotFoundException("Stock not found for SKU: " + sku));

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
                        .map(e -> e.getValue().doubleValue())
                        .toList();

        if (salesHistory.isEmpty()) {
            throw new IllegalStateException("Insufficient sales data for SKU: " + sku);
        }

        // 1. Forecast
        SalesHistoryDto forecastRequest = new SalesHistoryDto();
        forecastRequest.setSalesHistory(salesHistory);

        ForecastResponseDto forecastResponse =
                inventoryMlService.getForecast(forecastRequest);

        // 2. Decision payload
        DecisionPayloadDto decisionPayload =
                inventoryAgentMapper.toDecisionPayloadDto(
                        forecastResponse.getForecast(),
                        forecastResponse.getConfidence(),
                        stock,
                        product
                );

        InventoryDecisionDto decision =
                inventoryMlService.getDecision(decisionPayload);

        // 3. Create PO if needed (delegate to service)
        if (decision.getQuantity() > 0) {

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setSku(sku);
            item.setQuantity(decision.getQuantity());

            purchaseOrderService.createFromDecision(
                    List.of(item),
                    forecastResponse.getConfidence()
            );
        }

        // 4. Return combined response
        return inventoryAgentMapper.toForecastAndDecisionResponse(
                forecastResponse.getForecast(),
                forecastResponse.getConfidence(),
                decision
        );
    }

    public List<ForecastAndDecisionResponseDto> bulkForecastAndDecide() {

        List<Product> products = productRepository.findAll();
        List<ForecastAndDecisionResponseDto> responses = new ArrayList<>();

                for (Product product : products) {
                        try {
                                responses.add(forecastAndDecide(product.getSku()));
                        } catch (IllegalStateException e) {
                                // Skip products with insufficient data
                                if (e.getMessage().contains("Insufficient sales data")) {
                                        System.out.println("Skipping SKU " + product.getSku() + ": " + e.getMessage());
                                        continue;
                                }
                                // Re-throw other IllegalStateExceptions
                                throw e;
                        } catch (Exception e) {
                                // Log and skip other unexpected errors
                                System.err.println("Error processing SKU " + product.getSku() + ": " + e.getMessage());
                                continue;
                        }
                }

        return responses;
    }
}
