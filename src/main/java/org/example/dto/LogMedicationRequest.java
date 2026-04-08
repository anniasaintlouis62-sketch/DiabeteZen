package org.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDateTime;

public record LogMedicationRequest(
        @NotNull LocalDateTime takenAt,
        String doseTaken,
        @NotBlank @Pattern(regexp = "taken|missed|partial") String status,
        String note
) {
}
