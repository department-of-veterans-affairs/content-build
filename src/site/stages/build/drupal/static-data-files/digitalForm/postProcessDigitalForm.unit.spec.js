/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';

const { postProcessDigitalForm } = require('./postProcessDigitalForm');

describe('postProcessDigitalForm', () => {
  it('returns queryResult with no changes', () => {
    const queryResult = { data: { form: {} } };
    expect(postProcessDigitalForm(queryResult)).to.eq(queryResult);
  });
});
