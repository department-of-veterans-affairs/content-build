/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import sinon from 'sinon';
import drupalUtils from '../../utilities-drupal';

const { postProcessDigitalForm } = require('./postProcessDigitalForm');

describe('postProcessDigitalForm', () => {
  context('with a well-formed query result', () => {
    const queryResult = {
      data: {
        nodeQuery: {
          entities: [
            {
              nid: 71002,
              entityLabel: 'Form with One Step',
              fieldVaFormNumber: '11111',
              fieldOmbNumber: '1111-1111',
              fieldChapters: [
                {
                  entity: {
                    entityId: '157904',
                    type: {
                      entity: {
                        entityId: 'digital_form_name_and_date_of_bi',
                        entityLabel: 'Name and Date of Birth',
                      },
                    },
                    fieldTitle: 'The Only Step',
                    fieldIncludeDateOfBirth: true,
                  },
                },
              ],
            },
            {
              nid: 71004,
              entityLabel: 'Form with Two Steps',
              fieldVaFormNumber: '222222',
              fieldOmbNumber: '1212-1212',
              fieldChapters: [
                {
                  entity: {
                    entityId: '157906',
                    type: {
                      entity: {
                        entityId: 'digital_form_name_and_date_of_bi',
                        entityLabel: 'Name and Date of Birth',
                      },
                    },
                    fieldTitle: 'First Step',
                    fieldIncludeDateOfBirth: true,
                  },
                },
                {
                  entity: {
                    entityId: '157907',
                    type: {
                      entity: {
                        entityId: 'digital_form_name_and_date_of_bi',
                        entityLabel: 'Name and Date of Birth',
                      },
                    },
                    fieldTitle: 'Second Step',
                    fieldIncludeDateOfBirth: false,
                  },
                },
              ],
            },
          ],
        },
      },
    };
    let processedResult;

    beforeEach(() => {
      processedResult = postProcessDigitalForm(queryResult);
    });

    it('returns a normalized JSON object', () => {
      const testForm = processedResult[1];
      const testChapter = testForm.chapters[1];

      expect(processedResult.length).to.eq(2);
      expect(testForm.cmsId).to.eq(71004);
      expect(testForm.formId).to.eq('222222');
      expect(testForm.title).to.eq('Form with Two Steps');
      expect(testForm.ombNumber).to.eq('1212-1212');
      expect(testForm.chapters.length).to.eq(2);
      expect(testChapter.id).to.eq(157907);
      expect(testChapter.chapterTitle).to.eq('Second Step');
      expect(testChapter.type).to.eq('digital_form_name_and_date_of_bi');
      expect(testChapter.pageTitle).to.eq('Name and Date of Birth');
      expect(Object.keys(testChapter.additionalFields).length).to.eq(1);
    });

    context('with a Name and Date of Birth step', () => {
      it('includes the appropriate fields', () => {
        const { additionalFields } = processedResult[1].chapters[1];

        expect(additionalFields.includeDateOfBirth).to.eq(false);
      });
    });
  });

  context('with a malformed query result', () => {
    let queryResult;
    let processedResult;

    beforeEach(() => {
      sinon.stub(drupalUtils, 'logDrupal');
    });

    afterEach(() => {
      drupalUtils.logDrupal.restore();
    });

    context('when the entire query is bad', () => {
      beforeEach(() => {
        queryResult = {
          wrongKey: 'oops! bad data!',
        };
        processedResult = postProcessDigitalForm(
          queryResult,
          drupalUtils.logDrupal,
        );
      });

      it('logs the error', () => {
        expect(drupalUtils.logDrupal.calledOnce).to.eq(true);
      });

      it('returns an empty array', () => {
        expect(processedResult.length).to.eq(0);
      });
    });

    context('when only one form is malformed', () => {
      beforeEach(() => {
        queryResult = {
          data: {
            nodeQuery: {
              entities: [
                {
                  nid: 71002,
                  entityLabel: 'Form with One Step',
                  fieldVaFormNumber: '11111',
                  fieldOmbNumber: '1111-1111',
                  fieldChapters: [
                    {
                      entity: {
                        entityId: '157904',
                        type: {
                          entity: {
                            entityId: 'digital_form_name_and_date_of_bi',
                            entityLabel: 'Name and Date of Birth',
                          },
                        },
                        fieldTitle: 'The Only Step',
                        fieldIncludeDateOfBirth: true,
                      },
                    },
                  ],
                },
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
        processedResult = postProcessDigitalForm(
          queryResult,
          drupalUtils.logDrupal,
        );
      });

      it('logs the error', () => {
        expect(drupalUtils.logDrupal.calledOnce).to.eq(true);
      });

      it('returns the other forms', () => {
        expect(processedResult[0].cmsId).to.eq(71002);
      });
    });
  });
});
