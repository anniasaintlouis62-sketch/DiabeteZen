package org.example.controller;

import org.example.dto.AlertResponse;
import org.example.service.AlertService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {
    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public List<AlertResponse> list() {
        return alertService.listForCurrentUser();
    }

    @PatchMapping("/{id}/read")
    public AlertResponse markRead(@PathVariable String id) {
        return alertService.markRead(id);
    }
}
