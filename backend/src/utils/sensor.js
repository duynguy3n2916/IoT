function formatSensorValue(row) {
  return row.value_num !== null ? Number(row.value_num) : row.value_str;
}

function getRangeStart(rangeText) {
  const text = String(rangeText || "12h").trim().toLowerCase();
  const match = text.match(/^(\d+)([hm])$/);
  if (!match) {
    return new Date(Date.now() - 12 * 60 * 60 * 1000);
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const ms = unit === "h" ? amount * 60 * 60 * 1000 : amount * 60 * 1000;
  return new Date(Date.now() - ms);
}

module.exports = {
  formatSensorValue,
  getRangeStart,
};
