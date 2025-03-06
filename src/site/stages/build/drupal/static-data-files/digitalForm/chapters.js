const { stripPrefix } = require('./utils');

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

const initialChapter = entity => ({
  id: parseInt(entity.entityId, 10),
  type: entity.type.entity.entityId,
});

const customStepChapter = entity => ({
  ...initialChapter(entity),
  chapterTitle: entity.fieldTitle,
  pages: entity.fieldDigitalFormPages.map(({ entity: pageEntity }) => ({
    bodyText: pageEntity.fieldDigitalFormBodyText,
    components: pageEntity.fieldDigitalFormComponents.map(
      ({ entity: componentEntity }) => ({
        hint: componentEntity.fieldDigitalFormHintText,
        id: componentEntity.entityId,
        label: componentEntity.fieldDigitalFormLabel,
        required: componentEntity.fieldDigitalFormRequired,
        type: componentEntity.type.entity.entityId,
      }),
    ),
    id: pageEntity.entityId,
    pageTitle: pageEntity.fieldTitle,
  })),
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
