-- A executer sur la base MySQL si spring.jpa.hibernate.ddl-auto=validate
-- (colonnes requises pour profil / rappels / deduplication alertes medicament)

ALTER TABLE users ADD COLUMN reminder_settings JSON NULL;
ALTER TABLE alerts ADD COLUMN dedupe_key VARCHAR(160) NULL;
