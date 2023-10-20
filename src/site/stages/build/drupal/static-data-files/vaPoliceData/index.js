const { curly } = require('node-libcurl');
const { zip } = require('lodash');
const fs = require('fs');
const csv = require('csvtojson');
const path = require('path');
const { logDrupal: log } = require('../../utilities-drupal');

const query = (inputs, outputFilenames) => async () => {
  if (!Array.isArray(inputs)) {
    throw new Error('inputs must be an array');
  }
  if (!Array.isArray(outputFilenames)) {
    throw new Error('output_filenames must be an array');
  }
  if (inputs.length !== outputFilenames.length) {
    throw new Error('inputs and output_filenames must be the same length');
  }
  const outputData = [];
  for await (const io of zip(inputs, outputFilenames)) {
    if (typeof io[0] !== 'string') {
      throw new Error('inputs must be an array of strings');
    }
    if (typeof io[1] !== 'string') {
      throw new Error('output_filenames must be an array of strings');
    }
    if (/https?|file:\/\//.test(io[0])) {
      const { data } = await curly.get(io[0]);
      outputData.push(data);
    }
  }
  return { outputFilenames, outputData };
};

/* eslint-disable camelcase */
const postProcess = async queryResult => {
  log({ POLICE: queryResult });
  const processedJSON = {};
  const [contact, events] = queryResult.outputData;
  const contactFile = path.join(__dirname, 'pre-contact-police.csv');
  const eventsFile = path.join(__dirname, 'pre-events-police.csv');
  fs.writeFileSync(contactFile, contact);
  fs.writeFileSync(eventsFile, events);
  const jsonContact = await csv().fromFile(contactFile);
  const jsonEvents = await csv().fromFile(eventsFile);
  log(jsonContact);
  log(jsonEvents);
  return processedJSON;
};

module.exports = {
  query,
  postProcess,
};
