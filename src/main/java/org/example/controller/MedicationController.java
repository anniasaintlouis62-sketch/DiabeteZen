package org.example.controller;

import jakarta.validation.Valid;
import org.example.dto.CreateMedicationRequest;
import org.example.dto.LogMedicationRequest;
import org.example.dto.MedicationLogResponse;
import org.example.dto.MedicationResponse;
import org.example.service.MedicationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/medications")
public class MedicationController {
    private final MedicationService medicationService;

    public MedicationController(MedicationService medicationService) {
        this.medicationService = medicationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MedicationResponse create(@Valid @RequestBody CreateMedicationRequest request) {
        return medicationService.create(request);
    }

    @GetMapping
    public List<MedicationResponse> list() {
        return medicationService.listMedications();
    }

    @PostMapping("/{id}/logs")
    @ResponseStatus(HttpStatus.CREATED)
    public MedicationLogResponse logDose(@PathVariable String id, @Valid @RequestBody LogMedicationRequest request) {
        return medicationService.logDose(id, request);
    }

    @GetMapping("/logs/history")
    public List<MedicationLogResponse> listLogs() {
        return medicationService.listLogs();
    }
}
