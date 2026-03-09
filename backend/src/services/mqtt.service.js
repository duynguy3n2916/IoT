const mqtt = require("mqtt");
const { pool } = require("../config/db");
const { env } = require("../config/env");

function normalizeState(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (raw === "ON" || raw === "OFF") return raw;
  return null;
}

function parseStatusPayload(payloadText) {
  const direct = normalizeState(payloadText);
  if (direct) return direct;

  try {
    const parsed = JSON.parse(payloadText);
    return normalizeState(parsed.state || parsed.status || parsed.value);
  } catch {
    return null;
  }
}

function parseDeviceKeyFromTopic(topic) {
  const parts = topic.split("/");
  if (parts.length >= 3 && parts[0] === "smarthome" && parts[2] === "status") {
    return parts[1];
  }
  return null;
}

async function ingestSensorPayload(payloadText, io) {
  let parsed;
  try {
    parsed = JSON.parse(payloadText);
  } catch {
    return;
  }

  const [sensors] = await pool.query(
    "SELECT id, sensor_key, mqtt_field, value_type FROM sensors WHERE is_active = 1"
  );

  const now = new Date();
  const values = [];
  const latest = {};

  for (const sensor of sensors) {
    const field = sensor.mqtt_field || sensor.sensor_key;
    const rawValue = parsed[field];
    if (rawValue === undefined || rawValue === null) continue;

    let valueNum = null;
    let valueStr = null;

    if (sensor.value_type === "number") {
      const num = Number(rawValue);
      if (Number.isNaN(num)) continue;
      valueNum = num;
      latest[sensor.sensor_key] = num;
    } else if (sensor.value_type === "boolean") {
      const boolValue = ["1", "true", "on"].includes(String(rawValue).toLowerCase());
      valueStr = boolValue ? "true" : "false";
      latest[sensor.sensor_key] = boolValue;
    } else {
      valueStr = String(rawValue);
      latest[sensor.sensor_key] = valueStr;
    }

    values.push([sensor.id, valueNum, valueStr, now, "mqtt"]);
  }

  if (values.length === 0) return;

  await pool.query(
    `INSERT INTO sensor_readings (sensor_id, value_num, value_str, read_at, source)
     VALUES ?`,
    [values]
  );

  io.emit("sensor_update", {
    at: now.toISOString(),
    latest,
  });
}

async function processDeviceStatus(topic, payloadText, io, client) {
  const raw = String(payloadText || "").trim().toUpperCase();

  // Thiết bị báo ONLINE -> khôi phục trạng thái từ last_known_state
  if (raw === "ONLINE") {
    let deviceKey = parseDeviceKeyFromTopic(topic);
    if (!deviceKey) {
      const [deviceFromTopic] = await pool.query(
        "SELECT id, device_key, mqtt_set_topic, last_known_state FROM devices WHERE mqtt_status_topic = ? LIMIT 1",
        [topic]
      );
      if (!deviceFromTopic.length) return;
      const device = deviceFromTopic[0];
      deviceKey = device.device_key;

      if (device.last_known_state && device.mqtt_set_topic) {
        client.publish(device.mqtt_set_topic, device.last_known_state);
      }
      return;
    }

    const [devices] = await pool.query(
      "SELECT id, device_key, mqtt_set_topic, last_known_state FROM devices WHERE device_key = ? LIMIT 1",
      [deviceKey]
    );
    if (!devices.length) return;
    const device = devices[0];
    if (device.last_known_state && device.mqtt_set_topic) {
      client.publish(device.mqtt_set_topic, device.last_known_state);
    }
    return;
  }

  const state = parseStatusPayload(payloadText);
  if (!state) return;

  let deviceKey = parseDeviceKeyFromTopic(topic);
  if (!deviceKey) {
    const [deviceFromTopic] = await pool.query(
      "SELECT id, device_key FROM devices WHERE mqtt_status_topic = ? LIMIT 1",
      [topic]
    );
    if (!deviceFromTopic.length) return;
    deviceKey = deviceFromTopic[0].device_key;
  }

  const [devices] = await pool.query(
    "SELECT id, device_key FROM devices WHERE device_key = ? LIMIT 1",
    [deviceKey]
  );
  if (!devices.length) return;

  const device = devices[0];

  await pool.query("UPDATE devices SET last_known_state = ? WHERE id = ?", [state, device.id]);

  const [waitingActions] = await pool.query(
    `SELECT id, requested_state
     FROM action_history
     WHERE device_id = ?
       AND action_type = 'CONTROL'
       AND result_status = 'WAITING'
     ORDER BY created_at DESC
     LIMIT 1`,
    [device.id]
  );

  if (waitingActions.length > 0) {
    const action = waitingActions[0];
    const resultStatus = action.requested_state === state ? "SUCCESS" : "FAILED";
    const message =
      resultStatus === "SUCCESS"
        ? `Hardware confirmed ${state}`
        : `Hardware responded ${state}, expected ${action.requested_state}`;

    await pool.query(
      "UPDATE action_history SET result_status = ?, message = ? WHERE id = ?",
      [resultStatus, message, action.id]
    );
  }

  io.emit("device_status", {
    deviceKey,
    state,
    at: new Date().toISOString(),
  });
}

function createMqttBridge(io) {
  const client = mqtt.connect(env.mqtt.url, {
    username: env.mqtt.username,
    password: env.mqtt.password,
    reconnectPeriod: 2000,
    connectTimeout: 5000,
  });

  client.on("connect", () => {
    client.subscribe(env.mqtt.sensorTopic);
    client.subscribe(env.mqtt.statusWildcard);
    // eslint-disable-next-line no-console
    console.log(
      `[MQTT] connected and subscribed: ${env.mqtt.sensorTopic}, ${env.mqtt.statusWildcard}`
    );
  });

  client.on("reconnect", () => {
    // eslint-disable-next-line no-console
    console.log("[MQTT] reconnecting...");
  });

  client.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error("[MQTT] error:", err.message);
  });

  client.on("message", async (topic, payload) => {
    const payloadText = payload.toString();
    try {
      if (topic === env.mqtt.sensorTopic) {
        await ingestSensorPayload(payloadText, io);
      } else if (topic.endsWith("/status")) {
        await processDeviceStatus(topic, payloadText, io, client);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[MQTT] message handling error:", error.message);
    }
  });

  return client;
}

module.exports = {
  createMqttBridge,
};
