const extractForms = resultObject => resultObject.data.nodeQuery.entities;

const normalizeForm = form => {
  return {
    id: form.nid,
    title: form.entityLabel,
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
