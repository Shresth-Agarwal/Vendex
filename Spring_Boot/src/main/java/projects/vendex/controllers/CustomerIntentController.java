package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import projects.vendex.dtos.CustomerIntentResponseDto;
import projects.vendex.services.CustomerIntentService;

@RestController
@RequestMapping("/demo/ai/customer")
@RequiredArgsConstructor
public class CustomerIntentController {

    private final CustomerIntentService customerIntentService;

    @PostMapping("/process-intent")
    public CustomerIntentResponseDto processIntent(
            @RequestParam String userInput
    ) {
        return customerIntentService.processIntent(userInput);
    }
}
