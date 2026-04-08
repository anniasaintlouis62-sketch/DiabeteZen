package org.example.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

public record MealResponse(
        String id,
        String userId,
        LocalDateTime eatenAt,
        String mealType,
        String title,
        BigDecimal carbsGrams,
        BigDecimal glycemicLoad,
        String note,
        Instant createdAt
) {
}
