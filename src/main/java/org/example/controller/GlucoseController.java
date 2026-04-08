package org.example.controller;

import jakarta.validation.Valid;
import org.example.dto.CreateGlucoseReadingRequest;
import org.example.dto.GlucoseReadingResponse;
import org.example.dto.GlucoseTrendPointResponse;
import org.example.service.GlucoseService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/glucose")
public class GlucoseController {
    private final GlucoseService glucoseService;

    public GlucoseController(GlucoseService glucoseService) {
        this.glucoseService = glucoseService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GlucoseReadingResponse create(@Valid @RequestBody CreateGlucoseReadingRequest request) {
        return glucoseService.create(request);
    }

    @GetMapping
    public List<GlucoseReadingResponse> findByUser(@RequestParam String userId) {
        return glucoseService.findByUser(userId);
    }

    @GetMapping("/trends")
    public List<GlucoseTrendPointResponse> trends(
            @RequestParam String userId,
            @RequestParam(defaultValue = "7") int days) {
        return glucoseService.trends(userId, days);
    }
}
