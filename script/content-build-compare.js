/* eslint-disable no-console */
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { isEqual } = require('lodash');
const commandLineArgs = require('command-line-args');
const { runCommand } = require('./utils');

const ENVIRONMENTS = require('../src/site/constants/environments');

const defaultBuildtype = ENVIRONMENTS.LOCALHOST;

const COMMAND_LINE_OPTIONS_DEFINITIONS = [
  { name: 'buildtype', type: String, defaultValue: defaultBuildtype },
];

const options = commandLineArgs(COMMAND_LINE_OPTIONS_DEFINITIONS);

// Modeled after https://coderrocketfuel.com/article/recursively-list-all-the-files-in-a-directory-using-node-js
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
      /* eslint-disable no-param-reassign */
      arrayOfFiles = getAllFiles(`${dirPath}/${file}`, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file));
    }
  });

  return arrayOfFiles;
}

/**
 * Writes the array of filenames & hashes to a file
 */
function writeArrayToFile(arr, outputFile) {
  const file = fs.createWriteStream(outputFile);
  file.on('error', err => {
    /* error handling */
    throw err;
  });

  arr.forEach(({ filename, hash }) => {
    file.write(`${hash} ${filename}\n`);
  });
  file.end();
}

/**
 * Reads a file and returns its md5 hash
 */
function getFileHash(filename) {
  const data = fs.readFileSync(filename, { encoding: 'utf8' });
  const hash = crypto.createHash('md5');
  hash.update(data);

  return hash.digest('hex');
}

/**
 * Hash all of the build files in the outputDir and create a file
 * listing the hash for each build file
 */
function hashBuildOutput(outputDir, hashFile) {
  // Get only the HTML build files
  const buildFiles = getAllFiles(outputDir).filter(
    filename => filename.split('.').slice(-1)[0] === 'html',
  );

  // Create a list of filenames and their hashed contents
  const fileHashes = buildFiles.map(filename => ({
    filename: path.relative(outputDir, filename),
    hash: getFileHash(filename),
  }));

  writeArrayToFile(fileHashes, hashFile);
  return fileHashes;
}

function compareBuilds(buildtype) {
  const standaloneBuildFile = path.resolve(
    __dirname,
    '../standaloneContentBuildHash.txt',
  );
  const websiteContentBuildFile = path.resolve(
    __dirname,
    '../websiteContentBuildHash.txt',
  );

  const websiteContentBuild = hashBuildOutput(
    path.join(__dirname, `../build/${buildtype}`),
    'websiteContentBuildHash.txt',
  );
  const standaloneContentBuild = hashBuildOutput(
    path.join(__dirname, `../../vets-website/build/${buildtype}`),
    'standaloneContentBuildHash.txt',
  );

  const test1 = path.resolve(__dirname, '../build/vagovdev/404.html');
  const test2 = path.resolve(
    __dirname,
    '../../vets-website/build/vagovdev/404.html',
  );

  if (isEqual(websiteContentBuild, standaloneContentBuild)) {
    console.log('The content builds match!');
  } else {
    console.log('The content builds do not match');
    runCommand(`diff ${standaloneBuildFile} ${websiteContentBuildFile}`);
    runCommand(`diff ${test1} ${test2}`);
  }
}

compareBuilds(options.buildtype);
