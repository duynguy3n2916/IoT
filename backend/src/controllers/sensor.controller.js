const { pool } = require("../config/db");
const { normalizePage } = require("../utils/pagination");
const { formatSensorValue, getRangeStart } = require("../utils/sensor");

async function getSensors(req, res) {
  const rangeStart = getRangeStart(req.query.range);

  const [rows] = await pool.query(
    `SELECT
      s.sensor_key AS sensorKey,
      s.display_name AS displayName,
      s.unit AS unit,
      sr.read_at AS readAt,
      sr.value_num AS value_num,
      sr.value_str AS value_str
    FROM sensor_readings sr
    INNER JOIN sensors s ON s.id = sr.sensor_id
    WHERE sr.read_at >= ?
    ORDER BY sr.read_at ASC`,
    [rangeStart]
  );

  const grouped = new Map();
  const latest = {};

  for (const row of rows) {
    if (!grouped.has(row.sensorKey)) {
      grouped.set(row.sensorKey, {
        sensorKey: row.sensorKey,
        displayName: row.displayName,
        unit: row.unit,
        points: [],
      });
    }
    const value = formatSensorValue(row);
    grouped.get(row.sensorKey).points.push({
      at: new Date(row.readAt).toISOString(),
      value,
    });
    latest[row.sensorKey] = value;
  }

  return res.json({
    from: rangeStart.toISOString(),
    to: new Date().toISOString(),
    latest,
    series: [...grouped.values()],
  });
}

async function getSensorsData(req, res) {
  const { page, limit, offset } = normalizePage(req.query.page, req.query.limit);

  const filters = [];
  const params = [];

  if (req.query.sensor) {
    const sensor = String(req.query.sensor).trim();
    const tokens = sensor.split(/\s+/).filter(Boolean);

    if (tokens.length <= 1) {
      filters.push("(s.sensor_key = ? OR s.display_name LIKE ?)");
      params.push(sensor, `%${sensor}%`);
    } else {
      const likeClauses = tokens.map(() => "s.display_name LIKE ?").join(" AND ");
      filters.push(`(s.sensor_key = ? OR (${likeClauses}))`);
      params.push(sensor, ...tokens.map((t) => `%${t}%`));
    }
  }
  if (req.query.from) {
    filters.push("sr.read_at >= ?");
    params.push(new Date(String(req.query.from)));
  }
  if (req.query.to) {
    filters.push("sr.read_at <= ?");
    params.push(new Date(String(req.query.to)));
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM sensor_readings sr
     INNER JOIN sensors s ON s.id = sr.sensor_id
     ${whereClause}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT
      sr.id AS id,
      s.sensor_key AS sensorKey,
      s.display_name AS sensorName,
      s.unit AS unit,
      sr.value_num AS value_num,
      sr.value_str AS value_str,
      sr.read_at AS readAt,
      sr.source AS source
     FROM sensor_readings sr
     INNER JOIN sensors s ON s.id = sr.sensor_id
     ${whereClause}
     ORDER BY sr.read_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return res.json({
    page,
    limit,
    total: countRows[0].total,
    items: rows.map((row) => ({
      id: row.id,
      sensorKey: row.sensorKey,
      sensorName: row.sensorName,
      value: formatSensorValue(row),
      unit: row.unit,
      source: row.source,
      readAt: new Date(row.readAt).toISOString(),
    })),
  });
}

module.exports = {
  getSensors,
  getSensorsData,
};
