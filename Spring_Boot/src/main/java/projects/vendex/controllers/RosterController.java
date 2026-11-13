package projects.vendex.controllers;

import java.time.LocalDate;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import projects.vendex.dtos.RosterResponseDto;
import projects.vendex.services.RosterService;

@RestController
@RequestMapping("/demo/roster")
@RequiredArgsConstructor
public class RosterController {

    private final RosterService rosterService;

    @PostMapping("/generate")
    public RosterResponseDto generateRoster(
            @RequestParam LocalDate date
    ) throws java.util.concurrent.TimeoutException {
        return rosterService.generateRoster(date);
    }
}

