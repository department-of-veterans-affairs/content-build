const {
  query: queryDigitalForms,
  postProcess: postProcessDigitalForm,
} = require('./digitalForm');
const {
  query: queryVamcEhrSystem,
  postProcess: postProcessVamcEhrSystem,
} = require('./vamcEhrSystem');

const {
  query: queryVamcFacilitySupplementalStatus,
  postProcess: postProcessVamcFacilitySupplementalStatus,
} = require('./vamcFacilitySupplementalStatus');

const {
  query: queryVAPoliceData,
  postProcess: postProcessVAPoliceData,
} = require('./vaPoliceData');

const {
  query: queryVamcSystem,
  postProcess: postProcessVamcSystem,
} = require('./vamcSystem');

const DATA_FILE_PATH = 'data/cms';

/**
 * {
 *    description: String used in build log,
 *    filename: File will be generated at `${DATA_FILE_PATH}/${filename}`,
 *    queryType: 'graphql' (default); aim to eventually support jsonapi
 *    query: String|Object defining the query to be run,
 *    postProcess: Callback function to apply post-query processing on query result,
 * }
 */
const DATA_FILES = [
  {
    description: 'Digital Forms',
    filename: 'digital-forms.json',
    query: queryDigitalForms,
    queryType: 'graphql',
    postProcess: postProcessDigitalForm,
  },
  {
    description: 'VAMC EHR System',
    filename: 'vamc-ehr.json',
    query: queryVamcEhrSystem,
    queryType: 'graphql',
    postProcess: postProcessVamcEhrSystem,
  },
  {
    description: 'VAMC Facility Supplemental Status',
    filename: 'vamc-facility-supplemental-status.json',
    query: queryVamcFacilitySupplementalStatus,
    queryType: 'graphql',
    postProcess: postProcessVamcFacilitySupplementalStatus,
  },
  {
    description: 'VAMC System',
    filename: 'vamc-system.json',
    query: queryVamcSystem,
    queryType: 'curl',
    postProcess: postProcessVamcSystem,
  },
  {
    description: 'VAMC Police Data',
    filename: 'vamc-police.json',
    queryType: 'curl',
    // This looks like a highly complicated route to get the file data, but it is generalizeable to all CURL requests, not just file URLs
    query: queryVAPoliceData,
    postProcess: postProcessVAPoliceData,
  },
];

module.exports = {
  DATA_FILE_PATH,
  DATA_FILES,
};
