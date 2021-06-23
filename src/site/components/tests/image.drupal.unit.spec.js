import { expect } from 'chai';
import { renderHTML } from '~/site/tests/support';

const layoutPath = 'src/site/components/image.drupal.liquid';

describe('Facility Listing', () => {
  it('renders img tag if url and alt are present', async () => {
    const data = {
      image: {
        derivative: {
          url: 'testUrl', // TODO: validate the url format?
          width: 123,
          height: 321,
        },
        alt: 'testAlt',
      },
      class: 'testClass',
    };

    const container = await renderHTML(layoutPath, data);

    expect(container.querySelector('img').outerHTML).to.equal(
      '<img class="testClass" src="testUrl" alt="testAlt" width="123" height="321">',
    );
  });

  it('omits width, height and class if not present', async () => {
    const data = {
      image: {
        derivative: {
          url: 'testUrl',
        },
        alt: 'testAlt',
      },
    };

    const container = await renderHTML(layoutPath, data);

    expect(container.querySelector('img').outerHTML).to.equal(
      '<img src="testUrl" alt="testAlt">',
    );
  });

  it('does NOT render img tag if url is not present', async () => {
    const data = {
      image: {
        derivative: {
          width: 123,
          height: 321,
        },
        alt: 'testAlt',
        class: 'testClass',
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
          width: 123,
          height: 321,
        },
        class: 'testClass',
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
