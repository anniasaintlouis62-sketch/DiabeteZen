package org.example.repository;

import org.example.model.GlucoseReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface GlucoseReadingRepository extends JpaRepository<GlucoseReading, String> {
    List<GlucoseReading> findByUser_IdOrderByMeasuredAtDesc(String userId);

    List<GlucoseReading> findByUser_IdAndMeasuredAtAfterOrderByMeasuredAtAsc(String userId, LocalDateTime from);
}
