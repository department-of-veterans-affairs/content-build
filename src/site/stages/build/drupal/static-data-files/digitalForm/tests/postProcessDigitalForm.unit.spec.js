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
      expect(testForm.plainLanguageHeader).to.eq(
        manyStepEntity.fieldPlainLanguageTitle,
      );
      expect(testForm.moderationState).to.eq(manyStepEntity.moderationState);
      expect(testForm.chapters.length).to.eq(
        manyStepEntity.fieldChapters.length,
      );
      expect(testChapter.id).to.eq(Number(queryChapter.entityId));
    });

    it('includes Introduction Page fields', () => {
      expect(testForm.introParagraph).to.eq(manyStepEntity.fieldIntroText);
      expect(testForm.whatToKnowBullets.length).to.eq(3);
      expect(testForm.whatToKnowBullets[1]).to.eq(
        manyStepEntity.fieldDigitalFormWhatToKnow[1],
      );
    });

    it('includes an OMB info object', () => {
      const { ombInfo } = testForm;
      // towStepEntity.fieldExpirationDate is 2027-01-29
      const formattedDate = '1/29/2027';

      expect(ombInfo.ombNumber).to.eq(manyStepEntity.fieldOmbNumber);
      expect(ombInfo.expDate).to.eq(formattedDate);
      expect(ombInfo.resBurden).to.eq(manyStepEntity.fieldRespondentBurden);
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
