import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import modifyDomPlugin from './modifyDomPlugin';
import addSubheadingsIds from '../add-id-to-subheadings';
import Metalsmith from 'metalsmith';
import { JSDOM } from 'jsdom';

const metalsmith = Metalsmith(
  './src/site/stages/build/plugins/modify-dom/tests/fixtures/',
);

after(() => {
  fs.rmdirSync(path.join(__dirname, './fixtures/build'), {
    recursive: true,
    force: true,
  });
});

describe('addIdToSubheadings', () => {
  it('should add <h2> ids to "On this Page" table of contents', done => {
    metalsmith
      .use(modifyDomPlugin([addSubheadingsIds]))
      .build(function(err, files) {
        const { document } = new JSDOM(
          files['testSubheadings.html'].contents.toString(),
        ).window;

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
      });
  });

  it('should not add an h2 to the table of contents if it is inside an alert', done => {
    metalsmith
      .use(modifyDomPlugin([addSubheadingsIds]))
      .build(function(err, files) {
        const { document } = new JSDOM(
          files['testSubheadings.html'].contents.toString(),
        ).window;

        expect(
          document.querySelector(
            '#table-of-contents li a[href="#test-alert-h2"]',
          ),
        ).to.eq(null);
        done();
      });
  });
});
