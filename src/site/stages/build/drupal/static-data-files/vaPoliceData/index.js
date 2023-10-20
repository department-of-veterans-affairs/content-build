const { curly } = require('node-libcurl');
const fs = require('fs');
const csv = require('csvtojson');
const path = require('path');
const { logDrupal: log } = require('../../utilities-drupal');

const query = inputs => async () => {
  if (!Array.isArray(inputs)) {
    throw new Error('inputs must be an array');
  }
  const outputData = [];
  for await (const input of inputs) {
    if (typeof input !== 'string') {
      throw new Error('inputs must be an array of strings');
    }
    if (/https?|file:\/\//.test(input)) {
      const { data } = await curly.get(input);
      outputData.push(data);
    }
  }
  return outputData;
};

const postProcess = async queryResult => {
  const processedJSON = {};
  const [contact, events] = queryResult;
  const contactFile = path.join(__dirname, 'pre-contact-police.csv');
  const eventsFile = path.join(__dirname, 'pre-events-police.csv');
  // Unfortunately there's no Buffer or file-string support in csvtojson, there's read and process per-line, but this is more efficient.
  fs.writeFileSync(contactFile, contact, { append: false });
  fs.writeFileSync(eventsFile, events, { append: false });
  const jsonContact = await csv().fromFile(contactFile);
  const jsonEvents = await csv().fromFile(eventsFile);
  log(jsonContact);
  log(jsonEvents);
  // TODO: Process jsonEvents and Join data with contact info for a Facility Police Page content
  return processedJSON;
};

module.exports = {
  query,
  postProcess,
};
