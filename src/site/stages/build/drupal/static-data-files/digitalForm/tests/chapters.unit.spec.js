/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import queryResult from './fixtures/queryResult.json';
import { normalizeChapter, normalizeComponent } from '../chapters';

describe('digitalForm chapters', () => {
  const queryForm = queryResult.data.nodeQuery.entities[1];

  it('returns a normalized chapter object', () => {
    const queryChapter = queryForm.fieldChapters[1];
    const queryEntity = queryChapter.entity;

    const testChapter = normalizeChapter(queryChapter);

    expect(testChapter.id).to.eq(Number(queryEntity.entityId));
    expect(testChapter.chapterTitle).to.eq(queryEntity.fieldTitle);
    expect(testChapter.type).to.eq(queryEntity.type.entity.entityId);
    expect(Object.keys(testChapter.additionalFields).length).to.eq(1);
  });

  it('removes the "Digital Form" prefix', () => {
    const queryChapter = queryForm.fieldChapters[1];
    const testChapter = normalizeChapter(queryChapter);

    expect(testChapter.pageTitle).to.eq('Address');
  });

  describe('additionalFields', () => {
    [
      ['digital_form_address', 'militaryAddressCheckbox', false],
      ['digital_form_list_loop', 'optional', false],
      ['digital_form_phone_and_email', 'includeEmail', false],
    ].forEach(([type, additionalField, value]) => {
      context(`with a ${type} step`, () => {
        it('includes the appropriate additional fields', () => {
          const queryChapter = queryForm.fieldChapters.find(
            chapter => chapter.entity.type.entity.entityId === type,
          );

          const { additionalFields } = normalizeChapter(queryChapter);

          expect(additionalFields[additionalField]).to.eq(value);
        });
      });
    });
  });

  describe('Your personal information', () => {
    const queryChapter = queryForm.fieldChapters[0];
    const queryYpi = queryChapter.entity;
    const ypiChapter = normalizeChapter(queryChapter);

    it('includes the correct chapter title', () => {
      expect(ypiChapter.chapterTitle).to.eq('Your personal information');
    });

    it('includes a Name and Date of Birth page', () => {
      const nameAndDateOfBirth = ypiChapter.pages[0];
      const queryNdob = queryYpi.fieldNameAndDateOfBirth.entity;

      expect(nameAndDateOfBirth.pageTitle).to.eq(queryNdob.fieldTitle);
      expect(nameAndDateOfBirth.includeDateOfBirth).to.eq(
        queryNdob.fieldIncludeDateOfBirth,
      );
    });

    it('includes an Identification information page', () => {
      const identificationInformation = ypiChapter.pages[1];
      const queryIi = queryYpi.fieldIdentificationInformation.entity;

      expect(identificationInformation.pageTitle).to.eq(queryIi.fieldTitle);
      expect(identificationInformation.includeServiceNumber).to.eq(
        queryIi.fieldIncludeVeteranSService,
      );
    });
  });

  describe('Custom Step', () => {
    const queryChapter = queryForm.fieldChapters.find(
      chapter =>
        chapter.entity.type.entity.entityId === 'digital_form_custom_step',
    );
    const normalizedChapter = normalizeChapter(queryChapter);
    const normalizedPage = normalizedChapter.pages[0];
    const queryEntity = queryChapter.entity;
    const queryPage = queryEntity.fieldDigitalFormPages[0].entity;

    it('includes the correct step title', () => {
      expect(normalizedChapter.chapterTitle).to.eq(queryEntity.fieldTitle);
    });

    it('includes the correct number of pages', () => {
      expect(normalizedChapter.pages.length).to.eq(
        queryEntity.fieldDigitalFormPages.length,
      );
    });

    describe('Custom Step page', () => {
      it('includes the entity ID', () => {
        expect(normalizedPage.id).to.eq(queryPage.entityId);
      });

      it('includes the correct page title', () => {
        expect(normalizedPage.pageTitle).to.eq(queryPage.fieldTitle);
      });

      it('includes the correct body text', () => {
        expect(normalizedPage.bodyText).to.eq(
          queryPage.fieldDigitalFormBodyText,
        );
      });

      it('include the correct number of components', () => {
        expect(normalizedPage.components.length).to.eq(
          queryPage.fieldDigitalFormComponents.length,
        );
      });

      it('includes an ID for components', () => {
        expect(normalizedPage.components[0].id).to.eq(
          queryPage.fieldDigitalFormComponents[0].entity.entityId,
        );
      });
    });

    describe('normalizeComponent', () => {
      context('with a Text Input component', () => {
        const queryComponent = queryPage.fieldDigitalFormComponents[0].entity;
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

        it('includes the date format', () => {
          expect(normalizedComponent.dateFormat).to.eq(
            queryComponent.fieldDigitalFormDateFormat,
          );
        });
      });
    });
  });
});
