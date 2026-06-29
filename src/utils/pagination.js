function getPaginationParams(query, defaultLimit = 10, maxLimit = 100) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const requestedLimit = Math.max(parseInt(query.limit, 10) || defaultLimit, 1);
  const limit = Math.min(requestedLimit, maxLimit);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

function buildPaginationMetadata(count, page, limit) {
  const totalPages = Math.ceil(count / limit);

  return {
    page,
    limit,
    totalItems: count,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

function buildPaginatedResponse(count, page, limit, items) {
  return {
    items,
    pagination: buildPaginationMetadata(count, page, limit),
  };
}

module.exports = {
  getPaginationParams,
  buildPaginationMetadata,
  buildPaginatedResponse,
};
