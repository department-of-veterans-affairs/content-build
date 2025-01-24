const { logDrupal } = require('../../utilities-drupal');

const extractAdditionalFields = entity => {
  const { entityId } = entity.type.entity;

  switch (entityId) {
    case 'digital_form_address':
      return {
        militaryAddressCheckbox: entity.fieldMilitaryAddressCheckbox,
      };
    case 'digital_form_list_loop':
      return {
        optional: entity.fieldOptional,
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

const stripPrefix = label => label.replace('Digital Form: ', '');

const normalizeChapter = ({ entity }) => {
  const type = entity.type.entity.entityId;
  const initialChapter = {
    id: parseInt(entity.entityId, 10),
    type,
  };

  if (type === 'digital_form_your_personal_info') {
    const identificationInformation =
      entity.fieldIdentificationInformation.entity;
    const nameAndDateOfBirth = entity.fieldNameAndDateOfBirth.entity;

    return {
      ...initialChapter,
      chapterTitle: stripPrefix(entity.type.entity.entityLabel),
      pages: [
        {
          pageTitle: nameAndDateOfBirth.fieldTitle,
          includeDateOfBirth: nameAndDateOfBirth.fieldIncludeDateOfBirth,
        },
        {
          pageTitle: identificationInformation.fieldTitle,
          includeServiceNumber:
            identificationInformation.fieldIncludeVeteranSService,
        },
      ],
    };
  }

  return {
    ...initialChapter,
    additionalFields: extractAdditionalFields(entity),
    chapterTitle: entity.fieldTitle,
    pageTitle: stripPrefix(entity.type.entity.entityLabel),
  };
};

const normalizeForm = (form, logger = logDrupal) => {
  try {
    return {
      cmsId: form.nid,
      formId: form.fieldVaFormNumber,
      moderationState: form.moderationState,
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
