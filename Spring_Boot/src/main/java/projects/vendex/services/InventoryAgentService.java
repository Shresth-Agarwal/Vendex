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
    private final PurchaseOrderRepository purchaseOrderRepository;


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

        SalesHistoryDto forecastRequest = new SalesHistoryDto();
        forecastRequest.setSalesHistory(salesHistory);

        ForecastResponseDto forecastResponse =
                inventoryMlService.getForecast(forecastRequest);

        DecisionPayloadDto decisionPayload =
                inventoryAgentMapper.toDecisionPayloadDto(
                        forecastResponse.getForecast(),
                        forecastResponse.getConfidence(),
                        stock,
                        product
                );

        InventoryDecisionDto decision =
                inventoryMlService.getDecision(decisionPayload);

        if (decision.getQuantity() > 0) {

            boolean alreadyPending =
                    purchaseOrderRepository
                            .existsBySkuAndStatus(sku, "PENDING_APPROVAL");

            boolean alreadyApproved =
                    purchaseOrderRepository
                            .existsBySkuAndStatus(sku, "APPROVED");

            // Case 1: Requires human approval
            if ("REQUIRE_APPROVAL".equalsIgnoreCase(decision.getAction())
                    && !alreadyPending) {

                PurchaseOrder po = PurchaseOrder.builder()
                        .sku(sku)
                        .quantity(decision.getQuantity())
                        .status("PENDING_APPROVAL")
                        .confidence(forecastResponse.getConfidence())
                        .build();

                purchaseOrderRepository.save(po);
            }

            // Case 2: Auto-approved reorder
            if ("AUTO_REORDER".equalsIgnoreCase(decision.getAction())
                    && !alreadyApproved) {

                PurchaseOrder po = PurchaseOrder.builder()
                        .sku(sku)
                        .quantity(decision.getQuantity())
                        .status("APPROVED")
                        .confidence(forecastResponse.getConfidence())
                        .build();

                purchaseOrderRepository.save(po);
            }
        }

        return inventoryAgentMapper.toForecastAndDecisionResponse(
                forecastResponse.getForecast(),
                forecastResponse.getConfidence(),
                decision
        );
    }

    public List<ForecastAndDecisionResponseDto> bulkForecastAndDecide() {
        List<Product> products = productRepository.findAll();
        List<ForecastAndDecisionResponseDto> bulkForecast = new ArrayList<ForecastAndDecisionResponseDto>();

        for (Product product : products) {
            bulkForecast.add(forecastAndDecide(product.getSku()));
        }

        return bulkForecast;
    }
}
