const normalizeComponent = entity => {
  const type = entity.type.entity.entityId;

  const defaultComponent = {
    hint: entity.fieldDigitalFormHintText,
    id: entity.entityId,
    label: entity.fieldDigitalFormLabel,
    required: entity.fieldDigitalFormRequired,
    type,
  };

  switch (type) {
    case 'digital_form_date_component':
      return {
        ...defaultComponent,
        dateFormat: entity.fieldDigitalFormDateFormat,
      };
    case 'digital_form_radio_button':
    case 'digital_form_checkbox':
      return {
        ...defaultComponent,
        responseOptions: entity.fieldDfResponseOptions.map(
          ({ entity: optionEntity }) => ({
            id: optionEntity.entityId,
            label: optionEntity.fieldDigitalFormLabel,
            description: optionEntity.fieldDigitalFormDescription,
          }),
        ),
      };
    default:
      return defaultComponent;
  }
};

module.exports = { normalizeComponent };
