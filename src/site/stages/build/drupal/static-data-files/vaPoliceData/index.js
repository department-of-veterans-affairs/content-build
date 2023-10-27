const { Curl } = require('node-libcurl');
const fs = require('fs');
const csv = require('csvtojson');
const path = require('path');

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
      const curl = new Curl();
      curl.setOpt(Curl.option.URL, input);
      if (input.endsWith('cms.va.gov')) {
        curl.setOpt(Curl.option.PROXY, '127.0.0.1:2001');
      }
      curl.setOpt(Curl.option.CUSTOMREQUEST, 'GET');

      const data = await new Promise((resolve, reject) => {
        curl.on('end', (statusCode, body) => {
          resolve(body);
        });
        curl.on('error', err => {
          reject(err);
        });
        curl.perform();
      });

      outputData.push(data);
    }
  }
  return outputData;
};

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
