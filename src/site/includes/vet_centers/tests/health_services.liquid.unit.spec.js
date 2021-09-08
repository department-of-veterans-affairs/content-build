import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';

const layoutPath = 'src/site/includes/vet_centers/health_services.liquid';

describe('health_services', () => {
  let container;
  const data = parseFixture(
    'src/site/includes/vet_centers/tests/fixtures/health_services.json',
  );

  before(async () => {
    container = await renderHTML(layoutPath, data);
  });

  it('renders service under "Other" when fieldVetCenterTypeOfCare is null', () => {
    expect(
      container.querySelector(
        '#other-services, #field-body-health-services--Workshops and classes',
      ),
    ).to.exist;
  });
});
