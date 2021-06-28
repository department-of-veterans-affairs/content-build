import { expect } from 'chai';
import { renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe.js';

const layoutPath = 'src/site/components/image.drupal.liquid';

describe('image tag template', () => {
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
      onclick: 'testOnClick',
    };

    const container = await renderHTML(layoutPath, data);

    expect(container.querySelector('img').outerHTML).to.equal(
      '<img class="testClass" onclick="testOnClick" src="testUrl" alt="testAlt" width="123" height="321">',
    );
  });

  it('renders img tag if url exists and alt is empty string', async () => {
    const data = {
      image: {
        derivative: {
          url: 'testUrl',
        },
        alt: '',
      },
    };

    const container = await renderHTML(layoutPath, data);

    expect(container.querySelector('img').outerHTML).to.equal(
      '<img src="testUrl" alt="">',
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

  it('reports no axe violations', async () => {
    const container = await renderHTML(layoutPath);
    const violations = await axeCheck(container);

    expect(violations.length).to.equal(0);
  });
});
