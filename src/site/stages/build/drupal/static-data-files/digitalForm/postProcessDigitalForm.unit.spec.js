/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import sinon from 'sinon';
import drupalUtils from '../../utilities-drupal';

const { postProcessDigitalForm } = require('./postProcessDigitalForm');

describe('postProcessDigitalForm', () => {
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
  let testForm;

  beforeEach(() => {
    processedResult = postProcessDigitalForm(queryResult);
    [, testForm] = processedResult;
  });

  it('returns a normalized JSON object', () => {
    expect(processedResult.length).to.eq(2);
    expect(testForm.id).to.eq(71004);
    expect(testForm.ombNumber).to.eq('1212-1212');
    expect(testForm.formConfig).to.not.eq(undefined);
  });

  describe('formConfig', () => {
    let formConfig;

    beforeEach(() => {
      formConfig = testForm.formConfig;
    });

    it('includes a properly formatted Form Config object', () => {
      expect(formConfig.title).to.eq('Form with Two Steps');
      expect(formConfig.formId).to.eq('222222');
      expect(formConfig.subTitle).to.eq('VA Form 222222');
      expect(formConfig.chapters.length).to.eq(2);
    });

    it('properly formats each chapter', () => {
      const testChapter = formConfig.chapters[1]['157907'];
      const testPage = testChapter.pages['157907'];

      expect(Object.keys(formConfig.chapters[1]).length).to.eq(1);

      expect(testChapter).to.not.eq(undefined);
      expect(testChapter.title).to.eq('Second Step');
      expect(Object.keys(testChapter.pages).length).to.eq(1);
      expect(testPage.title).to.eq('Name and Date of Birth');
      expect(testPage.path).to.eq('157907');
    });

    // context('with a Name and Date of Birth step', () => {
    //   it('includes the appropriate fields', () => {
    //     const { additionalFields } = formConfig.chapters[1];

    //     expect(additionalFields.includeDateOfBirth).to.eq(false);
    //   });
    // });
  });
});
