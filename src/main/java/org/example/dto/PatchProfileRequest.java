package org.example.dto;

import java.math.BigDecimal;
import java.util.Map;

public record PatchProfileRequest(
        BigDecimal hypoThreshold,
        BigDecimal hyperThreshold,
        String fullName,
        Map<String, Object> reminderSettings
) {
}
