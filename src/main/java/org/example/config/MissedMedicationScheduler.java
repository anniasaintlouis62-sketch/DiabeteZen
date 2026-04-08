package org.example.config;

import org.example.repository.MedicationRepository;
import org.example.service.MissedMedicationAlertService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MissedMedicationScheduler {

    private final MedicationRepository medicationRepository;
    private final MissedMedicationAlertService missedMedicationAlertService;

    public MissedMedicationScheduler(
            MedicationRepository medicationRepository,
            MissedMedicationAlertService missedMedicationAlertService
    ) {
        this.medicationRepository = medicationRepository;
        this.missedMedicationAlertService = missedMedicationAlertService;
    }

    /** Toutes les heures (deuxieme 0 = debut de minute). */
    @Scheduled(cron = "0 0 * * * *")
    public void scanAllUsersWithMedications() {
        List<String> userIds = medicationRepository.findDistinctUserIdsWithActiveMedication();
        for (String userId : userIds) {
            try {
                missedMedicationAlertService.scanForUser(userId);
            } catch (Exception ignored) {
                // ne pas bloquer les autres utilisateurs
            }
        }
    }
}
