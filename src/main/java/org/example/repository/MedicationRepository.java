package org.example.repository;

import org.example.model.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MedicationRepository extends JpaRepository<Medication, String> {
    List<Medication> findByUser_IdOrderByCreatedAtDesc(String userId);

    Optional<Medication> findByIdAndUser_Id(String id, String userId);

    List<Medication> findByUser_IdAndIsActiveTrueOrderByCreatedAtAsc(String userId);

    @Query("select distinct m.user.id from Medication m where m.isActive = true")
    List<String> findDistinctUserIdsWithActiveMedication();
}
