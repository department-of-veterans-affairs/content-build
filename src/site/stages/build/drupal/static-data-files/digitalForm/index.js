import digitalForm from './fragments/digitalForm.graphql';
import { postProcessDigitalForm } from './postProcessDigitalForm';

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
