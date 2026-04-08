package org.example.service;

import org.example.model.Alert;
import org.example.model.Medication;
import org.example.model.User;
import org.example.repository.AlertRepository;
import org.example.repository.MedicationLogRepository;
import org.example.repository.MedicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class MissedMedicationAlertService {

    private static final Pattern TIME_PATTERN = Pattern.compile("^([01]?\\d|2[0-3]):[0-5]\\d$");

    private final MedicationRepository medicationRepository;
    private final MedicationLogRepository medicationLogRepository;
    private final AlertRepository alertRepository;
    private final UserService userService;

    public MissedMedicationAlertService(
            MedicationRepository medicationRepository,
            MedicationLogRepository medicationLogRepository,
            AlertRepository alertRepository,
            UserService userService
    ) {
        this.medicationRepository = medicationRepository;
        this.medicationLogRepository = medicationLogRepository;
        this.alertRepository = alertRepository;
        this.userService = userService;
    }

    @Transactional
    public void scanForUser(String userId) {
        User user = userService.getEntityById(userId);
        ZoneId zone = resolveZone(user.getTimezone());
        LocalDateTime nowZoned = LocalDateTime.now(zone);
        LocalDate today = nowZoned.toLocalDate();

        List<Medication> meds = medicationRepository.findByUser_IdAndIsActiveTrueOrderByCreatedAtAsc(userId);
        for (Medication med : meds) {
            if (med.getSchedule() == null) {
                continue;
            }
            Object timesObj = med.getSchedule().get("times");
            if (!(timesObj instanceof List<?> times)) {
                continue;
            }
            for (Object t : times) {
                if (t == null) {
                    continue;
                }
                String slot = t.toString().trim();
                if (!TIME_PATTERN.matcher(slot).matches()) {
                    continue;
                }
                for (LocalDate day : List.of(today, today.minusDays(1))) {
                    tryCreateMissedAlert(user, med, userId, zone, nowZoned, day, slot);
                }
            }
        }
    }

    private void tryCreateMissedAlert(
            User user,
            Medication med,
            String userId,
            ZoneId zone,
            LocalDateTime nowZoned,
            LocalDate day,
            String slot
    ) {
        String[] hm = slot.split(":");
        int h = Integer.parseInt(hm[0]);
        int m = Integer.parseInt(hm[1]);
        LocalDateTime scheduled = LocalDateTime.of(day, LocalTime.of(h, m));
        LocalDateTime deadline = scheduled.plusHours(2);
        if (nowZoned.isBefore(deadline)) {
            return;
        }
        LocalDateTime windowStart = scheduled.minusHours(1);
        LocalDateTime windowEnd = scheduled.plusHours(4);
        boolean hasTaken = medicationLogRepository.existsByMedication_IdAndUser_IdAndStatusAndTakenAtBetween(
                med.getId(),
                userId,
                "taken",
                windowStart,
                windowEnd
        );
        if (hasTaken) {
            return;
        }
        String dedupe = "missed|" + med.getId() + "|" + day + "|" + String.format("%02d%02d", h, m);
        if (alertRepository.findByUser_IdAndDedupeKey(userId, dedupe).isPresent()) {
            return;
        }
        Alert alert = new Alert();
        alert.setUser(user);
        alert.setGlucoseReading(null);
        alert.setAlertType("medication_missed");
        alert.setMessage("Prise non enregistree: " + med.getName() + " (prevue vers " + slot + ", " + day + ")");
        alert.setDedupeKey(dedupe);
        alert.setIsRead(false);
        alertRepository.save(alert);
    }

    private static ZoneId resolveZone(String timezone) {
        if (timezone == null || timezone.isBlank()) {
            return ZoneId.of("UTC");
        }
        try {
            return ZoneId.of(timezone);
        } catch (Exception ex) {
            return ZoneId.of("UTC");
        }
    }
}
