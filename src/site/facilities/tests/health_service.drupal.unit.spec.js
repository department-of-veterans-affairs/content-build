import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';

const layoutPath = 'src/site/facilities/health_service.drupal.liquid';

describe('health_service.drupal.liquid', () => {
  let container;
  const data = parseFixture(
    'src/site/facilities/tests/fixtures/healthServiceData.json',
  );

  before(async () => {
    container = await renderHTML(layoutPath, data);
  });

  it('wraps phone numbers in fieldBody data', () => {
    const descriptions = container.querySelectorAll('description');
    const expected =
      '<p>Testing phone numbers: <a target="_blank" href="tel:123-456-7890">123-456-7890</a>. ' +
      '<a target="_blank" href="tel:123-456-7890">123-456-7890</a>. Yay!</p>';
    expect(descriptions[0].innerHTML).to.equal(expected);
    expect(descriptions[1].innerHTML).to.equal(expected);
  });
});
