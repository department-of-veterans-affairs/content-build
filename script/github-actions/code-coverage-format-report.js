const fs = require('fs');
const path = require('path');

const codeCoverageReport = fs.readFileSync(
  path.join(__dirname, '../../test-results/coverage_report.txt'),
  'utf8',
);

// eliminate unnecessary lines & spaces from coverage report
const regex = /([^A-Za-z0-9/()%-])+\s/g;

const codeCoverageData = codeCoverageReport.replace(regex, ',').split(',');

let codeCoverageHTML =
  '<va-table> \n <va-table-row slot="headers" key="header"> \n'; // html format

codeCoverageData.forEach((data, index) => {
  if (data === '') {
    // ignore empty data
    codeCoverageHTML += '';
  } else if (index < 5) {
    // create table header
    codeCoverageHTML += `<span> ${data} </span> \n`;
  } else if (index === 5) {
    // separate table header from data
    codeCoverageHTML += `<span> ${data} </span> \n </va-table-row> \n`;
  } else if ((index - 1) % 5 === 0) {
    // start of row in table body
    codeCoverageHTML += `<va-table-row> \n <span> ${data} </span> \n`;
  } else if ((index - 1) % 5 === 4) {
    // end of row in table body
    codeCoverageHTML += `<span> ${data} </span> \n </va-table-row> \n`;
  } else {
    // row in table body
    codeCoverageHTML += `<span> ${data} </span> \n`;
  }
});

codeCoverageHTML += `</va-table>`; // close html

console.log(codeCoverageHTML); // eslint-disable-line no-console
