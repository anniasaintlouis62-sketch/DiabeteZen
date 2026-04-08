package org.example.dto;

import java.time.Instant;

public record DoctorResponse(
        String id,
        String fullName,
        String specialty,
        String city,
        String phone,
        String email,
        String institution,
        Instant createdAt
) {
}
