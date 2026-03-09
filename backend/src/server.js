require("dotenv").config();

const http = require("http");
const { env } = require("./config/env");
const { createApp } = require("./app");
const { createSocketServer } = require("./realtime/socket");
const { createMqttBridge } = require("./services/mqtt.service");

const server = http.createServer();
const io = createSocketServer(server);
const mqttClient = createMqttBridge(io);
const app = createApp({ io, mqttClient });

server.on("request", app);

server.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[API] backend is running on http://localhost:${env.port}`);
});
