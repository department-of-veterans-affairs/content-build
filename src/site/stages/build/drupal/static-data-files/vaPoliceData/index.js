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
  for await (const io of zip(inputs, outputFilenames)) {
    if (typeof io[0] !== 'string') {
      throw new Error('inputs must be an array of strings');
    }
    if (typeof io[1] !== 'string') {
      throw new Error('output_filenames must be an array of strings');
    }
    if (/https?|file:\/\//.test(io[0])) {
      const { data } = await curly.get(io[0]);
      fs.writeFileSync(path.join(__dirname, io[1]), data);
    }
  }
  return outputFilenames;
};

/* eslint-disable camelcase */
const postProcess = async queryResult => {
  log({ POLICE: JSON.stringify(queryResult) });
  const processedJSON = {};
  for await (const csvFilePath of queryResult) {
    const data = await csv().fromFile(csvFilePath);
    log(data);
  }
  return processedJSON;
};

module.exports = {
  query,
  postProcess,
};
