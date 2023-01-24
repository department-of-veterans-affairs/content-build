const { pascalize } = require('../../../../utilities/stringHelpers');

const getEntityQueueByName = entityQueueName => {
  const pascalCaseName = pascalize(entityQueueName);
  return `
    query GetEntityQueue${pascalCaseName} {
      entityQueue${pascalCaseName}: entitySubqueueQuery(filter:{
        conditions: [{field: "name", value: "${entityQueueName}"}]
      }) {
        entities {
          ...on EntitySubqueue {
            name
            items {
              targetId
            }
          }
        }
      }
    }
  `;
};

module.exports = {
  getEntityQueueByName,
};
