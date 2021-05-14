/* eslint-disable no-param-reassign, no-continue */

function createRedirects(options) {
  return (files, metalsmith, done) => {
    if (options.domainReplacements) {
      let itemsSinceCall = 0;

      Object.keys(files)
        .filter(fileName => fileName.endsWith('html'))
        .forEach(fileName => {
          const file = files[fileName];
          let contents = file.contents.toString();
          delete file.contents;
          options.domainReplacements.forEach(domain => {
            const regex = new RegExp(domain.from, 'g');
            contents = contents.replace(regex, domain.to);
          });

          file.contents = Buffer.from(contents);

          itemsSinceCall++;
          if (itemsSinceCall > 100) {
            itemsSinceCall = 0;
            global.gc();
            /* eslint-disable no-console */
            console.log('Called global.gc() in createRedirects()');
          }
        });

      // const replacementsWithRegex = options.domainReplacements.map(domain => ({
      //   ...domain,
      //   regex: new RegExp(domain.from, 'g'),
      // }));
      // Object.keys(files)
      //   .filter(fileName => fileName.endsWith('html'))
      //   .forEach(fileName => {
      //     let contentsString = files[fileName].contents.toString();
      //     replacementsWithRegex.forEach(domain => {
      //       contentsString = contentsString.replace(domain.regex, domain.to);
      //     });

      //     files[fileName].contents = Buffer.from(contentsString);
      //   });
    }

    done();
  };
}

module.exports = createRedirects;
