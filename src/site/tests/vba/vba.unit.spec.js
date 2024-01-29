/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import { expect } from 'chai';
import { getByTestId } from '@testing-library/dom';
import { parseFixture, renderHTML } from '../support';

describe('VBA accordions for Service Locations', () => {
  const fixtureForVBA = parseFixture(
    'src/site/layouts/tests/vba/template/fixtures/vba_complete.json',
  );

  it('should render accordions and have data for ', async () => {
    const VBAHTML = await renderHTML(
      'src/site/layouts/vba_facility.drupal.liquid',
      fixtureForVBA,
    );
    const veteranBenefits = getByTestId(
      VBAHTML,
      'vba-accordion-Veteran benefits',
    );
    expect(veteranBenefits).to.exist;
    const { children: vaBenefitsChildren } = veteranBenefits;
    for (const child of vaBenefitsChildren) {
      expect(child.outerHTML).to.include('va-accordion-item');
      expect(child.getAttribute('header')).to.oneOf([
        'Home loans',
        'Veterans pension',
      ]);
    }
    expect(vaBenefitsChildren.length).to.equal(2);
    const familyBenefits = getByTestId(
      VBAHTML,
      'vba-accordion-Family member and caregiver benefits',
    );
    expect(familyBenefits).to.exist;
    const { children: familyBenefitsChildren } = familyBenefits;
    for (const child of familyBenefitsChildren) {
      expect(child.outerHTML).to.include('va-accordion-item');
      expect(child.getAttribute('header')).to.oneOf(['Advice nurse']);
    }
    const serviceMemberBenefits = getByTestId(
      VBAHTML,
      'vba-accordion-Service member benefits',
    );
    expect(serviceMemberBenefits).to.exist;
    const { children: serviceMemberBenefitsChildren } = serviceMemberBenefits;
    for (const child of serviceMemberBenefitsChildren) {
      expect(child.outerHTML).to.include('va-accordion-item');
      expect(child.getAttribute('header')).to.oneOf(['Billing and insurance']);
    }
    const otherServices = getByTestId(VBAHTML, 'vba-accordion-Other services');
    expect(otherServices).to.exist;
    const { children: otherServicesChildren } = otherServices;
    for (const child of otherServicesChildren) {
      expect(child.outerHTML).to.include('va-accordion-item');
      expect(child.getAttribute('header')).to.oneOf(['Case management']);
    }
    expect(otherServicesChildren.length).to.equal(1); // it has both facility service and regional service, but should only have 1 element
  });
});
