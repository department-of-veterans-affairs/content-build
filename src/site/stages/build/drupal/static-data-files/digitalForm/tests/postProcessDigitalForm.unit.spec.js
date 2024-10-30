/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import sinon from 'sinon';
import queryResult from './fixtures/queryResult.json';

const { postProcessDigitalForm } = require('../postProcessDigitalForm');

describe('postProcessDigitalForm', () => {
  const [oneStepEntity, manyStepEntity] = queryResult.data.nodeQuery.entities;

  context('with a well-formed query result', () => {
    let testForm;

    beforeEach(() => {
      [, testForm] = postProcessDigitalForm(queryResult);
    });

    it('returns a normalized JSON object', () => {
      const queryChapter = manyStepEntity.fieldChapters[1].entity;
      const testChapter = testForm.chapters[1];

      expect(testForm.cmsId).to.eq(71004);
      expect(testForm.formId).to.eq('222222');
      expect(testForm.title).to.eq(manyStepEntity.entityLabel);
      expect(testForm.chapters.length).to.eq(
        manyStepEntity.fieldChapters.length,
      );
      expect(testChapter.id).to.eq(Number(queryChapter.entityId));
      expect(testChapter.chapterTitle).to.eq(queryChapter.fieldTitle);
      expect(testChapter.type).to.eq(queryChapter.type.entity.entityId);
      expect(Object.keys(testChapter.additionalFields).length).to.eq(1);
    });

    it('includes an OMB info object', () => {
      const { ombInfo } = testForm;
      // towStepEntity.fieldExpirationDate is 2027-01-29
      const formattedDate = '1/29/2027';

      expect(ombInfo.ombNumber).to.eq(manyStepEntity.fieldOmbNumber);
      expect(ombInfo.expDate).to.eq(formattedDate);
      expect(ombInfo.resBurden).to.eq(manyStepEntity.fieldRespondentBurden);
    });

    it('removes the "Digital Form" prefix', () => {
      const [, testChapter] = testForm.chapters;

      expect(testChapter.pageTitle).to.eq('Address');
    });

    describe('additionalFields', () => {
      [
        ['digital_form_address', 'militaryAddressCheckbox', false],
        // ['digital_form_identification_info', 'includeServiceNumber', true],
        // ['digital_form_name_and_date_of_bi', 'includeDateOfBirth', true],
        ['digital_form_phone_and_email', 'includeEmail', false],
      ].forEach(([type, additionalField, value]) => {
        context(`with a ${type} step`, () => {
          it('includes the appropriate additional fields', () => {
            const { additionalFields } = testForm.chapters.find(
              chapter => chapter.type === type,
            );

            expect(additionalFields[additionalField]).to.eq(value);
          });
        });
      });
    });

    describe('Your personal information', () => {
      let ypiChapter;
      const queryYpi = manyStepEntity.fieldChapters[0].entity;

      beforeEach(() => {
        ypiChapter = testForm.chapters.find(
          chapter => chapter.type === 'digital_form_your_personal_info',
        );
      });

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
  });

  context('with a malformed query result', () => {
    let badQueryResult;
    let processedResult;
    let logger;

    beforeEach(() => {
      logger = sinon.spy();
    });

    context('when the entire query is bad', () => {
      beforeEach(() => {
        badQueryResult = {
          wrongKey: 'oops! bad data!',
        };
        processedResult = postProcessDigitalForm(badQueryResult, logger);
      });

      it('logs the error', () => {
        expect(logger.calledOnce).to.eq(true);
      });

      it('returns an empty array', () => {
        expect(processedResult.length).to.eq(0);
      });
    });

    context('when only one form is malformed', () => {
      beforeEach(() => {
        badQueryResult = {
          data: {
            nodeQuery: {
              entities: [
                oneStepEntity,
                {
                  nid: '71004',
                  entityLabel: 'This form has problems',
                  fieldVaFormNumber: 222222,
                  fieldChapters: 'no chapters',
                },
              ],
            },
          },
        };
        processedResult = postProcessDigitalForm(badQueryResult, logger);
      });

      it('logs the error', () => {
        expect(logger.calledOnce).to.eq(true);
      });

      it('returns the other forms', () => {
        expect(processedResult[0].cmsId).to.eq(71002);
      });
    });
  });
});
