import { expect } from 'chai';
import { renderHTML } from '~/site/tests/support';

const layoutPath = 'src/site/components/image.drupal.liquid';

describe('Facility Listing', () => {
  it('renders img tag if url and alt are present', async () => {
    const data = {
      url: 'testUrl', // TODO: validate the url format?
      alt: 'testAlt',
      class: 'testClass',
      title: 'testTitle',
      width: 'testWidth',
      height: 'testHeight',
    };

    const container = await renderHTML(layoutPath, data);

    expect(container.querySelector('img').outerHTML).to.equal(
      '<img class="testClass" src="testUrl" alt="testAlt" title="testTitle" width="testWidth" height="testHeight">',
    );
  });

  it('does NOT render img tag if url is not present', async () => {
    const data = {
      alt: 'testAlt',
      class: 'testClass',
    };

    const container = await renderHTML(layoutPath, data);

    expect(container.querySelector('img')).not.to.exist;
  });

  it('does NOT render img tag if alt is not present', async () => {
    const data = {
      url: 'testUrl',
      class: 'testClass',
    };

    const container = await renderHTML(layoutPath, data);

    expect(container.querySelector('img')).not.to.exist;
  });

  it('does NOT render img tag if neither url nor alt is present', async () => {
    const data = {
      class: 'testClass',
    };

    const container = await renderHTML(layoutPath, data);

    expect(container.querySelector('img')).not.to.exist;
  });
});
