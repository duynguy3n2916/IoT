/**
 * MQTT WebSocket config - khớp với mosquitto_conf
 * listener 9001 protocol websockets
 */
export const MQTT_CONFIG = {
  brokerUrl:
    process.env.NEXT_PUBLIC_MQTT_URL || "ws://localhost:9001",
  username: process.env.NEXT_PUBLIC_MQTT_USERNAME || "",
  password: process.env.NEXT_PUBLIC_MQTT_PASSWORD || "",
  topics: {
    sensors: "smarthome/sensors",
    ac: "smarthome/ac",
    tv: "smarthome/tv",
    computer: "smarthome/computer",
    ack: "smarthome/ack",
  },
} as const;
