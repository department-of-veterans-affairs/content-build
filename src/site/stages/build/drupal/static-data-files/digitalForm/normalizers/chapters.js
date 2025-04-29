const { stripPrefix } = require('../utils');
const { normalizePages } = require('./pages');

const extractAdditionalFields = entity => {
  const { entityId } = entity.type.entity;

  switch (entityId) {
    case 'digital_form_address':
      return {
        militaryAddressCheckbox: entity.fieldMilitaryAddressCheckbox,
      };
    case 'digital_form_phone_and_email':
      return {
        includeEmail: entity.fieldIncludeEmail,
      };
    default:
      return {};
  }
};

const initialChapter = entity => ({
  id: parseInt(entity.entityId, 10),
  type: entity.type.entity.entityId,
});

const customStepChapter = entity => ({
  ...initialChapter(entity),
  chapterTitle: entity.fieldTitle,
  pages: normalizePages(entity.fieldDigitalFormPages),
});

const listLoopChapter = entity => ({
  ...initialChapter(entity),
  chapterTitle: entity.fieldTitle,
  itemNameLabel: entity.fieldItemNameLabel,
  maxItems: entity.fieldListLoopMaxItems,
  nounPlural: entity.fieldListLoopNounPlural,
  nounSingular: entity.fieldListLoopNounSingular,
  optional: entity.fieldOptional,
  pages: normalizePages(entity.fieldDigitalFormPages),
  sectionIntro: entity.fieldSectionIntro,
});

const ypiChapter = entity => {
  const identificationInformation =
    entity.fieldIdentificationInformation.entity;
  const nameAndDateOfBirth = entity.fieldNameAndDateOfBirth.entity;

  return {
    ...initialChapter(entity),
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
};

const normalizeChapter = ({ entity }) => {
  const type = entity.type.entity.entityId;

  switch (type) {
    case 'digital_form_your_personal_info': {
      return ypiChapter(entity);
    }
    case 'digital_form_custom_step':
      return customStepChapter(entity);
    case 'digital_form_list_loop':
      return listLoopChapter(entity);
    default:
      return {
        ...initialChapter(entity),
        additionalFields: extractAdditionalFields(entity),
        chapterTitle: entity.fieldTitle,
        pageTitle: stripPrefix(entity.type.entity.entityLabel),
      };
  }
};

module.exports = { normalizeChapter };
