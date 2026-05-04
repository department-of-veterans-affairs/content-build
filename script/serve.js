const commandLineArgs = require('command-line-args');
const express = require('express');
const fallback = require('express-history-api-fallback');
const path = require('path');

const ENVIRONMENTS = require('../src/site/constants/environments');

const defaultBuildtype = ENVIRONMENTS.LOCALHOST;

const COMMAND_LINE_OPTIONS_DEFINITIONS = [
  { name: 'buildtype', type: String, defaultValue: defaultBuildtype },
  { name: 'port', type: Number, defaultValue: process.env.PORT || 3002 },
];

const options = commandLineArgs(COMMAND_LINE_OPTIONS_DEFINITIONS);
const root = path.resolve(__dirname, `../build/${options.buildtype}`);

const app = express();

// Disable caching (equivalent to http-server -c-1)
app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

app.use(express.static(root));

// SPA fallback (equivalent to http-server -s)
app.use(fallback('index.html', { root }));

app.listen(options.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Serving ${root} on http://localhost:${options.port}`);
});
