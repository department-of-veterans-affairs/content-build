const commandLineArgs = require('command-line-args');
const { runCommandSync } = require('./utils');

const ENVIRONMENTS = require('../src/site/constants/environments');

const defaultBuildtype = ENVIRONMENTS.LOCALHOST;

const COMMAND_LINE_OPTIONS_DEFINITIONS = [
  { name: 'buildtype', type: String, defaultValue: defaultBuildtype },
  { name: 'port', type: Number, defaultValue: process.env.PORT || 3002 },
];

const options = commandLineArgs(COMMAND_LINE_OPTIONS_DEFINITIONS);

runCommandSync(
  `yarn http-server build/${options.buildtype} -s -c-1 -p ${options.port} -env scaffold api=http://something.va.gov:3004`,
);
