package projects.vendex.services;

import lombok.extern.slf4j.Slf4j;
import projects.vendex.dtos.CustomerIntentRequestDto;
import projects.vendex.dtos.CustomerIntentResponseDto;
import projects.vendex.dtos.StockItemDto;
import projects.vendex.entities.Product;
import projects.vendex.entities.Stock;
import projects.vendex.repositories.ProductRepository;
import projects.vendex.repositories.StockRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerIntentService {

    private final StockRepository stockRepository;
    private final ProductRepository productRepository;
    private final WebClient customerAgentWebClient;

    public CustomerIntentResponseDto processIntent(String userInput) {

        List<StockItemDto> stockList =
                stockRepository.findAll()
                        .stream()
                        .map(this::mapToStockItem)
                        .toList();

        CustomerIntentRequestDto request =
                CustomerIntentRequestDto.builder()
                        .user_input(userInput)
                        .stock_list(stockList)
                        .build();

        // 2️⃣ Call FastAPI
        try {
            return customerAgentWebClient
                    .post()
                    .uri("/api/process-intent")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(CustomerIntentResponseDto.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();

        } catch (Exception ex) {
            log.warn(ex.getMessage());
            return fallbackResponse();
        }
    }

    private StockItemDto mapToStockItem(Stock stock) {

        Product product =
                productRepository.findById(stock.getSku())
                        .orElseThrow();

        return StockItemDto.builder()
                .sku(stock.getSku())
                .name(product.getProductName())
                .onHand(stock.getOnHand())
                .build();
    }

    private CustomerIntentResponseDto fallbackResponse() {
        return CustomerIntentResponseDto.builder()
                .action("CLARIFY")
                .intent_category("INQUIRY")
                .message("I'm having trouble processing that right now. Could you please clarify your request?")
                .clarifying_question("What product or need can I help you with?")
                .confidence_score(0.0)
                .build();
    }
}
