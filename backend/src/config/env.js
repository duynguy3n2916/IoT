const env = {
  port: Number(process.env.PORT || 4000),
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:3000").split(","),
  mysql: {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "iot_smarthome",
  },
  mqtt: {
    url: process.env.MQTT_URL || "mqtt://127.0.0.1:1883",
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined,
    sensorTopic: process.env.MQTT_SENSOR_TOPIC || "smarthome/sensors",
    statusWildcard: process.env.MQTT_STATUS_WILDCARD || "smarthome/+/status",
  },
};

module.exports = { env };
