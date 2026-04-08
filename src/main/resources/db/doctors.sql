-- À exécuter sur la base diabetezen (MySQL) avant de redémarrer l'app si spring.jpa.hibernate.ddl-auto=validate

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

INSERT INTO doctors (id, full_name, specialty, city, phone, email, institution, created_at, updated_at) VALUES
('a1111111111111111111111111111111', 'Dr Marie Saint-Louis', 'Endocrinologie-diabétologie', 'Delmas 33', '+509 48 56 78 32', 'marie@34', 'Hopital Lapaix', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
('a2222222222222222222222222222222', 'Dr Jean-Baptiste Pierre', 'Diabetologie', 'Petionville', '+509 32 54 67 90', '', 'Ephata', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
('a3333333333333333333333333333333', 'Dr Aminata Belizaire', 'Diabétologie', 'Route de Frere', '+509 48 65 22 36', 'aminita.sante@example.cg', 'Centre hospitalier Aminita', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6))
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);
