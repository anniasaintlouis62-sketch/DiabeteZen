package org.example.controller;

import jakarta.validation.Valid;
import org.example.dto.CreateMealRequest;
import org.example.dto.MealResponse;
import org.example.service.MealService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/meals")
public class MealController {
    private final MealService mealService;

    public MealController(MealService mealService) {
        this.mealService = mealService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MealResponse create(@Valid @RequestBody CreateMealRequest request) {
        return mealService.create(request);
    }

    @GetMapping
    public List<MealResponse> list() {
        return mealService.list();
    }
}
