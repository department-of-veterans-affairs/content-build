/* eslint-disable no-param-reassign, no-console */
const ENVIRONMENTS = require('../../../constants/environments');

function createEnvironmentFilter(options) {
  const environmentName = options.buildtype;

  return (files, metalsmith, done) => {
    for (const fileName of Object.keys(files)) {
      const file = files[fileName];

      // Do not include the following pages on production (except for the preview server):
      // va.gov/asistencia-y-recursos-en-espanol
      // va.gov/tagalog-wika-mapagkukunan-at-tulong
      if (
        !options.isPreviewServer &&
        environmentName === ENVIRONMENTS.VAGOVPROD &&
        (file.entityId === '20078' || file.entityId === '20092')
      ) {
        delete files[fileName];
      }

      if (
        environmentName !== ENVIRONMENTS.LOCALHOST &&
        file.status === 'draft'
      ) {
        delete files[fileName];
      }

      if (file[environmentName] === false) {
        console.log(`File excluded from current buildtype: ${fileName}`);
        delete files[fileName];
      }
    }

    done();
  };
}

module.exports = createEnvironmentFilter;
