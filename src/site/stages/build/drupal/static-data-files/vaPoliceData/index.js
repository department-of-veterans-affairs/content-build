const { join } = require('path');
const { pathToFileURL } = require('url');
const { postProcessPolice } = require('./postProcessPolice');

// URLs to fetch (even if they are local files)
const query = [
  pathToFileURL(join(__dirname, 'police-contact.csv')).toString(), // contacts is always first
  pathToFileURL(join(__dirname, 'police-events.csv')).toString(), // any number of events files following
];

const postProcess = postProcessPolice;

module.exports = {
  query,
  postProcess,
};
