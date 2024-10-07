const digitalForm = require('./fragments/digitalForm.graphql');
const { postProcessDigitalForm } = require('./postProcessDigitalForm');

const query = `
  ${digitalForm}

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
        ... digitalForm
      }
    }
  }
`;

module.exports = {
  query,
  postProcess: postProcessDigitalForm,
};
