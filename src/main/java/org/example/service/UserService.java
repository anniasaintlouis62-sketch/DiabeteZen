package org.example.service;

import org.example.dto.CreateUserRequest;
import org.example.dto.PatchProfileRequest;
import org.example.dto.UserResponse;
import org.example.exception.BadRequestException;
import org.example.exception.ConflictException;
import org.example.exception.NotFoundException;
import org.example.model.User;
import org.example.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse create(CreateUserRequest request) {
        userRepository.findByEmail(request.email()).ifPresent(u -> {
            throw new ConflictException("Email already exists");
        });

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setDiabetesType(request.diabetesType());

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    public User getEntityById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found: " + id));
    }

    public UserResponse findById(String id) {
        return toResponse(getEntityById(id));
    }

    @Transactional
    public UserResponse patchCurrentUser(String userId, PatchProfileRequest request) {
        User user = getEntityById(userId);
        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        if (request.hypoThreshold() != null) {
            user.setHypoThreshold(request.hypoThreshold());
        }
        if (request.hyperThreshold() != null) {
            user.setHyperThreshold(request.hyperThreshold());
        }
        BigDecimal hypo = user.getHypoThreshold();
        BigDecimal hyper = user.getHyperThreshold();
        if (hypo.compareTo(hyper) >= 0) {
            throw new BadRequestException("Le seuil hypo doit etre strictement inferieur au seuil hyper.");
        }
        if (hypo.compareTo(BigDecimal.valueOf(40)) < 0 || hypo.compareTo(BigDecimal.valueOf(150)) > 0) {
            throw new BadRequestException("Seuil hypo hors plage raisonnable (40-150 mg/dL).");
        }
        if (hyper.compareTo(BigDecimal.valueOf(80)) < 0 || hyper.compareTo(BigDecimal.valueOf(400)) > 0) {
            throw new BadRequestException("Seuil hyper hors plage raisonnable (80-400 mg/dL).");
        }
        if (request.reminderSettings() != null) {
            user.setReminderSettings(request.reminderSettings());
        }
        return toResponse(userRepository.save(user));
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found for email: " + email));
    }

    public User createUserEntity(String email, String rawPassword, String fullName, String diabetesType) {
        userRepository.findByEmail(email).ifPresent(u -> {
            throw new ConflictException("Email already exists");
        });
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setFullName(fullName);
        user.setDiabetesType(diabetesType);
        return userRepository.save(user);
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getDiabetesType(),
                user.getUnit(),
                user.getHypoThreshold(),
                user.getHyperThreshold(),
                user.getTimezone(),
                user.getReminderSettings(),
                user.getCreatedAt()
        );
    }
}
