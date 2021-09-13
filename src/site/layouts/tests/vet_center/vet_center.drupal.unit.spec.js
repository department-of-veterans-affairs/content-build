import { expect } from 'chai';
import { beforeEach } from 'mocha';
import { parseFixture, renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';

const layoutPath = 'src/site/layouts/vet_center.drupal.liquid';
const _ = require('lodash');

import testData from './fixtures/vet_center_data.json';

describe('Vet Center Main Page', () => {
  let container;
  const data = parseFixture(
    'src/site/layouts/tests/vet_center/fixtures/vet_center_data.json',
  );

  beforeEach(async () => {
    container = await renderHTML(layoutPath, data);
  });

  it('reports no axe violations', async () => {
    const violations = await axeCheck(container);
    expect(violations.length).to.equal(0);
  });

  it('renders vet center name in metatag - [Vet Center] | Veterans Affairs', () => {
    expect(
      container
        .querySelector("meta[property='og:title']")
        .getAttribute('content'),
    ).to.equal('Escanaba Vet Center | Veterans Affairs');
  });

  it('renders vet center name in title-tag - [Vet Center] | Veterans Affairs', () => {
    expect(container.querySelector('title').innerHTML).to.equal(
      'Escanaba Vet Center | Veterans Affairs',
    );
  });

  it('renders a-tag with caret within the spotlight featured content section if there is call to action data', () => {
    expect(
      container
        .querySelector('.featured-content-list-item a')
        .innerHTML.replace(/\s+/g, ' ')
        .trim(),
    ).to.equal(
      '<span> Listen to the podcast <i class="fa fa-chevron-right vads-facility-hub-cta-arrow" aria-hidden="true"></i></span>',
    );
  });

  it('renders no a-tag and caret within the spotlight featured content section if call to action data is null', async () => {
    const mockData = _.cloneDeep(data);
    const nullCta = [
      {
        entity: {
          fieldButtonLabel: null,
          fieldButtonLink: null,
        },
      },
    ];
    mockData.fieldCcVetCenterFeaturedCon.fetched.fieldCta = nullCta;

    const newContainer = await renderHTML(layoutPath, mockData);
    expect(
      newContainer
        .querySelector('.featured-content-list-item ')
        .innerHTML.replace(/\s+/g, ' ')
        .trim(),
    ).to.equal(
      '<h3 class="force-small-header" id="borne-the-battle-podcast-vet-c">Borne the Battle Podcast: Vet Centers</h3> <hr class="featured-content-hr vads-u-margin-y--1p5 vads-u-border-color--primary"> <div id="featured-content-descriptionBorne the Battle Podcast: Vet Centers}}"> <p>A Borne the Battle episode discusses some of the unique and generous benefits that Vet Centers offer.</p> </div>',
    );
  });

  it('renders no a-tag and caret within the spotlight featured content section if fieldButtonLink is invalid', async () => {
    const mockData = _.cloneDeep(data);
    const invalidCta = [
      {
        entity: {
          fieldButtonLabel: null,
          fieldButtonLink: {
            title: '',
            uri: 'internal:/     ',
          },
        },
      },
    ];
    mockData.fieldCcVetCenterFeaturedCon.fetched.fieldCta = invalidCta;

    const newContainer = await renderHTML(layoutPath, mockData);
    expect(
      newContainer
        .querySelector('.featured-content-list-item ')
        .innerHTML.replace(/\s+/g, ' ')
        .trim(),
    ).to.equal(
      '<h3 class="force-small-header" id="borne-the-battle-podcast-vet-c">Borne the Battle Podcast: Vet Centers</h3> <hr class="featured-content-hr vads-u-margin-y--1p5 vads-u-border-color--primary"> <div id="featured-content-descriptionBorne the Battle Podcast: Vet Centers}}"> <p>A Borne the Battle episode discusses some of the unique and generous benefits that Vet Centers offer.</p> </div>',
    );
  });

  it('renders header and intro text', () => {
    expect(container.querySelector('h1').innerHTML).to.equal(
      testData.entityLabel,
    );
    expect(container.querySelector('div.va-introtext > p').innerHTML).to.equal(
      testData.fieldIntroText,
    );
  });

  it('renders address', () => {
    expect(
      container
        .querySelector('address')
        .innerHTML.replace(/\s+/g, ' ')
        .trim(),
    ).to.equal(
      '<div>3500 Ludington Street</div> <div>Suite 200</div> Escanaba, MI 49829',
    );
  });

  it('renders prepare for your field-cc-non-traditional-hours', () => {
    expect(
      container.querySelectorAll('.field-cc-non-traditional-hours p').length,
    ).to.equal(1);
  });

  it('renders prepare for your field-cc-non-traditional-hours', () => {
    expect(
      container.querySelectorAll('.field-cc-non-traditional-hours p').length,
    ).to.equal(1);
  });

  it('renders vet center call center informational alert', () => {
    expect(container.getElementById('field-cc-vet-call-center')).to.exist;
  });

  it('renders vet center call center informational alert', () => {
    expect(
      container.querySelector('#field-cc-vet-call-center p').innerHTML.trim(),
    ).to.equal(
      'If you need to talk with someone after hours, on weekends, or holidays, the Vet Center call center is available 24/7: 1-877-WAR-VETS (1-<a target="_blank" href="tel:877-927-8387">877-927-8387</a>).',
    );
  });

  it('does not render vet center call center informational alert', async () => {
    const mockData = _.cloneDeep(data);
    mockData.fieldCcVetCenterCallCenter = null;

    const newContainer = await renderHTML(layoutPath, mockData);

    expect(newContainer.getElementById('field-cc-vet-call-center')).to.not
      .exist;
  });

  it('renders prepare for your visit', () => {
    expect(
      container.querySelectorAll('va-accordion[id^=prepare-for-your-visit]')
        .length,
    ).to.equal(4);
    expect(
      container.querySelectorAll(
        'va-accordion-item[id^=prepare-for-your-visit]',
      ).length,
    ).to.equal(4);
  });

  it('renders prepare for your visit field-vet-center-feature-content', () => {
    expect(
      container.querySelectorAll('.field-vet-center-feature-content > ul > li')
        .length,
    ).to.equal(3);
  });

  it('renders counselling services', () => {
    expect(
      container.querySelectorAll('va-accordion[id^=counseling-accordion]')
        .length,
    ).to.equal(9);
    expect(
      container.querySelectorAll('va-accordion-item[id^=counseling-item]')
        .length,
    ).to.equal(9);
  });

  it('renders referral services', () => {
    expect(
      container.querySelectorAll('va-accordion[id^=referral-accordion]').length,
    ).to.equal(3);
    expect(
      container.querySelectorAll('va-accordion-item[id^=referral-item]').length,
    ).to.equal(3);
  });

  it('renders other services', () => {
    expect(
      container.querySelectorAll('va-accordion[id^=other-accordion]').length,
    ).to.equal(1);
    expect(
      container.querySelectorAll('va-accordion-item[id^=other-item]').length,
    ).to.equal(1);
  });
});
