const { pingDatabase } = require("../config/db");

async function getHealth(_req, res) {
  await pingDatabase();

  return res.json({
    ok: true,
    db: "up",
    mqttConnected: Boolean(_req.app.locals.mqttClient?.connected),
    time: new Date().toISOString(),
  });
}

module.exports = {
  getHealth,
};
