/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import { expect } from 'chai';
import { getByTestId } from '@testing-library/dom';
import { parseFixture, renderHTML } from '../../../tests/support';

describe('VBA accordions for Service Locations', () => {
  const fixture = parseFixture(
    'src/site/paragraphs/tests/vamc/template/fixtures/health_care_local_facility.json',
  );
  const processedFixture = {
    fieldAddress: fixture.fieldAddress,
    fieldPhoneNumber: fixture.fieldPhoneNumber,
    fieldOfficeHours: fixture.fieldOfficeHours,
  };
  it('should render render contents of COVID service', async () => {
    // has onlineScheduling
    // has fieldOtherPhoneNumbers
    // should show Appointments header
    // should show main number
    const covidVaccinesEntity =
      fixture.fieldLocalHealthCareService[0].entity.fieldServiceLocation[0]
        .entity;
    const covidHTML = await renderHTML(
      'src/site/paragraphs/service_location.drupal.liquid',
      {
        ...processedFixture,
        single: covidVaccinesEntity,
      },
    );
    expect(getByTestId(covidHTML, 'service-location-field-office-visits')).to
      .exist;
    expect(getByTestId(covidHTML, 'service-location-appoinments-header')).to
      .exist;
    expect(getByTestId(covidHTML, 'service-location-main-facility-phone')).to
      .exist;
    expect(getByTestId(covidHTML, 'service-location-show-other-phone-numbers'))
      .to.exist;
    expect(getByTestId(covidHTML, 'service-location-field-hours')).to.exist;
    expect(getByTestId(covidHTML, 'service-location-custom-text')).to.exist;
  });
  it('should render render contents of Anesthesia service', async () => {
    // No onlineScheduling
    // remove text
    // no clinic name
    // should show Appointments header (but because they say yes_with_appoinment)
    // should show main number
    const anesthesiaEntity =
      fixture.fieldLocalHealthCareService[3].entity.fieldServiceLocation[0]
        .entity;
    const anesthesiaHTML = await renderHTML(
      'src/site/paragraphs/service_location.drupal.liquid',
      {
        ...processedFixture,
        single: anesthesiaEntity,
      },
    );
    expect(getByTestId(anesthesiaHTML, 'service-location-field-office-visits'))
      .to.exist;
    expect(getByTestId(anesthesiaHTML, 'service-location-appoinments-header'))
      .to.exist; // this one is odd - since it says yes_with_appoinment
    expect(getByTestId(anesthesiaHTML, 'service-location-main-facility-phone'))
      .to.exist;
    // other expects will cause to fail
  });
  it('should render render contents of Gynecology service', async () => {
    // Yes onlineScheduling
    // default text
    // Has clinic name
    // should show Appointments header
    // should show icon for office visits
    // should NOT show main number
    // should show other phone numbers
    const gynecologyEntity =
      fixture.fieldLocalHealthCareService[4].entity.fieldServiceLocation[0]
        .entity;
    const gynecologyHTML = await renderHTML(
      'src/site/paragraphs/service_location.drupal.liquid',
      {
        ...processedFixture,
        single: gynecologyEntity,
      },
    );
    expect(getByTestId(gynecologyHTML, 'service-location-field-office-visits'))
      .to.exist;
    expect(getByTestId(gynecologyHTML, 'service-location-appoinments-header'))
      .to.exist;
    expect(
      getByTestId(gynecologyHTML, 'service-location-show-other-phone-numbers'),
    ).to.exist;
    expect(getByTestId(gynecologyHTML, 'service-location-field-hours')).to
      .exist;
    expect(getByTestId(gynecologyHTML, 'service-location-default-text')).to
      .exist;
  });
});
