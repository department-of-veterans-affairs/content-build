/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import { expect } from 'chai';
import { queryAllByTestId } from '@testing-library/dom';
import { parseFixture, renderHTML } from '../../../tests/support';

describe('Vet Center Locations Operating Status', () => {
  const fixture = parseFixture(
    'src/site/layouts/tests/vet_center/template/fixtures/operating_statuses.json',
  );

  it('should not render an operating status for mobile vet centers', async () => {
    const rendered = await renderHTML(
      'src/site/layouts/vet_center_locations_list.drupal.liquid',
      fixture,
    );
    const operatingStatus1 = queryAllByTestId(
      rendered,
      'operating-status-vc_0827MVC',
    );
    expect(operatingStatus1).to.be.empty;
    const operatingStatus2 = queryAllByTestId(
      rendered,
      'operating-status-vc_0868MVC',
    );
    expect(operatingStatus2).to.be.empty;
  });

  it('should not render a normal operating status for satellite', async () => {
    const rendered = await renderHTML(
      'src/site/layouts/vet_center_locations_list.drupal.liquid',
      fixture,
    );
    const operatingStatus = queryAllByTestId(
      rendered,
      'operating-status-vc_5141OS',
    );
    expect(operatingStatus).to.be.empty;
  });
  it('should not render a limited operating status when has status but no more info', async () => {
    const updatedFixture = fixture;
    updatedFixture.fieldOffice.entity.reverseFieldOfficeNode.entities[0].fieldOperatingStatusFacility =
      'limited';

    const rendered = await renderHTML(
      'src/site/layouts/vet_center_locations_list.drupal.liquid',
      updatedFixture,
    );
    const operatingStatus = queryAllByTestId(
      rendered,
      'operating-status-vc_5141OS',
    );
    expect(operatingStatus).to.be.empty;
  });

  it('should render a limited operating status when has status and more info', async () => {
    const updatedFixture = fixture;
    updatedFixture.fieldOffice.entity.reverseFieldOfficeNode.entities[0].fieldOperatingStatusFacility =
      'limited';
    updatedFixture.fieldOffice.entity.reverseFieldOfficeNode.entities[0].fieldOperatingStatusMoreInfo =
      'More info';
    const rendered = await renderHTML(
      'src/site/layouts/vet_center_locations_list.drupal.liquid',
      updatedFixture,
    );
    const operatingStatus = queryAllByTestId(
      rendered,
      'operating-status-vc_5141OS',
    );
    expect(operatingStatus).to.have.lengthOf(1);
  });
});
