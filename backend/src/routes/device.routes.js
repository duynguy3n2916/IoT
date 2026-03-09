const { Router } = require("express");
const { listDevices, controlDevice, syncDevicesToHardware } = require("../controllers/device.controller");

const deviceRouter = Router();

deviceRouter.get("/devices", listDevices);
deviceRouter.post("/devices/sync", syncDevicesToHardware);
deviceRouter.post("/device/control", controlDevice);

module.exports = {
  deviceRouter,
};
