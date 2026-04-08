package org.example.controller;

import org.example.dto.PatchProfileRequest;
import org.example.dto.UserResponse;
import org.example.service.UserService;
import org.example.util.SecurityUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse me() {
        return userService.toResponse(userService.getEntityById(SecurityUtils.currentUserId()));
    }

    @PatchMapping("/me")
    public UserResponse patchMe(@RequestBody PatchProfileRequest request) {
        return userService.patchCurrentUser(SecurityUtils.currentUserId(), request);
    }
}
