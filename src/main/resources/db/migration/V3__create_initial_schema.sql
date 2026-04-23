CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    diabetes_type ENUM('type1','type2','gestational','other') NOT NULL,
    unit ENUM('mg/dL','mmol/L') NOT NULL DEFAULT 'mg/dL',
    hypo_threshold DECIMAL(6,2) NOT NULL DEFAULT 70.00,
    hyper_threshold DECIMAL(6,2) NOT NULL DEFAULT 180.00,
    timezone VARCHAR(100) NOT NULL DEFAULT 'Africa/Porto-Novo',
    reminder_settings JSON NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS doctors (
    id CHAR(36) NOT NULL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(150) NOT NULL,
    city VARCHAR(120) NOT NULL,
    phone VARCHAR(40) NULL,
    email VARCHAR(255) NULL,
    institution VARCHAR(255) NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS glucose_readings (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    measured_at DATETIME(6) NOT NULL,
    value DECIMAL(6,2) NOT NULL,
    context ENUM('fasting','before_meal','after_meal_2h','bedtime','wakeup','random') NOT NULL,
    note VARCHAR(255) NULL,
    source ENUM('manual','device') NOT NULL DEFAULT 'manual',
    created_at TIMESTAMP(6) NOT NULL,
    INDEX idx_glucose_user_measured_at (user_id, measured_at),
    CONSTRAINT fk_glucose_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS meals (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    eaten_at DATETIME(6) NOT NULL,
    meal_type ENUM('breakfast','lunch','dinner','snack') NOT NULL,
    title VARCHAR(255) NOT NULL,
    carbs_grams DECIMAL(6,2) NULL,
    glycemic_load DECIMAL(6,2) NULL,
    note TEXT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    INDEX idx_meals_user_eaten_at (user_id, eaten_at),
    CONSTRAINT fk_meals_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activities (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    started_at DATETIME(6) NOT NULL,
    duration_min INT NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    intensity ENUM('low','moderate','high') NOT NULL,
    note TEXT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    INDEX idx_activities_user_started_at (user_id, started_at),
    CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS medications (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    form ENUM('tablet','injection','insulin','other') NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    schedule JSON NOT NULL,
    is_active BIT(1) NOT NULL DEFAULT b'1',
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    INDEX idx_medications_user_created_at (user_id, created_at),
    CONSTRAINT fk_medications_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS medication_logs (
    id CHAR(36) NOT NULL PRIMARY KEY,
    medication_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    taken_at DATETIME(6) NOT NULL,
    dose_taken VARCHAR(100) NULL,
    status ENUM('taken','missed','partial') NOT NULL,
    note TEXT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    INDEX idx_medication_logs_user_taken_at (user_id, taken_at),
    INDEX idx_medication_logs_medication_taken_at (medication_id, taken_at),
    CONSTRAINT fk_medication_logs_medication FOREIGN KEY (medication_id) REFERENCES medications(id),
    CONSTRAINT fk_medication_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alerts (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    glucose_reading_id CHAR(36) NULL,
    alert_type ENUM('hypo','hyper','medication_missed') NOT NULL,
    message VARCHAR(500) NOT NULL,
    dedupe_key VARCHAR(160) NULL,
    is_read BIT(1) NOT NULL DEFAULT b'0',
    created_at TIMESTAMP(6) NOT NULL,
    INDEX idx_alerts_user_created_at (user_id, created_at),
    INDEX idx_alerts_user_dedupe_key (user_id, dedupe_key),
    CONSTRAINT fk_alerts_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_alerts_glucose FOREIGN KEY (glucose_reading_id) REFERENCES glucose_readings(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
