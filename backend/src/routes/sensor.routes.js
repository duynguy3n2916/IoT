const { Router } = require("express");
const { getSensors, getSensorsData } = require("../controllers/sensor.controller");

const sensorRouter = Router();

sensorRouter.get("/sensors", getSensors);
sensorRouter.get("/sensors-data", getSensorsData);

module.exports = {
  sensorRouter,
};
