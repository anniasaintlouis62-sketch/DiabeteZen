package org.example.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
    @Id
    @Column(name = "id", nullable = false, updatable = false, columnDefinition = "CHAR(36)")
    private String id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(
            name = "diabetes_type",
            nullable = false,
            columnDefinition = "ENUM('type1','type2','gestational','other')"
    )
    private String diabetesType;

    @Column(nullable = false, columnDefinition = "ENUM('mg/dL','mmol/L')")
    private String unit = "mg/dL";

    @Column(name = "hypo_threshold", nullable = false, precision = 6, scale = 2)
    private BigDecimal hypoThreshold = new BigDecimal("70.00");

    @Column(name = "hyper_threshold", nullable = false, precision = 6, scale = 2)
    private BigDecimal hyperThreshold = new BigDecimal("180.00");

    @Column(nullable = false)
    private String timezone = "Africa/Porto-Novo";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "reminder_settings", columnDefinition = "json")
    private Map<String, Object> reminderSettings;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getDiabetesType() { return diabetesType; }
    public void setDiabetesType(String diabetesType) { this.diabetesType = diabetesType; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public BigDecimal getHypoThreshold() { return hypoThreshold; }
    public void setHypoThreshold(BigDecimal hypoThreshold) { this.hypoThreshold = hypoThreshold; }
    public BigDecimal getHyperThreshold() { return hyperThreshold; }
    public void setHyperThreshold(BigDecimal hyperThreshold) { this.hyperThreshold = hyperThreshold; }
    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
    public Map<String, Object> getReminderSettings() { return reminderSettings; }
    public void setReminderSettings(Map<String, Object> reminderSettings) { this.reminderSettings = reminderSettings; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
