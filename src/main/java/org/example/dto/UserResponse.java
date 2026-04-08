package org.example.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

public record UserResponse(
        String id,
        String email,
        String fullName,
        String diabetesType,
        String unit,
        BigDecimal hypoThreshold,
        BigDecimal hyperThreshold,
        String timezone,
        Map<String, Object> reminderSettings,
        Instant createdAt
) {
}
