const { logDrupal } = require('../../utilities-drupal');
const { normalizeChapter } = require('./chapters');
const { formatDate } = require('./utils');

const extractForms = resultObject => resultObject?.data?.nodeQuery?.entities;

const normalizeForm = (form, logger = logDrupal) => {
  try {
    return {
      cmsId: form.nid,
      formId: form.fieldVaFormNumber,
      introParagraph: form.fieldIntroText,
      moderationState: form.moderationState,
      title: form.entityLabel,
      plainLanguageHeader: form.fieldPlainLanguageTitle,
      ombInfo: {
        expDate: formatDate(form.fieldExpirationDate.value),
        ombNumber: form.fieldOmbNumber,
        resBurden: form.fieldRespondentBurden,
      },
      whatToKnowBullets: form.fieldDigitalFormWhatToKnow,
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
