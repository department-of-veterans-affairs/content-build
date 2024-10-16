const { logDrupal } = require('../../utilities-drupal');

const extractAdditionalFields = entity => {
  const { entityId } = entity.type.entity;

  switch (entityId) {
    case 'digital_form_address':
      return {
        militaryAddressCheckbox: entity.fieldMilitaryAddressCheckbox,
      };
    case 'digital_form_identification_info':
      return {
        includeServiceNumber: entity.fieldIncludeVeteranSService,
      };
    case 'digital_form_name_and_date_of_bi':
      return {
        includeDateOfBirth: entity.fieldIncludeDateOfBirth,
      };
    case 'digital_form_phone_and_email':
      return {
        includeEmail: entity.fieldIncludeEmail,
      };
    default:
      return {};
  }
};
const extractForms = resultObject => resultObject?.data?.nodeQuery?.entities;

const formatDate = dateString => {
  const removeLeadingZero = s => s.replace(/^0+/, '');
  const [year, month, day] = dateString.split('-');
  return `${removeLeadingZero(month)}/${removeLeadingZero(day)}/${year}`;
};

const normalizeChapter = ({ entity }) => {
  return {
    id: parseInt(entity.entityId, 10),
    chapterTitle: entity.fieldTitle,
    type: entity.type.entity.entityId,
    pageTitle: entity.type.entity.entityLabel.replace('Digital Form: ', ''),
    additionalFields: extractAdditionalFields(entity),
  };
};

const normalizeForm = (form, logger = logDrupal) => {
  try {
    return {
      cmsId: form.nid,
      formId: form.fieldVaFormNumber,
      title: form.entityLabel,
      ombInfo: {
        expDate: formatDate(form.fieldExpirationDate.value),
        ombNumber: form.fieldOmbNumber,
        resBurden: form.fieldRespondentBurden,
      },
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
