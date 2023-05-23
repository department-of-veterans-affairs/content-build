const queries = {
  GET_ALL_PAGES: './graphql/GetAllPages.graphql',
  GET_LATEST_PAGES_BY_IDS: './graphql/GetLatestPagesByIds.graphql',
};

function getQuery(query) {
  if (query === queries.GET_ALL_PAGES) {
    // eslint-disable-next-line import/no-dynamic-require
    return require(query)();
  }
  // eslint-disable-next-line import/no-dynamic-require
  return require(query);
}

module.exports = {
  getQuery,
  queries,
};
