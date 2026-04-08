package org.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.Map;

public record CreateMedicationRequest(
        @NotBlank String name,
        @NotBlank @Pattern(regexp = "tablet|injection|insulin|other") String form,
        @NotBlank String dosage,
        @NotNull Map<String, Object> schedule
) {
}
