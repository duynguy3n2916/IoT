const express = require("express");
const cors = require("cors");

const { env } = require("./config/env");
const { healthRouter } = require("./routes/health.routes");
const { apiRouter } = require("./routes");

function createApp({ io, mqttClient }) {
  const app = express();

  app.locals.io = io;
  app.locals.mqttClient = mqttClient;

  app.use(express.json());
  app.use(
    cors({
      origin: env.corsOrigins,
    })
  );

  app.use(healthRouter);
  app.use("/api", apiRouter);

  app.use((error, _req, res, _next) => {
    console.error("[API] uncaught error:", error);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}

module.exports = {
  createApp,
};
