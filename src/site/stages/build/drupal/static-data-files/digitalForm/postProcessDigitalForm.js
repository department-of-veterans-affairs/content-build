const extractForms = resultObject => resultObject.data.nodeQuery.entities;
const formatSubTitle = formNumber => `VA Form ${formNumber}`;

const normalizeForm = form => {
  return {
    id: form.nid,
    title: form.entityLabel,
    subTitle: formatSubTitle(form.fieldVaFormNumber),
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
