import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';

const layoutPath =
  'src/site/paragraphs/spanish_translation_summary.drupal.liquid';
const data = parseFixture(
  'src/site/layouts/tests/vamc/fixtures/additional-info-content-block.json',
);

describe('additional-info-content-block', () => {
  describe('additional content block has trigger text and body text', () => {
    it('displays addition info component', async () => {
      const container = await renderHTML(
        layoutPath,
        data.hasFieldTextExpander,
        'hasFieldTextExpander',
      );
      expect(
        container.querySelector(
          'div.additional-info-container span[class="additional-info-title"]',
        ).innerHTML,
      ).to.equal(data.hasFieldTextExpander.entity.fieldTextExpander);

      expect(
        container
          .querySelector(
            'div.additional-info-container div[class="additional-info-content"]',
          )
          .innerHTML.trim(),
      ).to.equal(data.hasFieldTextExpander.entity.fieldWysiwyg.processed);
    });
  });

  describe('additional content block has no trigger text or body text', () => {
    it('does not display addition info component', async () => {
      const container = await renderHTML(
        layoutPath,
        data.noFieldTextExpander,
        'noFieldTextExpander',
      );
      expect(container.querySelector('div.additional-info-container')).to.not
        .exist;
    });
  });
});
