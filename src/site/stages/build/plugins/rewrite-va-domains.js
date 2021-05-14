/* eslint-disable no-param-reassign, no-continue */

function createRedirects(options) {
  return (files, metalsmith, done) => {
    if (options.domainReplacements) {
      // Object.keys(files)
      //   .filter(fileName => fileName.endsWith('html'))
      //   .forEach(fileName => {
      //     const file = files[fileName];
      //     let contents = file.contents.toString();
      //     options.domainReplacements.forEach(domain => {
      //       const regex = new RegExp(domain.from, 'g');
      //       contents = contents.replace(regex, domain.to);
      //     });

      //     file.contents = Buffer.from(contents);
      //   });

      const replacementsWithRegex = options.domainReplacements.map(domain => ({
        ...domain,
        regex: new RegExp(domain.from, 'g'),
      }));
      Object.keys(files)
        .filter(fileName => fileName.endsWith('html'))
        .forEach(fileName => {
          let contentsString = files[fileName].contents.toString();
          replacementsWithRegex.forEach(domain => {
            contentsString = contentsString.replace(domain.regex, domain.to);
          });

          // files[fileName].contents = Buffer.from(contentsString);
        });
    }

    done();
  };
}

module.exports = createRedirects;
