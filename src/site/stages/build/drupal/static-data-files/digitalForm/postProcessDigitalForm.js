const { logDrupal } = require('../../utilities-drupal');

const extractAdditionalFields = entity => {
  const additionalFields = {};

  if (entity.type.entity.entityId === 'digital_form_name_and_date_of_bi') {
    additionalFields.includeDateOfBirth = entity.fieldIncludeDateOfBirth;
  }

  return additionalFields;
};
const extractForms = resultObject => resultObject?.data?.nodeQuery?.entities;

const normalizeChapter = ({ entity }) => {
  return {
    id: parseInt(entity.entityId, 10),
    chapterTitle: entity.fieldTitle,
    type: entity.type.entity.entityId,
    pageTitle: entity.type.entity.entityLabel,
    additionalFields: extractAdditionalFields(entity),
  };
};

const normalizeForm = (form, logger = logDrupal) => {
  try {
    return {
      cmsId: form.nid,
      formId: form.fieldVaFormNumber,
      title: form.entityLabel,
      ombNumber: form.fieldOmbNumber,
      chapters: form.fieldChapters.map(normalizeChapter),
    };
  } catch (error) {
    logger(`There was an error with this form: ${error}`);
    return {};
  }
};

const postProcessDigitalForm = (queryResult, logger = logDrupal) => {
  // queryResult was already parsed by graphQLApiClient
  const forms = extractForms(queryResult);

  // will be turned into JSON by writeProcessedDataFilesToCache
  if (forms) {
    return forms.map(form => normalizeForm(form, logger));
  }

  logger(`Malformed result query: ${queryResult}`);
  return [];
};

module.exports.postProcessDigitalForm = postProcessDigitalForm;
