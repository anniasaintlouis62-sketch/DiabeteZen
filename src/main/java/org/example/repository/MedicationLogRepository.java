package org.example.repository;

import org.example.model.MedicationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MedicationLogRepository extends JpaRepository<MedicationLog, String> {
    List<MedicationLog> findByUser_IdOrderByTakenAtDesc(String userId);

    boolean existsByMedication_IdAndUser_IdAndStatusAndTakenAtBetween(
            String medicationId,
            String userId,
            String status,
            LocalDateTime takenAtStart,
            LocalDateTime takenAtEnd
    );
}
