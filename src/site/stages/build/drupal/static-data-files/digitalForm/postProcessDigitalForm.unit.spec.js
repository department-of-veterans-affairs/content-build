/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';

const { postProcessDigitalForm } = require('./postProcessDigitalForm');

describe('postProcessDigitalForm', () => {
  const queryResult = `
{
  "data": {
    "nodeQuery": {
      "entities": [
        {
          "nid": 71002,
          "entityLabel": "Form with One Step",
          "fieldVaFormNumber": "11111",
          "fieldOmbNumber": "1111-1111",
          "fieldChapters": [
            {
              "entity": {
                "entityId": "157904",
                "type": {
                  "entity": {
                    "entityId": "digital_form_name_and_date_of_bi",
                    "entityLabel": "Name and Date of Birth"
                  }
                },
                "fieldTitle": "The Only Step",
                "fieldIncludeDateOfBirth": true
              }
            }
          ]
        },
        {
          "nid": 71004,
          "entityLabel": "Form with Two Steps",
          "fieldVaFormNumber": "222222",
          "fieldOmbNumber": "1212-1212",
          "fieldChapters": [
            {
              "entity": {
                "entityId": "157906",
                "type": {
                  "entity": {
                    "entityId": "digital_form_name_and_date_of_bi",
                    "entityLabel": "Name and Date of Birth"
                  }
                },
                "fieldTitle": "First Step",
                "fieldIncludeDateOfBirth": true
              }
            },
            {
              "entity": {
                "entityId": "157907",
                "type": {
                  "entity": {
                    "entityId": "digital_form_name_and_date_of_bi",
                    "entityLabel": "Name and Date of Birth"
                  }
                },
                "fieldTitle": "Second Step",
                "fieldIncludeDateOfBirth": false
              }
            }
          ]
        }
      ]
    }
  }
}
    `;

  let parsedResult;

  beforeEach(() => {
    const processedResult = postProcessDigitalForm(queryResult);
    parsedResult = JSON.parse(processedResult);
  });

  it('returns a normalized JSON object', () => {
    const testForm = parsedResult[1];

    expect(parsedResult.length).to.eq(2);
    expect(testForm.id).to.eq(71004);
    expect(testForm.title).to.eq('Form with Two Steps');
    expect(testForm.subTitle).to.eq('VA Form 222222');
    expect(testForm.ombNumber).to.eq('1212-1212');
  });
});
