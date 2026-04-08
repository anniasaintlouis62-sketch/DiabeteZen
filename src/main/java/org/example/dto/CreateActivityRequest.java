package org.example.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDateTime;

public record CreateActivityRequest(
        @NotNull LocalDateTime startedAt,
        @NotNull @Min(1) Integer durationMin,
        @NotBlank String activityType,
        @NotBlank @Pattern(regexp = "low|moderate|high") String intensity,
        String note
) {
}
