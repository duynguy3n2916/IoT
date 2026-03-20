const { pool } = require("../config/db");

async function listDevices(_req, res) {
  const [rows] = await pool.query(
    `SELECT
      id,
      device_key AS deviceKey,
      display_name AS displayName,
      mqtt_set_topic AS mqttSetTopic,
      mqtt_status_topic AS mqttStatusTopic,
      last_known_state AS lastKnownState
     FROM devices
     ORDER BY id ASC`
  );

  return res.json({ items: rows });
}

/** Gửi last_known_state xuống phần cứng (khi mở dashboard / đồng bộ) – không ghi action_history */
async function syncDevicesToHardware(req, res) {
  const mqttClient = req.app.locals.mqttClient;
  if (!mqttClient || !mqttClient.connected) {
    return res.status(503).json({ message: "MQTT chưa kết nối" });
  }

  const [rows] = await pool.query(
    "SELECT device_key, mqtt_set_topic, last_known_state FROM devices WHERE mqtt_set_topic IS NOT NULL AND mqtt_set_topic != '' AND last_known_state IS NOT NULL"
  );

  for (const row of rows) {
    mqttClient.publish(row.mqtt_set_topic, row.last_known_state);
  }

  return res.json({ synced: rows.length });
}

async function controlDevice(req, res) {
  const io = req.app.locals.io;
  const mqttClient = req.app.locals.mqttClient;

  const deviceKey = String(req.body?.deviceKey || "").trim();
  const state = String(req.body?.state || "").trim().toUpperCase();

  if (!deviceKey || !["ON", "OFF"].includes(state)) {
    return res.status(400).json({
      message: "Invalid payload. Required: { deviceKey, state: 'ON'|'OFF' }",
    });
  }

  const [devices] = await pool.query(
    "SELECT id, device_key, mqtt_set_topic FROM devices WHERE device_key = ? LIMIT 1",
    [deviceKey]
  );
  if (!devices.length) {
    return res.status(404).json({ message: `Device '${deviceKey}' not found` });
  }

  const device = devices[0];
  const [result] = await pool.query(
    `INSERT INTO action_history (device_id, action_type, requested_state, result_status, message)
     VALUES (?, 'CONTROL', ?, 'WAITING', ?)`,
    [device.id, state, "Command published to MQTT"]
  );

  const actionId = result.insertId;

  mqttClient.publish(device.mqtt_set_topic, state, async (error) => {
    if (error) {
      await pool.query(
        "UPDATE action_history SET result_status = 'FAILED', message = ? WHERE id = ?",
        [error.message, actionId]
      );
      return;
    }

    io.emit("control_requested", {
      actionId,
      deviceKey: device.device_key,
      state,
      at: new Date().toISOString(),
    });
  });

  // Nếu sau 10s vẫn chưa có phản hồi từ thiết bị thì tự động đánh dấu FAILED
  setTimeout(async () => {
    try {
      const [rows] = await pool.query(
        "SELECT result_status FROM action_history WHERE id = ? LIMIT 1",
        [actionId]
      );
      if (!rows.length) return;
      if (rows[0].result_status !== "WAITING") return;

      await pool.query(
        "UPDATE action_history SET result_status = 'FAILED', message = ? WHERE id = ?",
        ["Timeout waiting for device response", actionId]
      );

      io.emit("device_status", {
        deviceKey: device.device_key,
        state: "TIMEOUT",
        at: new Date().toISOString(),
      });
    } catch (error) {
      
      console.error("[API] timeout update error:", error.message);
    }
  }, 10_000);

  return res.status(202).json({
    actionId,
    deviceKey: device.device_key,
    requestedState: state,
    status: "WAITING",
  });
}

module.exports = {
  listDevices,
  controlDevice,
  syncDevicesToHardware,
};
