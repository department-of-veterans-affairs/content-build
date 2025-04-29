/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import date from '../../fragments/date.graphql';

describe('date fragment', () => {
  it('includes fieldDigitalFormLabel', () => {
    expect(date).to.have.string('fieldDigitalFormLabel');
  });

  it('includes fieldDigitalFormHintText', () => {
    expect(date).to.have.string('fieldDigitalFormHintText');
  });

  it('includes fieldDigitalFormRequired', () => {
    expect(date).to.have.string('fieldDigitalFormRequired');
  });

  it('includes fieldDigitalFormDateFormat', () => {
    expect(date).to.have.string('fieldDigitalFormDateFormat');
  });

  it('includes fieldListLoopSummaryCard', () => {
    expect(date).to.have.string('fieldListLoopSummaryCard');
  });
});
