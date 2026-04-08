package org.example.service;

import org.example.dto.CreateMealRequest;
import org.example.dto.MealResponse;
import org.example.model.Meal;
import org.example.model.User;
import org.example.repository.MealRepository;
import org.example.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MealService {
    private final MealRepository mealRepository;
    private final UserService userService;

    public MealService(MealRepository mealRepository, UserService userService) {
        this.mealRepository = mealRepository;
        this.userService = userService;
    }

    @Transactional
    public MealResponse create(CreateMealRequest request) {
        User user = userService.getEntityById(SecurityUtils.currentUserId());
        Meal meal = new Meal();
        meal.setUser(user);
        meal.setEatenAt(request.eatenAt());
        meal.setMealType(request.mealType());
        meal.setTitle(request.title());
        meal.setCarbsGrams(request.carbsGrams());
        meal.setGlycemicLoad(request.glycemicLoad());
        meal.setNote(request.note());
        return toResponse(mealRepository.save(meal));
    }

    @Transactional(readOnly = true)
    public List<MealResponse> list() {
        String userId = SecurityUtils.currentUserId();
        return mealRepository.findByUser_IdOrderByEatenAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    private MealResponse toResponse(Meal m) {
        return new MealResponse(
                m.getId(),
                m.getUser().getId(),
                m.getEatenAt(),
                m.getMealType(),
                m.getTitle(),
                m.getCarbsGrams(),
                m.getGlycemicLoad(),
                m.getNote(),
                m.getCreatedAt()
        );
    }
}
