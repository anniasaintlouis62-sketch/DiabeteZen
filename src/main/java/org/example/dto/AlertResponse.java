package org.example.dto;

import java.time.Instant;

public record AlertResponse(
        String id,
        String userId,
        String glucoseReadingId,
        String alertType,
        String message,
        boolean read,
        Instant createdAt
) {
}
