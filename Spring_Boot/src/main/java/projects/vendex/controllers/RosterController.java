package projects.vendex.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import projects.vendex.dtos.RosterResponseDto;
import projects.vendex.services.RosterService;

import java.time.LocalDate;

@RestController
@RequestMapping("/demo/roster")
@RequiredArgsConstructor
public class RosterController {

    private final RosterService rosterService;

    @PostMapping("/generate")
    public RosterResponseDto generateRoster(
            @RequestParam LocalDate date
    ) {
        return rosterService.generateRoster(date);
    }
}

