CREATE DATABASE IF NOT EXISTS u415738498_Textos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE u415738498_Textos;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL,
  alias VARCHAR(120) NULL,
  country VARCHAR(120) NULL,
  age TINYINT UNSIGNED NULL,
  gender ENUM('female', 'male', 'other', 'unknown') NULL,
  height_cm DECIMAL(5,2) NULL,
  weight_kg DECIMAL(6,2) NULL,
  imc DECIMAL(5,2) NULL,
  start_datetime DATETIME NOT NULL,
  current_datetime DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_users_alias (alias),
  INDEX idx_users_country (country)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS program_cycles (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  diet_level SMALLINT UNSIGNED NOT NULL,
  calories_target SMALLINT UNSIGNED NOT NULL,
  start_date DATE NOT NULL,
  start_datetime DATETIME NOT NULL,
  planned_days SMALLINT UNSIGNED NOT NULL DEFAULT 56,
  status ENUM('pending_start', 'active', 'completed', 'dropped') NOT NULL DEFAULT 'pending_start',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_program_user_status (user_id, status),
  KEY idx_program_start_date (start_date),
  CONSTRAINT fk_program_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS daily_checkins (
  id CHAR(36) NOT NULL,
  program_id CHAR(36) NOT NULL,
  day_number SMALLINT UNSIGNED NOT NULL,
  tracking_date DATE NOT NULL,
  breakfast_done TINYINT(1) NOT NULL DEFAULT 0,
  lunch_done TINYINT(1) NOT NULL DEFAULT 0,
  meal_done TINYINT(1) NOT NULL DEFAULT 0,
  snack_done TINYINT(1) NOT NULL DEFAULT 0,
  dinner_done TINYINT(1) NOT NULL DEFAULT 0,
  total_calories SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  calories_target SMALLINT UNSIGNED NOT NULL,
  calories_saved SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  calories_extra SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  notes TEXT NULL,
  recorded_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_program_tracking_date (program_id, tracking_date),
  KEY idx_program_day (program_id, day_number),
  CONSTRAINT fk_daily_program FOREIGN KEY (program_id) REFERENCES program_cycles (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS consult_messages (
  id CHAR(36) NOT NULL,
  language VARCHAR(8) NOT NULL,
  diet_calories SMALLINT UNSIGNED NULL,
  menu_label VARCHAR(255) NULL,
  message_text TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  status ENUM('new', 'replied') NOT NULL DEFAULT 'new',
  reply_text TEXT NULL,
  replied_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_consults_created (created_at),
  KEY idx_consults_status (status)
) ENGINE=InnoDB;
