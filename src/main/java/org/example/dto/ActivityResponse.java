package org.example.dto;

import java.time.Instant;
import java.time.LocalDateTime;

public record ActivityResponse(
        String id,
        String userId,
        LocalDateTime startedAt,
        int durationMin,
        String activityType,
        String intensity,
        String note,
        Instant createdAt
) {
}
