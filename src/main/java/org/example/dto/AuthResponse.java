package org.example.dto;

public record AuthResponse(
        String accessToken,
        String tokenType,
        UserResponse user
) {
}
