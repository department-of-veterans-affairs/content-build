const query = `
  query ($onlyPublishedContent: Boolean!) {
    nodeQuery(
      filter: {
        conditions: [
          { field: "status", value: "1", enabled: $onlyPublishedContent },
          { field: "type", value: "digital_form" }
        ]
      }
    ) {
      entities {
      }
    }
  }
`;

module.exports = { query };
