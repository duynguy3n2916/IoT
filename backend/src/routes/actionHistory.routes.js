const { Router } = require("express");
const { getActionHistory } = require("../controllers/actionHistory.controller");

const actionHistoryRouter = Router();

actionHistoryRouter.get("/action-history", getActionHistory);

module.exports = {
  actionHistoryRouter,
};
