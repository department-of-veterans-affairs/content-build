import { expect } from 'chai';
import addSubheadingsIds from '../add-id-to-subheadings';
import { testMetalsmithPlugin } from '~/site/tests/support';

describe('addIdToSubheadings', () => {
  it('should add <h2> ids to "On this Page" table of contents', done => {
    testMetalsmithPlugin(
      {
        fileName: 'testSubheadings.html',
        fixturesPath:
          './src/site/stages/build/plugins/modify-dom/tests/fixtures/',
        plugins: [addSubheadingsIds],
      },
      document => {
        expect(
          document
            .querySelector('#table-of-contents li a[href="#test-h2"]')
            .text.replaceAll(/\W+/g, ' ')
            .trim(),
        ).to.equal('Test h2');
        expect(
          document.querySelector('#table-of-contents li a[href="#test-h3"]'),
        ).to.eq(null);

        done();
      },
    );
  });

  it('should not add an h2 to the table of contents if it is inside an alert', done => {
    testMetalsmithPlugin(
      {
        fileName: 'testSubheadings.html',
        fixturesPath:
          './src/site/stages/build/plugins/modify-dom/tests/fixtures/',
        plugins: [addSubheadingsIds],
      },
      document => {
        expect(
          document.querySelector(
            '#table-of-contents li a[href="#test-alert-h2"]',
          ),
        ).to.eq(null);

        done();
      },
    );
  });

  it('removes table-of-contents div if there are no H2 links found', done => {
    testMetalsmithPlugin(
      {
        fileName: 'testSubheadingsNoH2.html',
        fixturesPath:
          './src/site/stages/build/plugins/modify-dom/tests/fixtures/',
        plugins: [addSubheadingsIds],
      },
      document => {
        expect(document.querySelector('#table-of-contents')).to.eq(null);
        done();
      },
    );
  });
});
