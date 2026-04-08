package org.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateMealRequest(
        @NotNull LocalDateTime eatenAt,
        @NotBlank @Pattern(regexp = "breakfast|lunch|dinner|snack") String mealType,
        @NotBlank String title,
        BigDecimal carbsGrams,
        BigDecimal glycemicLoad,
        String note
) {
}
