/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import { normalizeComponent } from '../../normalizers/components';

describe('normalizeComponent', () => {
  context('with a Text Input component', () => {
    const queryComponent = {
      entityId: '172737',
      type: {
        entity: {
          entityId: 'digital_form_text_input',
          entityLabel: 'Digital Form: Text Input Component',
        },
      },
      fieldDigitalFormLabel: 'My custom text input',
      fieldDigitalFormHintText: 'This is optional hint text',
      fieldDigitalFormRequired: true,
      fieldListLoopSummaryCard: true,
    };
    const normalizedComponent = normalizeComponent(queryComponent);

    it('has the correct fields', () => {
      expect(normalizedComponent.type).to.eq(
        queryComponent.type.entity.entityId,
      );
      expect(normalizedComponent.label).to.eq(
        queryComponent.fieldDigitalFormLabel,
      );
      expect(normalizedComponent.hint).to.eq(
        queryComponent.fieldDigitalFormHintText,
      );
      expect(normalizedComponent.required).to.eq(
        queryComponent.fieldDigitalFormRequired,
      );
      expect(normalizedComponent.summaryCard).to.eq(
        queryComponent.fieldListLoopSummaryCard,
      );
    });
  });

  context('with a Text Area component', () => {
    const queryComponent = {
      entityId: '172747',
      type: {
        entity: {
          entityId: 'digital_form_text_area',
          entityLabel: 'Digital Form: Text Area Component',
        },
      },
      fieldDigitalFormLabel: 'Custom text area',
      fieldDigitalFormHintText: null,
      fieldDigitalFormRequired: false,
    };
    const normalizedComponent = normalizeComponent(queryComponent);

    it('has the correct fields', () => {
      expect(normalizedComponent.type).to.eq(
        queryComponent.type.entity.entityId,
      );
      expect(normalizedComponent.label).to.eq(
        queryComponent.fieldDigitalFormLabel,
      );
      expect(normalizedComponent.hint).to.eq(
        queryComponent.fieldDigitalFormHintText,
      );
      expect(normalizedComponent.required).to.eq(
        queryComponent.fieldDigitalFormRequired,
      );
    });
  });

  context('with a Date component', () => {
    const queryComponent = {
      entityId: '172741',
      type: {
        entity: {
          entityId: 'digital_form_date_component',
          entityLabel: 'Digital Form: Date Component',
        },
      },
      fieldDigitalFormLabel: 'My custom date component',
      fieldDigitalFormHintText: null,
      fieldDigitalFormRequired: false,
      fieldDigitalFormDateFormat: 'month_year',
      fieldListLoopSummaryCard: false,
    };
    const normalizedComponent = normalizeComponent(queryComponent);

    it('has the correct fields', () => {
      expect(normalizedComponent.type).to.eq(
        queryComponent.type.entity.entityId,
      );
      expect(normalizedComponent.label).to.eq(
        queryComponent.fieldDigitalFormLabel,
      );
      expect(normalizedComponent.hint).to.eq(
        queryComponent.fieldDigitalFormHintText,
      );
      expect(normalizedComponent.required).to.eq(
        queryComponent.fieldDigitalFormRequired,
      );
      expect(normalizedComponent.summaryCard).to.eq(
        queryComponent.fieldListLoopSummaryCard,
      );
    });

    it('includes the date format', () => {
      expect(normalizedComponent.dateFormat).to.eq(
        queryComponent.fieldDigitalFormDateFormat,
      );
    });
  });

  context('with a Radio Button component', () => {
    const queryComponent = {
      entityId: '172742',
      type: {
        entity: {
          entityId: 'digital_form_radio_button',
          entityLabel: 'Digital Form: Radio Button Component',
        },
      },
      fieldDigitalFormLabel: 'Test radio component',
      fieldDigitalFormHintText: null,
      fieldDigitalFormRequired: false,
      fieldDfResponseOptions: [
        {
          entity: {
            entityId: '172743',
            type: {
              entity: {
                entityLabel: 'Digital Form: Response Option',
                entityId: 'digital_form_response_option',
              },
            },
            fieldDigitalFormLabel: 'My custom option',
            fieldDigitalFormDescription:
              'This option as optional description text.',
          },
        },
        {
          entity: {
            entityId: '172744',
            type: {
              entity: {
                entityLabel: 'Digital Form: Response Option',
                entityId: 'digital_form_response_option',
              },
            },
            fieldDigitalFormLabel: 'My second option',
            fieldDigitalFormDescription: null,
          },
        },
      ],
    };
    const normalizedComponent = normalizeComponent(queryComponent);

    it('has the correct fields', () => {
      expect(normalizedComponent.type).to.eq(
        queryComponent.type.entity.entityId,
      );
      expect(normalizedComponent.label).to.eq(
        queryComponent.fieldDigitalFormLabel,
      );
      expect(normalizedComponent.hint).to.eq(
        queryComponent.fieldDigitalFormHintText,
      );
      expect(normalizedComponent.required).to.eq(
        queryComponent.fieldDigitalFormRequired,
      );
    });

    it('includes response options', () => {
      expect(normalizedComponent.responseOptions.length).to.eq(
        queryComponent.fieldDfResponseOptions.length,
      );

      const normalizedOption = normalizedComponent.responseOptions[0];
      const queryOption = queryComponent.fieldDfResponseOptions[0].entity;

      expect(normalizedOption.id).to.eq(queryOption.entityId);
      expect(normalizedOption.label).to.eq(queryOption.fieldDigitalFormLabel);
      expect(normalizedOption.description).to.eq(
        queryOption.fieldDigitalFormDescription,
      );
    });
  });

  context('with a checkbox component', () => {
    const queryComponent = {
      entityId: '172746',
      type: {
        entity: {
          entityId: 'digital_form_checkbox',
          entityLabel: 'Digital Form: Checkbox Component',
        },
      },
      fieldDigitalFormLabel: 'My custom checkbox',
      fieldDigitalFormHintText: null,
      fieldDigitalFormRequired: false,
      fieldDfResponseOptions: [
        {
          entity: {
            entityId: '172745',
            type: {
              entity: {
                entityLabel: 'Digital Form: Response Option',
                entityId: 'digital_form_response_option',
              },
            },
            fieldDigitalFormLabel: 'I agree to all these things',
            fieldDigitalFormDescription: null,
          },
        },
      ],
    };
    const normalizedComponent = normalizeComponent(queryComponent);

    it('has the correct fields', () => {
      expect(normalizedComponent.type).to.eq(
        queryComponent.type.entity.entityId,
      );
      expect(normalizedComponent.label).to.eq(
        queryComponent.fieldDigitalFormLabel,
      );
      expect(normalizedComponent.hint).to.eq(
        queryComponent.fieldDigitalFormHintText,
      );
      expect(normalizedComponent.required).to.eq(
        queryComponent.fieldDigitalFormRequired,
      );
    });

    it('includes response options', () => {
      expect(normalizedComponent.responseOptions.length).to.eq(
        queryComponent.fieldDfResponseOptions.length,
      );

      const normalizedOption = normalizedComponent.responseOptions[0];
      const queryOption = queryComponent.fieldDfResponseOptions[0].entity;

      expect(normalizedOption.id).to.eq(queryOption.entityId);
      expect(normalizedOption.label).to.eq(queryOption.fieldDigitalFormLabel);
      expect(normalizedOption.description).to.eq(
        queryOption.fieldDigitalFormDescription,
      );
    });
  });
});
