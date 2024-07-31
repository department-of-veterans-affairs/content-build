/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';

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

  beforeEach(() => {
    processedResult = postProcessDigitalForm(queryResult);
  });

  it('returns a normalized JSON object', () => {
    const testForm = processedResult[1];
    const testChapter = testForm.chapters[1];

    expect(processedResult.length).to.eq(2);
    expect(testForm.id).to.eq(71004);
    expect(testForm.title).to.eq('Form with Two Steps');
    expect(testForm.subTitle).to.eq('VA Form 222222');
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
