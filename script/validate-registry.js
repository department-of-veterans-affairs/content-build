/* eslint-disable no-console */
const commandLineArgs = require('command-line-args');
const fs = require('fs');

const optionDefinitions = [{ name: 'registry-file', type: String }];

const options = commandLineArgs(optionDefinitions);

if (!options['registry-file']) {
  console.error('Please provide a registry-file argument.');
  process.exit(1);
}

const filePath = options['registry-file'];

try {
  const rawData = fs.readFileSync(filePath);
  const entries = JSON.parse(rawData);

  if (!Array.isArray(entries)) {
    throw new Error('The JSON must be an array of objects.');
  }

  const entryNames = new Set();
  const rootUrls = new Set();
  const productIds = new Set();
  const issues = [];
  let hasDuplicateUrlOrProductId = false;

  for (const entry of entries) {
    if (entryNames.has(entry.entryName)) {
      issues.push(`Duplicate entryName found: ${entry.entryName}`);
    } else {
      entryNames.add(entry.entryName);
    }

    if (rootUrls.has(entry.rootUrl)) {
      issues.push(`Duplicate rootUrl found: ${entry.rootUrl}`);
      hasDuplicateUrlOrProductId = true;
    } else {
      rootUrls.add(entry.rootUrl);
    }

    if (productIds.has(entry.productId)) {
      issues.push(`Duplicate productId found: ${entry.productId}`);
      hasDuplicateUrlOrProductId = true;
    } else if (entry.productId) {
      productIds.add(entry.productId);
    }
  }

  if (issues.length > 0) {
    console.log('The JSON file has the following issues:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  } else {
    console.log('The JSON file is valid and contains no duplicates.');
  }

  if (hasDuplicateUrlOrProductId) {
    process.exit(1);
  }
} catch (error) {
  console.error(`An error occurred: ${error.message}`);
  process.exit(1);
}
