package org.example.dto;

import java.time.Instant;
import java.util.Map;

public record MedicationResponse(
        String id,
        String userId,
        String name,
        String form,
        String dosage,
        Map<String, Object> schedule,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}
