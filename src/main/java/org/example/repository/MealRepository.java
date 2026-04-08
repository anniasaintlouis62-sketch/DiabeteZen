package org.example.repository;

import org.example.model.Meal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MealRepository extends JpaRepository<Meal, String> {
    List<Meal> findByUser_IdOrderByEatenAtDesc(String userId);
}
