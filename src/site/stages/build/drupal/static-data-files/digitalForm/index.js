const digitalForm = require('./fragments/digitalForm.graphql');
const { postProcessDigitalForm } = require('./postProcessDigitalForm');

const query = `
  ${digitalForm}

  query {
    nodeQuery(
      filter: {
        conditions: [
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
