package org.example.dto;

import java.time.Instant;
import java.time.LocalDateTime;

public record MedicationLogResponse(
        String id,
        String medicationId,
        String medicationName,
        String userId,
        LocalDateTime takenAt,
        String doseTaken,
        String status,
        String note,
        Instant createdAt
) {
}
