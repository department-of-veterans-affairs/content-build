const extractAdditionalFields = entity => {
  const additionalFields = {};

  if (entity.type.entity.entityId === 'digital_form_name_and_date_of_bi') {
    additionalFields.includeDateOfBirth = entity.fieldIncludeDateOfBirth;
  }

  return additionalFields;
};
const extractForms = resultObject => resultObject.data.nodeQuery.entities;

const normalizeChapter = ({ entity }) => {
  return {
    id: parseInt(entity.entityId, 10),
    chapterTitle: entity.fieldTitle,
    type: entity.type.entity.entityId,
    pageTitle: entity.type.entity.entityLabel,
    additionalFields: extractAdditionalFields(entity),
  };
};

const normalizeChapters = chapters =>
  chapters.map(chapter => normalizeChapter(chapter));

const normalizeForm = form => {
  return {
    cmsId: form.nid,
    formId: form.fieldVaFormNumber,
    title: form.entityLabel,
    ombNumber: form.fieldOmbNumber,
    chapters: normalizeChapters(form.fieldChapters),
  };
};

const postProcessDigitalForm = queryResult => {
  // queryResult was already parsed by graphQLApiClient
  const forms = extractForms(queryResult);

  // will be turned into JSON by writeProcessedDataFilesToCache
  return forms.map(normalizeForm);
};

module.exports.postProcessDigitalForm = postProcessDigitalForm;
