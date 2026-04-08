package org.example.service;

import org.example.dto.ActivityResponse;
import org.example.dto.CreateActivityRequest;
import org.example.model.Activity;
import org.example.model.User;
import org.example.repository.ActivityRepository;
import org.example.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final UserService userService;

    public ActivityService(ActivityRepository activityRepository, UserService userService) {
        this.activityRepository = activityRepository;
        this.userService = userService;
    }

    @Transactional
    public ActivityResponse create(CreateActivityRequest request) {
        User user = userService.getEntityById(SecurityUtils.currentUserId());
        Activity a = new Activity();
        a.setUser(user);
        a.setStartedAt(request.startedAt());
        a.setDurationMin(request.durationMin());
        a.setActivityType(request.activityType());
        a.setIntensity(request.intensity());
        a.setNote(request.note());
        return toResponse(activityRepository.save(a));
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> list() {
        String userId = SecurityUtils.currentUserId();
        return activityRepository.findByUser_IdOrderByStartedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    private ActivityResponse toResponse(Activity a) {
        return new ActivityResponse(
                a.getId(),
                a.getUser().getId(),
                a.getStartedAt(),
                a.getDurationMin(),
                a.getActivityType(),
                a.getIntensity(),
                a.getNote(),
                a.getCreatedAt()
        );
    }
}
