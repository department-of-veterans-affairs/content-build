module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: ['first-meaningful-paint', 'speed-index', 'interactive'],
  },
};
