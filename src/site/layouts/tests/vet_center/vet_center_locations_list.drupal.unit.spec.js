import { expect } from 'chai';
import { beforeEach } from 'mocha';
import { parseFixture, renderHTML } from '~/site/tests/support';

const layoutPath = 'src/site/layouts/vet_center_locations_list.drupal.liquid';

describe('Vet Center Locations Page', () => {
  let container;
  const data = parseFixture(
    'src/site/layouts/tests/vet_center/fixtures/vet_center_locations_data.json',
  );

  beforeEach(async () => {
    container = await renderHTML(layoutPath, data);
  });

  it('renders vet center name in metatag - [Vet Center] | Veterans Affairs', () => {
    expect(
      container
        .querySelector("meta[property='og:title']")
        .getAttribute('content'),
    ).to.equal('Locations | Nashville Vet Center | Veterans Affairs');
  });

  it('renders vet center name in title-tag - [Vet Center] | Veterans Affairs', () => {
    expect(container.querySelector('title').innerHTML).to.equal(
      'Locations | Nashville Vet Center | Veterans Affairs',
    );
  });

  it('sorts satellite locations by title', () => {
    expect(
      Array.from(container.querySelectorAll('vctitle')).map(el => el.innerHTML),
    ).to.deep.equal([
      'Nashville Vet Center', // main location
      'Clarksville Outstation',
      'Nashville Vet Center - Bowling Green',
      'Knoxville Mobile Vet Center',
      'Memphis Mobile Vet Center',
    ]);
  });
});
