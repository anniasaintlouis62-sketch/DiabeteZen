-- Idempotent : n'ajoute la colonne que si elle est absente (bases déjà partiellement patchées)
SET @db = DATABASE();

SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'reminder_settings') = 0,
    'ALTER TABLE users ADD COLUMN reminder_settings JSON NULL',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'alerts' AND COLUMN_NAME = 'dedupe_key') = 0,
    'ALTER TABLE alerts ADD COLUMN dedupe_key VARCHAR(160) NULL',
    'SELECT 1'
  )
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
