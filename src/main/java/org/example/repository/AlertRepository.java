package org.example.repository;

import org.example.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlertRepository extends JpaRepository<Alert, String> {
    List<Alert> findByUser_IdOrderByCreatedAtDesc(String userId);

    Optional<Alert> findByIdAndUser_Id(String id, String userId);

    Optional<Alert> findByUser_IdAndDedupeKey(String userId, String dedupeKey);
}
