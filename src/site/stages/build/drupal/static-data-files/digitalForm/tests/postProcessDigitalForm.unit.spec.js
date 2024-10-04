/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import sinon from 'sinon';
import queryResult from './fixtures/queryResult.json';

const { postProcessDigitalForm } = require('../postProcessDigitalForm');

describe('postProcessDigitalForm', () => {
  const [oneStepEntity, twoStepEntity] = queryResult.data.nodeQuery.entities;

  context('with a well-formed query result', () => {
    let testForm;

    beforeEach(() => {
      [, testForm] = postProcessDigitalForm(queryResult);
    });

    it('returns a normalized JSON object', () => {
      const testChapter = testForm.chapters[1];

      expect(testForm.cmsId).to.eq(71004);
      expect(testForm.formId).to.eq('222222');
      expect(testForm.title).to.eq('Form with Two Steps');
      expect(testForm.chapters.length).to.eq(
        twoStepEntity.fieldChapters.length,
      );
      expect(testChapter.id).to.eq(157907);
      expect(testChapter.chapterTitle).to.eq('Second Step');
      expect(testChapter.type).to.eq('digital_form_name_and_date_of_bi');
      expect(Object.keys(testChapter.additionalFields).length).to.eq(1);
    });

    it('includes an OMB info object', () => {
      const { ombInfo } = testForm;
      // towStepEntity.fieldExpirationDate is 2027-01-29
      const formattedDate = '1/29/2027';

      expect(ombInfo.ombNumber).to.eq(twoStepEntity.fieldOmbNumber);
      expect(ombInfo.expDate).to.eq(formattedDate);
      expect(ombInfo.resBurden).to.eq(twoStepEntity.fieldRespondentBurden);
    });

    it('removes the "Digital Form" prefix', () => {
      const [, testChapter] = testForm.chapters;

      expect(testChapter.pageTitle).to.eq('Name and Date of Birth');
    });

    describe('additionalFields', () => {
      let additionalFields;

      context('with a Name and Date of Birth step', () => {
        it('includes the appropriate fields', () => {
          additionalFields = testForm.chapters[1].additionalFields;

          expect(additionalFields.includeDateOfBirth).to.eq(false);
        });
      });

      context('with an Address step', () => {
        it('includes appropriate fields', () => {
          [{ additionalFields }] = testForm.chapters.filter(
            chapter => chapter.type === 'digital_form_address',
          );

          expect(additionalFields.militaryAddressCheckbox).to.eq(false);
        });
      });

      context('with an Identification Information step', () => {
        beforeEach(() => {
          [{ additionalFields }] = testForm.chapters.filter(
            chapter => chapter.type === 'digital_form_identification_info',
          );
        });

        it('includes appropriate fields', () => {
          expect(additionalFields.includeServiceNumber).to.eq(true);
        });

        it('does not include inappropriate fields', () => {
          expect(additionalFields.includeDateOfBirth).to.eq(undefined);
        });
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
