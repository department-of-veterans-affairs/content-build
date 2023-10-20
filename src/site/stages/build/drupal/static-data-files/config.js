const { join } = require('path');
const url = require('url');

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
    description: 'VAMC EHR System',
    filename: 'vamc-ehr.json',
    query: queryVamcEhrSystem,
    postProcess: postProcessVamcEhrSystem,
  },
  {
    description: 'VAMC Facility Supplemental Status',
    filename: 'vamc-facility-supplemental-status.json',
    query: queryVamcFacilitySupplementalStatus,
    postProcess: postProcessVamcFacilitySupplementalStatus,
  },
  {
    description: 'VA Police Data',
    filename: 'va-police.json',
    queryType: 'curl',
    query: queryVAPoliceData(
      [
        url
          .pathToFileURL(join(__dirname, 'vaPoliceData', 'police-contact.csv'))
          .toString(),
        url
          .pathToFileURL(join(__dirname, 'vaPoliceData', 'police-events.csv'))
          .toString(),
      ],
      ['pre-police-contact.csv', 'pre-police-violations.csv'],
    ),
    postProcess: postProcessVAPoliceData,
  },
];

module.exports = {
  DATA_FILE_PATH,
  DATA_FILES,
};
