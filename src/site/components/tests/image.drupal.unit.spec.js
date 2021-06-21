import { expect } from 'chai';
import { renderHTML } from '~/site/tests/support';

const layoutPath = 'src/site/components/image.drupal.liquid';

describe('Facility Listing', () => {
  it('renders img tag if url and alt are present', async () => {
    const data = {
      image: {
        derivative: {
          url: 'testUrl', // TODO: validate the url format?
          width: 'testWidth',
          height: 'testHeight',
        },
        alt: 'testAlt',
        title: 'testTitle',
      },
      class: 'testClass',
    };

    const container = await renderHTML(layoutPath, data);

    expect(container.querySelector('img').outerHTML).to.equal(
      '<img class="testClass" src="testUrl" alt="testAlt" title="testTitle" width="testWidth" height="testHeight">',
    );
  });

  it('does NOT render img tag if url is not present', async () => {
    const data = {
      image: {
        derivative: {
          width: 'testWidth',
          height: 'testHeight',
        },
        alt: 'testAlt',
        class: 'testClass',
        title: 'testTitle',
      },
    };

    const container = await renderHTML(layoutPath, data);

    expect(container.querySelector('img')).not.to.exist;
  });

  it('does NOT render img tag if alt is not present', async () => {
    const data = {
      image: {
        derivative: {
          url: 'testUrl',
          width: 'testWidth',
          height: 'testHeight',
        },
        class: 'testClass',
        title: 'testTitle',
      },
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
