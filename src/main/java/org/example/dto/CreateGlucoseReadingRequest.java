package org.example.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateGlucoseReadingRequest(
        @NotNull String userId,
        @NotNull LocalDateTime measuredAt,
        @NotNull @DecimalMin(value = "0.01") BigDecimal value,
        @NotBlank @Pattern(regexp = "fasting|before_meal|after_meal_2h|bedtime|wakeup|random") String context,
        String note
) {
}
