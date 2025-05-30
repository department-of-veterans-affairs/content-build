/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import queryResult from '../fixtures/queryResult.json';
import { normalizeChapter } from '../../normalizers/chapters';

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
    const queryEntity = queryChapter.entity;

    it('includes the correct step title', () => {
      expect(normalizedChapter.chapterTitle).to.eq(queryEntity.fieldTitle);
    });

    it('includes a normalized page', () => {
      expect(normalizedChapter.pages[0].id).to.eq(
        queryEntity.fieldDigitalFormPages[0].entity.entityId,
      );
    });
  });

  describe('List & Loop', () => {
    const queryChapter = queryForm.fieldChapters.find(
      chapter =>
        chapter.entity.type.entity.entityId === 'digital_form_list_loop',
    );
    const normalizedChapter = normalizeChapter(queryChapter);
    const queryEntity = queryChapter.entity;

    it('includes the correct fields', () => {
      expect(normalizedChapter.chapterTitle).to.eq(queryEntity.fieldTitle);
      expect(normalizedChapter.optional).to.eq(queryEntity.fieldOptional);
      expect(normalizedChapter.sectionIntro).to.eq(
        queryEntity.fieldSectionIntro,
      );
      expect(normalizedChapter.itemNameLabel).to.eq(
        queryEntity.fieldItemNameLabel,
      );
      expect(normalizedChapter.maxItems).to.eq(
        queryEntity.fieldListLoopMaxItems,
      );
      expect(normalizedChapter.nounSingular).to.eq(
        queryEntity.fieldListLoopNounSingular,
      );
      expect(normalizedChapter.nounPlural).to.eq(
        queryEntity.fieldListLoopNounPlural,
      );
    });

    it('includes a normalized page', () => {
      expect(normalizedChapter.pages[0].id).to.eq(
        queryEntity.fieldDigitalFormPages[0].entity.entityId,
      );
    });
  });
});
