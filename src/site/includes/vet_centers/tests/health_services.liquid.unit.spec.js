import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';

const layoutPath = 'src/site/includes/vet_centers/health_services.liquid';

describe('health_services', () => {
  it('does not render service when fieldVetCenterTypeOfCare is null', async () => {
    const data = parseFixture(
      'src/site/includes/vet_centers/tests/fixtures/health_services_type_null.json',
    );
    const container = await renderHTML(layoutPath, data, 'typeNull');
    expect(
      container.querySelector(
        '#other-services, #field-body-health-services--Workshops and classes',
      ),
    ).not.to.exist;
  });

  it('renders service under "Other" when fieldVetCenterTypeOfCare exists', async () => {
    const data = parseFixture(
      'src/site/includes/vet_centers/tests/fixtures/health_services_type_exists.json',
    );
    const container = await renderHTML(layoutPath, data, 'typeExists');
    expect(
      container.querySelector(
        '#other-services, #field-body-health-services-arbitrary-Test',
      ),
    ).to.exist;
  });
});
