import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';
import axeCheck from '~/site/tests/support/axe';

const layoutPath = 'src/site/layouts/publication_listing.drupal.liquid';

describe('Vet Center Main Page', () => {
  let container;
  const pdfFiledata = parseFixture(
    'src/site/layouts/tests/publication_listing/fixtures/pdfFileData.json',
  );
  const docxFiledata = parseFixture(
    'src/site/layouts/tests/publication_listing/fixtures/docxFileData.json',
  );

  it('reports no axe violations', async () => {
    container = await renderHTML(layoutPath, pdfFiledata);

    const violations = await axeCheck(container);
    expect(violations.length).to.equal(0);
  });

  it('add type attribute "application/pdf" to pdf files', async () => {
    container = await renderHTML(layoutPath, pdfFiledata);

    const downloadLink = container.querySelector('.file-download-with-icon');

    expect(downloadLink.getAttribute('type')).to.equal('application/pdf');
    expect(downloadLink.getAttribute('download')).to.equal('file.pdf');
    expect(downloadLink.getAttribute('aria-label')).to.equal(
      'Download PDF Dharma Initiative Annual Report - 1974',
    );
    expect(downloadLink.text.replace(/\s+/g, ' ')).to.equal(
      'Download PDF (0.48MB)',
    );
  });

  it('add does not include type attribute for non-pdf files', async () => {
    container = await renderHTML(layoutPath, docxFiledata);

    const downloadLink = container.querySelector('.file-download-with-icon');

    expect(downloadLink.getAttribute('type')).to.equal(null);
    expect(downloadLink.text.replace(/\s+/g, ' ')).to.equal(
      'Download DOCX (0.16MB)',
    );
  });
});
