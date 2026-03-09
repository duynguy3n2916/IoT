const { pool } = require("../config/db");
const { normalizePage } = require("../utils/pagination");

async function getActionHistory(req, res) {
  const { page, limit, offset } = normalizePage(req.query.page, req.query.limit);

  const filters = [];
  const params = [];

  if (req.query.deviceKey) {
    filters.push("d.device_key = ?");
    params.push(String(req.query.deviceKey));
  }
  if (req.query.status) {
    filters.push("ah.result_status = ?");
    params.push(String(req.query.status).toUpperCase());
  }
  if (req.query.from) {
    filters.push("ah.created_at >= ?");
    params.push(new Date(String(req.query.from)));
  }
  if (req.query.to) {
    filters.push("ah.created_at <= ?");
    params.push(new Date(String(req.query.to)));
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM action_history ah
     LEFT JOIN devices d ON d.id = ah.device_id
     ${whereClause}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT
      ah.id AS id,
      d.device_key AS deviceKey,
      d.display_name AS deviceName,
      ah.action_type AS actionType,
      ah.requested_state AS requestedState,
      ah.result_status AS resultStatus,
      ah.message AS message,
      ah.created_at AS createdAt
     FROM action_history ah
     LEFT JOIN devices d ON d.id = ah.device_id
     ${whereClause}
     ORDER BY ah.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return res.json({
    page,
    limit,
    total: countRows[0].total,
    items: rows.map((row) => ({
      id: row.id,
      deviceKey: row.deviceKey,
      deviceName: row.deviceName,
      actionType: row.actionType,
      requestedState: row.requestedState,
      resultStatus: row.resultStatus,
      message: row.message,
      createdAt: new Date(row.createdAt).toISOString(),
    })),
  });
}

module.exports = {
  getActionHistory,
};
