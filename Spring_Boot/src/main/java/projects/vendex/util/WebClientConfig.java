package projects.vendex.util;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient inventoryMlWebClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:8000")
                .build();
    }

    @Bean
    public WebClient customerAgentWebClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:8000")
                .build();
    }

    @Bean
    public WebClient fastApiWebClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:8000")
                .build();
    }

    @Bean
    public WebClient mlWebClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:8000")
                .build();
    }
}