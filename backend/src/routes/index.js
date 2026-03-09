const { Router } = require("express");
const { deviceRouter } = require("./device.routes");
const { sensorRouter } = require("./sensor.routes");
const { actionHistoryRouter } = require("./actionHistory.routes");

const apiRouter = Router();

apiRouter.use(deviceRouter);
apiRouter.use(sensorRouter);
apiRouter.use(actionHistoryRouter);

module.exports = {
  apiRouter,
};
