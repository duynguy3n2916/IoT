function normalizePage(queryPage, queryLimit) {
  const page = Math.max(Number(queryPage || 1), 1);
  const limit = Math.min(Math.max(Number(queryLimit || 12), 1), 200);
  return { page, limit, offset: (page - 1) * limit };
}

module.exports = {
  normalizePage,
};
