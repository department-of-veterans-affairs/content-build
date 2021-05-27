/* eslint-disable no-param-reassign, no-continue */

function createRedirects(options) {
  return async (files, metalsmith, done) => {
    if (options.domainReplacements) {
      const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
      let itemsSinceCall = 0;

      const htmlFiles = Object.keys(files).filter(filename => {
        return filename.endsWith('html');
      });
      for (const fileName of htmlFiles) {
        const file = files[fileName];
        let contents = file.contents.toString();
        options.domainReplacements.forEach(domain => {
          const regex = new RegExp(domain.from, 'g');
          contents = contents.replace(regex, domain.to);
        });

        file.contents = Buffer.from(contents);

        itemsSinceCall++;
        if (itemsSinceCall > 100) {
          itemsSinceCall = 0;
          /* eslint-disable no-await-in-loop, no-console */
          await sleep(1);
          console.log('sleep for 1ms at 100 items');
        }
      }
    }

    done();
  };
}

module.exports = createRedirects;
