/* eslint-disable no-param-reassign, no-continue */

const { sleep } = require('../../../../../script/utils');

function createRedirects(options) {
  return async (files, metalsmith, done) => {
    if (options.domainReplacements) {
      const htmlFilter = filename => filename.endsWith('html');
      const htmlFiles = Object.keys(files).filter(htmlFilter);
      let numProcessed = 0;

      for (const fileName of htmlFiles) {
        const file = files[fileName];
        let contents = file.contents.toString();
        options.domainReplacements.forEach(domain => {
          const regex = new RegExp(domain.from, 'g');
          contents = contents.replace(regex, domain.to);
        });

        file.contents = Buffer.from(contents);
        numProcessed++;

        // Pause for garbage collection to free unused buffer memory
        // eslint-disable-next-line no-await-in-loop
        if (numProcessed % 100 === 0) await sleep(1);
      }

      // eslint-disable-next-line no-console
      console.log(`Rewrote domains for ${numProcessed} files`);
    }

    done();
  };
}

module.exports = createRedirects;
