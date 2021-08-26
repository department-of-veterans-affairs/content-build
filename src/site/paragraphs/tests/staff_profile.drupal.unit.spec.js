import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';

const layoutPath = 'src/site/paragraphs/staff_profile.drupal.liquid';
const data = parseFixture(
  'src/site/paragraphs/tests/fixtures/staff_profile.json',
);
let container;

describe('Unpublished', () => {
  before(async () => {
    container = await renderHTML(layoutPath, data.unpublished, 'unpublished');
  });

  it('does not render bio', async () => {
    expect(container.querySelector('bio')).to.be.null;
  });
});

describe('published', () => {
  before(async () => {
    container = await renderHTML(layoutPath, data.published, 'published');
  });

  it('renders bio', async () => {
    expect(container.querySelector('bio').innerHTML).not.to.be.empty;
  });

  it('does not render link because bio.entityUrl.path is null', async () => {
    expect(container.querySelector('a.bioLink')).to.be.null;
  });
});
