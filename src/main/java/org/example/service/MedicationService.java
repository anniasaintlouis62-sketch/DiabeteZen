package org.example.service;

import org.example.dto.CreateMedicationRequest;
import org.example.dto.LogMedicationRequest;
import org.example.dto.MedicationLogResponse;
import org.example.dto.MedicationResponse;
import org.example.exception.NotFoundException;
import org.example.model.Medication;
import org.example.model.MedicationLog;
import org.example.model.User;
import org.example.repository.MedicationLogRepository;
import org.example.repository.MedicationRepository;
import org.example.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedicationService {
    private final MedicationRepository medicationRepository;
    private final MedicationLogRepository medicationLogRepository;
    private final UserService userService;

    public MedicationService(MedicationRepository medicationRepository,
                             MedicationLogRepository medicationLogRepository,
                             UserService userService) {
        this.medicationRepository = medicationRepository;
        this.medicationLogRepository = medicationLogRepository;
        this.userService = userService;
    }

    @Transactional
    public MedicationResponse create(CreateMedicationRequest request) {
        User user = userService.getEntityById(SecurityUtils.currentUserId());
        Medication m = new Medication();
        m.setUser(user);
        m.setName(request.name());
        m.setForm(request.form());
        m.setDosage(request.dosage());
        m.setSchedule(request.schedule());
        m.setIsActive(true);
        return toMedicationResponse(medicationRepository.save(m));
    }

    @Transactional(readOnly = true)
    public List<MedicationResponse> listMedications() {
        String userId = SecurityUtils.currentUserId();
        return medicationRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
                .map(this::toMedicationResponse)
                .toList();
    }

    @Transactional
    public MedicationLogResponse logDose(String medicationId, LogMedicationRequest request) {
        String userId = SecurityUtils.currentUserId();
        Medication med = medicationRepository.findByIdAndUser_Id(medicationId, userId)
                .orElseThrow(() -> new NotFoundException("Traitement introuvable"));
        User user = userService.getEntityById(userId);
        MedicationLog log = new MedicationLog();
        log.setMedication(med);
        log.setUser(user);
        log.setTakenAt(request.takenAt());
        log.setDoseTaken(request.doseTaken());
        log.setStatus(request.status());
        log.setNote(request.note());
        return toLogResponse(medicationLogRepository.save(log));
    }

    @Transactional(readOnly = true)
    public List<MedicationLogResponse> listLogs() {
        String userId = SecurityUtils.currentUserId();
        return medicationLogRepository.findByUser_IdOrderByTakenAtDesc(userId).stream()
                .map(this::toLogResponse)
                .toList();
    }

    private MedicationResponse toMedicationResponse(Medication m) {
        return new MedicationResponse(
                m.getId(),
                m.getUser().getId(),
                m.getName(),
                m.getForm(),
                m.getDosage(),
                m.getSchedule(),
                Boolean.TRUE.equals(m.getIsActive()),
                m.getCreatedAt(),
                m.getUpdatedAt()
        );
    }

    private MedicationLogResponse toLogResponse(MedicationLog log) {
        return new MedicationLogResponse(
                log.getId(),
                log.getMedication().getId(),
                log.getMedication().getName(),
                log.getUser().getId(),
                log.getTakenAt(),
                log.getDoseTaken(),
                log.getStatus(),
                log.getNote(),
                log.getCreatedAt()
        );
    }
}
