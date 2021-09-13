import { expect } from 'chai';
import { beforeEach } from 'mocha';
import { parseFixture, renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';

const layoutPath = 'src/site/layouts/va_form.drupal.liquid';

describe('va_form', () => {
  let container;
  const data = parseFixture(
    'src/site/layouts/tests/find_forms/fixtures/va_form.json',
  );
  beforeEach(async () => {
    container = await renderHTML(layoutPath, data);
  });

  it('reports no axe violations', async () => {
    const violations = await axeCheck(container);
    expect(violations.length).to.equal(0);
  });

  it('has a h1 header "title" for the page', () => {
    const title = container.querySelector('h1');
    expect(title.innerHTML.trim()).to.equal(data.title);
  });

  it('has "when to use this form" explanation', () => {
    const whenToUseThisFormHeader = container.querySelector(
      'h2[data-testid="va_form--when-to-use-this-form-header"]',
    );
    const whenToUseThisFormParagraph = container.querySelector(
      '[data-testid="va_form--when-to-use-this-form-text"]',
    );
    expect(whenToUseThisFormHeader.innerHTML.trim()).to.equal(
      'When to use this form',
    );
    expect(whenToUseThisFormParagraph.innerHTML.trim()).to.not.equal(null);
  });

  it('has the Go to Online Tool and PDF download headers', () => {
    const onlineToolHeader = container.querySelector(
      'h3[data-testid="va_form--online-tool"]',
    );
    const downloadPdfLink = container.querySelector(
      'h3[data-testid="va_form--downloadable-pdf"]',
    );
    expect(onlineToolHeader).to.not.be.null;
    expect(downloadPdfLink).to.not.be.null;
  });

  it('has the Go to Online Tool and PDF download links', () => {
    const allAnchorTags = container.querySelectorAll('a');
    const linksNeeded = {
      pdf: { link: data.fieldVaFormUrl.uri, isPresent: false },
      goToOnlineTool: { link: data.fieldVaFormToolUrl.uri, isPresent: false },
    };
    allAnchorTags.forEach((tag, index) => {
      if (tag.getAttribute('href') === linksNeeded.pdf.link)
        linksNeeded.pdf.isPresent = true;
      if (tag.getAttribute('href') === linksNeeded.goToOnlineTool.link)
        linksNeeded.goToOnlineTool.isPresent = true;

      if (index - 1 === allAnchorTags.length) {
        expect(linksNeeded.pdf.isPresent).to.equal(true);
        expect(linksNeeded.goToOnlineTool.isPresent).to.equal(true);
      }
    });
  });

  it('shows the related forms section and the forms links', () => {
    const relatedFormsSectionHeader = container.querySelector(
      'h2[data-testid="va_form--related-forms-and-instructions"]',
    );
    expect(relatedFormsSectionHeader).to.not.be.null;

    const allAnchorTags = container.querySelectorAll('a');
    const linksNeeded = {
      // NOTE relatedFormTwoHeader is not here because it is ES language. We wait on full translated page so the headers are not links since there is no translated page.
      relatedFormOneLink: {
        link: data.fieldVaFormRelatedForms[0].entity.fieldVaFormUrl.uri,
        isPresent: false,
      },
      relatedFormOneHeader: {
        link: data.fieldVaFormRelatedForms[1].entity.entityUrl.path,
        isPresent: false,
      },
      relatedFormTwoLink: {
        link: data.fieldVaFormRelatedForms[1].entity.fieldVaFormUrl.uri,
        isPresent: false,
      },
    };
    allAnchorTags.forEach((tag, index) => {
      if (tag.getAttribute('href') === linksNeeded.relatedFormOneLink.link)
        linksNeeded.relatedFormOneLink.isPresent = true;
      if (tag.getAttribute('href') === linksNeeded.relatedFormOneHeader.link)
        linksNeeded.relatedFormOneHeader.isPresent = true;
      if (tag.getAttribute('href') === linksNeeded.relatedFormTwoLink.link)
        linksNeeded.relatedFormTwoLink.isPresent = true;

      if (index - 1 === allAnchorTags.length) {
        expect(linksNeeded.relatedFormOneLink.isPresent).to.equal(true);
        expect(linksNeeded.relatedFormOneHeader.isPresent).to.equal(true);
        expect(linksNeeded.relatedFormTwoLink.isPresent).to.equal(true);
      }
    });
  });
});
