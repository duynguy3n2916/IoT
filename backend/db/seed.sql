USE iot_smarthome;

-- Default sensors (match common HW payload fields)
INSERT INTO sensors (sensor_key, display_name, unit, value_type, mqtt_field, sort_order) VALUES
  ('temp', 'Nhiệt độ', '°C', 'number', 'temp', 1),
  ('hum',  'Độ ẩm',    '%',  'number', 'hum',  2),
  ('lux',  'Ánh sáng', 'lux','number', 'lux',  3)
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  unit = VALUES(unit),
  value_type = VALUES(value_type),
  mqtt_field = VALUES(mqtt_field),
  sort_order = VALUES(sort_order);

-- Default devices
INSERT INTO devices (device_key, display_name, mqtt_set_topic, mqtt_status_topic) VALUES
  ('ac', 'Điều hòa', 'smarthome/ac', NULL),
  ('tv', 'TV', 'smarthome/tv', NULL),
  ('computer', 'Máy tính', 'smarthome/computer', NULL)
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  mqtt_set_topic = VALUES(mqtt_set_topic),
  mqtt_status_topic = VALUES(mqtt_status_topic);

