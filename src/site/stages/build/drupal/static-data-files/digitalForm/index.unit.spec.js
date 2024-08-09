/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import { query, postProcess } from './index';

describe('digitalForm', () => {
  describe('query', () => {
    it('returns digital_form entities', () => {
      expect(query).to.have.string('digital_form');
    });
    it('imports the digitalForm fragment', () => {
      expect(query).to.have.string('fragment digitalForm');
      expect(query).to.have.string('... digitalForm');
    });
  });

  describe('postProcess', () => {
    it('imports postProcessDigitalForm', () => {
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
            ],
          },
        },
      };

      expect(() => postProcess(queryResult)).to.not.throw();
    });
  });
});
