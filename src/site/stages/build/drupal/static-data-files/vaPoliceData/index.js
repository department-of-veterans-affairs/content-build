const fs = require('fs');
const csv = require('csvtojson');
const path = require('path');
const { join } = require('path');
const { pathToFileURL } = require('url');

// URLs to fetch (even if they are local files)
const query = [
  pathToFileURL(join(__dirname, 'police-contact.csv')).toString(),
  pathToFileURL(join(__dirname, 'police-events.csv')).toString(),
];

const postProcess = async queryResult => {
  const processedJSON = {
    data: {
      statistics: {},
      contacts: {},
    },
  };
  const [contact, events] = queryResult;
  const contactFile = path.join(__dirname, 'pre-contact-police.csv');
  const eventsFile = path.join(__dirname, 'pre-events-police.csv');
  // Unfortunately there's no Buffer or file-string support in csvtojson, there's read and process per-line, but this is more efficient.
  fs.writeFileSync(contactFile, contact, { append: false });
  fs.writeFileSync(eventsFile, events, { append: false });
  // eslint-disable-next-line no-unused-vars
  const contactsJson = await csv().fromFile(contactFile);
  // eslint-disable-next-line no-unused-vars
  const eventsJson = await csv().fromFile(eventsFile);
  // TODO: Process jsonEvents and Join data with contact info for a Facility Police Page content
  return processedJSON;
};

module.exports = {
  query,
  postProcess,
};
