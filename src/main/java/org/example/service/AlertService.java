package org.example.service;

import org.example.dto.AlertResponse;
import org.example.exception.NotFoundException;
import org.example.model.Alert;
import org.example.repository.AlertRepository;
import org.example.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlertService {
    private final AlertRepository alertRepository;
    private final MissedMedicationAlertService missedMedicationAlertService;

    public AlertService(AlertRepository alertRepository, MissedMedicationAlertService missedMedicationAlertService) {
        this.alertRepository = alertRepository;
        this.missedMedicationAlertService = missedMedicationAlertService;
    }

    @Transactional
    public List<AlertResponse> listForCurrentUser() {
        String userId = SecurityUtils.currentUserId();
        missedMedicationAlertService.scanForUser(userId);
        return alertRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AlertResponse markRead(String alertId) {
        String userId = SecurityUtils.currentUserId();
        Alert alert = alertRepository.findByIdAndUser_Id(alertId, userId)
                .orElseThrow(() -> new NotFoundException("Alerte introuvable"));
        alert.setIsRead(true);
        return toResponse(alertRepository.save(alert));
    }

    private AlertResponse toResponse(Alert a) {
        String glucoseId = a.getGlucoseReading() != null ? a.getGlucoseReading().getId() : null;
        return new AlertResponse(
                a.getId(),
                a.getUser().getId(),
                glucoseId,
                a.getAlertType(),
                a.getMessage(),
                Boolean.TRUE.equals(a.getIsRead()),
                a.getCreatedAt()
        );
    }
}
