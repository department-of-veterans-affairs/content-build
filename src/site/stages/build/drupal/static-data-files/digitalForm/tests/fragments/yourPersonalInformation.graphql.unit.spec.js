/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import yourPersonalInformation from '../../fragments/yourPersonalInformation.graphql';

describe('yourPersonalInformation fragment', () => {
  ['identificationInformation', 'nameAndDateOfBirth'].forEach(fragment => {
    it(`imports the ${fragment} fragment`, () => {
      expect(yourPersonalInformation).to.have.string(`fragment ${fragment}`);
      expect(yourPersonalInformation).to.have.string(`...${fragment}`);
    });
  });
});
