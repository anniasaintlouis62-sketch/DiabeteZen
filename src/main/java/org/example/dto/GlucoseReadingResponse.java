package org.example.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

public record GlucoseReadingResponse(
        String id,
        String userId,
        LocalDateTime measuredAt,
        BigDecimal value,
        String context,
        String note,
        String source,
        Instant createdAt
) {
}
