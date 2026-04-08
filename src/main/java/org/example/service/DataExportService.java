package org.example.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.model.Activity;
import org.example.model.Alert;
import org.example.model.GlucoseReading;
import org.example.model.Meal;
import org.example.model.Medication;
import org.example.model.MedicationLog;
import org.example.repository.ActivityRepository;
import org.example.repository.AlertRepository;
import org.example.repository.GlucoseReadingRepository;
import org.example.repository.MealRepository;
import org.example.repository.MedicationLogRepository;
import org.example.repository.MedicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class DataExportService {

    private final GlucoseReadingRepository glucoseReadingRepository;
    private final MealRepository mealRepository;
    private final ActivityRepository activityRepository;
    private final MedicationRepository medicationRepository;
    private final MedicationLogRepository medicationLogRepository;
    private final AlertRepository alertRepository;
    private final ObjectMapper objectMapper;

    public DataExportService(
            GlucoseReadingRepository glucoseReadingRepository,
            MealRepository mealRepository,
            ActivityRepository activityRepository,
            MedicationRepository medicationRepository,
            MedicationLogRepository medicationLogRepository,
            AlertRepository alertRepository,
            ObjectMapper objectMapper
    ) {
        this.glucoseReadingRepository = glucoseReadingRepository;
        this.mealRepository = mealRepository;
        this.activityRepository = activityRepository;
        this.medicationRepository = medicationRepository;
        this.medicationLogRepository = medicationLogRepository;
        this.alertRepository = alertRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public byte[] buildZipForUser(String userId) throws IOException {
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(bos)) {
            addEntry(zos, "glycemie.csv", buildGlucoseCsv(userId));
            addEntry(zos, "repas.csv", buildMealsCsv(userId));
            addEntry(zos, "activites.csv", buildActivitiesCsv(userId));
            addEntry(zos, "medicaments.csv", buildMedicationsCsv(userId));
            addEntry(zos, "prises_medicaments.csv", buildMedicationLogsCsv(userId));
            addEntry(zos, "alertes.csv", buildAlertsCsv(userId));
        }
        return bos.toByteArray();
    }

    private static void addEntry(ZipOutputStream zos, String name, String content) throws IOException {
        zos.putNextEntry(new ZipEntry(name));
        zos.write(content.getBytes(StandardCharsets.UTF_8));
        zos.closeEntry();
    }

    private static String esc(Object v) {
        if (v == null) {
            return "";
        }
        String s = v.toString();
        if (s.contains("\"") || s.contains(",") || s.contains("\n") || s.contains("\r")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }

    private String buildGlucoseCsv(String userId) {
        StringBuilder sb = new StringBuilder();
        sb.append("id,measuredAt,value,context,note,source\n");
        for (GlucoseReading r : glucoseReadingRepository.findByUser_IdOrderByMeasuredAtDesc(userId)) {
            sb.append(esc(r.getId())).append(',')
                    .append(esc(r.getMeasuredAt())).append(',')
                    .append(esc(r.getValue())).append(',')
                    .append(esc(r.getContext())).append(',')
                    .append(esc(r.getNote())).append(',')
                    .append(esc(r.getSource())).append('\n');
        }
        return sb.toString();
    }

    private String buildMealsCsv(String userId) {
        StringBuilder sb = new StringBuilder();
        sb.append("id,eatenAt,mealType,title,carbsGrams,glycemicLoad,note\n");
        for (Meal m : mealRepository.findByUser_IdOrderByEatenAtDesc(userId)) {
            sb.append(esc(m.getId())).append(',')
                    .append(esc(m.getEatenAt())).append(',')
                    .append(esc(m.getMealType())).append(',')
                    .append(esc(m.getTitle())).append(',')
                    .append(esc(m.getCarbsGrams())).append(',')
                    .append(esc(m.getGlycemicLoad())).append(',')
                    .append(esc(m.getNote())).append('\n');
        }
        return sb.toString();
    }

    private String buildActivitiesCsv(String userId) {
        StringBuilder sb = new StringBuilder();
        sb.append("id,startedAt,durationMin,activityType,intensity,note\n");
        for (Activity a : activityRepository.findByUser_IdOrderByStartedAtDesc(userId)) {
            sb.append(esc(a.getId())).append(',')
                    .append(esc(a.getStartedAt())).append(',')
                    .append(esc(a.getDurationMin())).append(',')
                    .append(esc(a.getActivityType())).append(',')
                    .append(esc(a.getIntensity())).append(',')
                    .append(esc(a.getNote())).append('\n');
        }
        return sb.toString();
    }

    private String buildMedicationsCsv(String userId) throws IOException {
        StringBuilder sb = new StringBuilder();
        sb.append("id,name,form,dosage,scheduleJson,isActive,createdAt\n");
        for (Medication m : medicationRepository.findByUser_IdOrderByCreatedAtDesc(userId)) {
            String sched = m.getSchedule() == null ? "" : objectMapper.writeValueAsString(m.getSchedule());
            sb.append(esc(m.getId())).append(',')
                    .append(esc(m.getName())).append(',')
                    .append(esc(m.getForm())).append(',')
                    .append(esc(m.getDosage())).append(',')
                    .append(esc(sched)).append(',')
                    .append(esc(m.getIsActive())).append(',')
                    .append(esc(m.getCreatedAt())).append('\n');
        }
        return sb.toString();
    }

    private String buildMedicationLogsCsv(String userId) {
        StringBuilder sb = new StringBuilder();
        sb.append("id,medicationId,medicationName,takenAt,doseTaken,status,note\n");
        for (MedicationLog l : medicationLogRepository.findByUser_IdOrderByTakenAtDesc(userId)) {
            String medName = l.getMedication() != null ? l.getMedication().getName() : "";
            String medId = l.getMedication() != null ? l.getMedication().getId() : "";
            sb.append(esc(l.getId())).append(',')
                    .append(esc(medId)).append(',')
                    .append(esc(medName)).append(',')
                    .append(esc(l.getTakenAt())).append(',')
                    .append(esc(l.getDoseTaken())).append(',')
                    .append(esc(l.getStatus())).append(',')
                    .append(esc(l.getNote())).append('\n');
        }
        return sb.toString();
    }

    private String buildAlertsCsv(String userId) {
        StringBuilder sb = new StringBuilder();
        sb.append("id,alertType,message,read,createdAt\n");
        for (Alert a : alertRepository.findByUser_IdOrderByCreatedAtDesc(userId)) {
            sb.append(esc(a.getId())).append(',')
                    .append(esc(a.getAlertType())).append(',')
                    .append(esc(a.getMessage())).append(',')
                    .append(esc(a.getIsRead())).append(',')
                    .append(esc(a.getCreatedAt())).append('\n');
        }
        return sb.toString();
    }
}
