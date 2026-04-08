package org.example.util;

import org.example.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {
    private SecurityUtils() {
    }

    public static String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("Non authentifie");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof String s && !s.isBlank()) {
            return s;
        }
        throw new UnauthorizedException("Non authentifie");
    }
}
