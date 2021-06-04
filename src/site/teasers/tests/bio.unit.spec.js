import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';

const layoutPath = 'src/site/teasers/bio.drupal.liquid';

const data = parseFixture('src/site/teasers/tests/fixtures/bio_data.json');

const getContainer = async item => {
  return renderHTML(layoutPath, data[item]);
};

describe('Staff Bio Page', () => {
  it('renders name as a link when entityUrl.path exists', async () => {
    const container = await getContainer('bioWithLink');
    expect(
      container.querySelector('a.vads-u-font-size--lg').innerHTML.trim(),
    ).to.equal('Mary Link');
  });

  it('renders name as a span when entityUrl.path does not exists', async () => {
    const container = await getContainer('bioWithoutLink');
    expect(container.querySelector('a.vads-u-font-size--lg')).to.be.null;
    expect(
      container.querySelector('span.vads-u-font-size--lg').innerHTML.trim(),
    ).to.equal('Joe No’link');
  });
});
