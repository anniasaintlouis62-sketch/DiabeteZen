package org.example.service;

import org.example.dto.CreateGlucoseReadingRequest;
import org.example.dto.GlucoseReadingResponse;
import org.example.dto.GlucoseTrendPointResponse;
import org.example.exception.UnauthorizedException;
import org.example.model.Alert;
import org.example.model.GlucoseReading;
import org.example.model.User;
import org.example.repository.AlertRepository;
import org.example.repository.GlucoseReadingRepository;
import org.example.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class GlucoseService {
    private final GlucoseReadingRepository glucoseReadingRepository;
    private final AlertRepository alertRepository;
    private final UserService userService;

    public GlucoseService(GlucoseReadingRepository glucoseReadingRepository, AlertRepository alertRepository, UserService userService) {
        this.glucoseReadingRepository = glucoseReadingRepository;
        this.alertRepository = alertRepository;
        this.userService = userService;
    }

    @Transactional
    public GlucoseReadingResponse create(CreateGlucoseReadingRequest request) {
        String currentId = SecurityUtils.currentUserId();
        if (!currentId.equals(request.userId())) {
            throw new UnauthorizedException("Acces refuse pour cet utilisateur");
        }
        User user = userService.getEntityById(request.userId());

        GlucoseReading reading = new GlucoseReading();
        reading.setUser(user);
        reading.setMeasuredAt(request.measuredAt());
        reading.setValue(request.value());
        reading.setContext(request.context());
        reading.setNote(request.note());
        reading.setSource("manual");

        GlucoseReading saved = glucoseReadingRepository.save(reading);
        createAlertIfNeeded(user, saved);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<GlucoseReadingResponse> findByUser(String userId) {
        String currentId = SecurityUtils.currentUserId();
        if (!currentId.equals(userId)) {
            throw new UnauthorizedException("Acces refuse pour cet utilisateur");
        }
        userService.getEntityById(userId);
        return glucoseReadingRepository.findByUser_IdOrderByMeasuredAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GlucoseTrendPointResponse> trends(String userId, int days) {
        String currentId = SecurityUtils.currentUserId();
        if (!currentId.equals(userId)) {
            throw new UnauthorizedException("Acces refuse pour cet utilisateur");
        }
        userService.getEntityById(userId);
        int d = Math.min(Math.max(days, 1), 90);
        LocalDateTime from = LocalDateTime.now().minusDays(d);
        return glucoseReadingRepository.findByUser_IdAndMeasuredAtAfterOrderByMeasuredAtAsc(userId, from)
                .stream()
                .map(r -> new GlucoseTrendPointResponse(r.getMeasuredAt(), r.getValue()))
                .toList();
    }

    private void createAlertIfNeeded(User user, GlucoseReading reading) {
        BigDecimal value = reading.getValue();
        if (value.compareTo(user.getHypoThreshold()) < 0) {
            saveAlert(user, reading, "hypo", "Alerte hypo: glycémie trop basse (" + value + ")");
            return;
        }
        if (value.compareTo(user.getHyperThreshold()) > 0) {
            saveAlert(user, reading, "hyper", "Alerte hyper: glycémie trop haute (" + value + ")");
        }
    }

    private void saveAlert(User user, GlucoseReading reading, String type, String message) {
        Alert alert = new Alert();
        alert.setUser(user);
        alert.setGlucoseReading(reading);
        alert.setAlertType(type);
        alert.setMessage(message);
        alert.setIsRead(false);
        alertRepository.save(alert);
    }

    private GlucoseReadingResponse toResponse(GlucoseReading reading) {
        return new GlucoseReadingResponse(
                reading.getId(),
                reading.getUser().getId(),
                reading.getMeasuredAt(),
                reading.getValue(),
                reading.getContext(),
                reading.getNote(),
                reading.getSource(),
                reading.getCreatedAt()
        );
    }
}
