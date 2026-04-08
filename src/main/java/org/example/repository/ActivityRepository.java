package org.example.repository;

import org.example.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, String> {
    List<Activity> findByUser_IdOrderByStartedAtDesc(String userId);
}
