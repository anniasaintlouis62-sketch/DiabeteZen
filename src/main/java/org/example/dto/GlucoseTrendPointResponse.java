package org.example.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record GlucoseTrendPointResponse(
        LocalDateTime measuredAt,
        BigDecimal value
) {
}
