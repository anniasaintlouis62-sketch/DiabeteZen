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
