-- MySQL schema for SmartHome IoT backend
-- Designed to be extensible: sensors are data-driven (rows in `sensors`)

CREATE DATABASE IF NOT EXISTS iot_smarthome
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE iot_smarthome;

-- Devices that can be controlled (AC/TV/Computer/...)
CREATE TABLE IF NOT EXISTS devices (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  device_key VARCHAR(64) NOT NULL,         -- e.g. 'ac', 'tv', 'computer'
  display_name VARCHAR(128) NOT NULL,      -- e.g. 'Điều hòa'
  mqtt_set_topic VARCHAR(255) NOT NULL,    -- e.g. 'smarthome/ac'
  mqtt_status_topic VARCHAR(255) NULL,     -- e.g. 'smarthome/ac/status'
  last_known_state ENUM('ON','OFF') NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_devices_device_key (device_key)
) ENGINE=InnoDB;

-- Sensor definitions (add/change sensors by inserting/updating rows)
CREATE TABLE IF NOT EXISTS sensors (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sensor_key VARCHAR(64) NOT NULL,        -- e.g. 'temp', 'hum', 'lux'
  display_name VARCHAR(128) NOT NULL,     -- e.g. 'Nhiệt độ'
  unit VARCHAR(32) NULL,                 -- e.g. '°C', '%', 'lux'
  value_type ENUM('number','string','boolean') NOT NULL DEFAULT 'number',
  mqtt_field VARCHAR(64) NULL,            -- field name in JSON payload from HW (optional mapping)
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sensors_sensor_key (sensor_key)
) ENGINE=InnoDB;

-- Generic sensor readings: one row per sensor value per timestamp
CREATE TABLE IF NOT EXISTS sensor_readings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sensor_id BIGINT UNSIGNED NOT NULL,
  value_num DOUBLE NULL,
  value_str VARCHAR(255) NULL,
  read_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  source VARCHAR(64) NULL,                -- e.g. 'mqtt', 'manual'
  PRIMARY KEY (id),
  KEY idx_sensor_readings_sensor_time (sensor_id, read_at),
  CONSTRAINT fk_sensor_readings_sensor
    FOREIGN KEY (sensor_id) REFERENCES sensors(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Action history for device control and status updates
CREATE TABLE IF NOT EXISTS action_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  device_id BIGINT UNSIGNED NULL,
  action_type ENUM('CONTROL','STATUS','SYSTEM') NOT NULL DEFAULT 'CONTROL',
  requested_state ENUM('ON','OFF') NULL,
  result_status ENUM('WAITING','SUCCESS','FAILED') NOT NULL DEFAULT 'WAITING',
  message VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_action_history_created_at (created_at),
  KEY idx_action_history_device_id_created_at (device_id, created_at),
  CONSTRAINT fk_action_history_device
    FOREIGN KEY (device_id) REFERENCES devices(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

