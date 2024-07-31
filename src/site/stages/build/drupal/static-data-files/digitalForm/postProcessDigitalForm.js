const extractAdditionalFields = entity => {
  const additionalFields = {};

  if (entity.type.entity.entityId === 'digital_form_name_and_date_of_bi') {
    additionalFields.includeDateOfBirth = entity.fieldIncludeDateOfBirth;
  }

  return additionalFields;
};
const extractForms = resultObject => resultObject.data.nodeQuery.entities;
const formatSubTitle = formNumber => `VA Form ${formNumber}`;

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
    id: form.nid,
    title: form.entityLabel,
    subTitle: formatSubTitle(form.fieldVaFormNumber),
    ombNumber: form.fieldOmbNumber,
    chapters: normalizeChapters(form.fieldChapters),
  };
};

const normalizeForms = forms => forms.map(form => normalizeForm(form));

const postProcessDigitalForm = queryResult => {
  const resultObject = JSON.parse(queryResult);
  const forms = extractForms(resultObject);
  const normalizedForms = normalizeForms(forms);

  return JSON.stringify(normalizedForms);
};

module.exports.postProcessDigitalForm = postProcessDigitalForm;
