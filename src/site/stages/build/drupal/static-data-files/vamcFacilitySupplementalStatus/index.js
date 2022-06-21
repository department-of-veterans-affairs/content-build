const query = `
  query {
    taxonomyTermQuery(limit: 10, offset: 0, filter: {conditions: [{operator: EQUAL, field: "vid", value: ["facility_supplemental_status"]}]}) {
      entities {
        ...on TaxonomyTermFacilitySupplementalStatus {
          name,
          description {
            value
          },
          fieldStatusId
        }
      }
    }
  }
`;

/* eslint-disable camelcase */
const postProcess = queryResult => {
  const entities = queryResult?.data?.taxonomyTermQuery?.entities;
  if (entities) {
    return entities.map(({ name, description, fieldStatusId }) => ({
      name,
      description: description?.value,
      status_id: fieldStatusId, // existing front-end code expecting this identifier `status_id`
    }));
  }

  return queryResult;
};

module.exports = {
  query,
  postProcess,
};
