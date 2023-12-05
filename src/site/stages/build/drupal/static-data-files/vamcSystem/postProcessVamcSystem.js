const csv = require('csvtojson');

async function postProcessVamcSystems(queryResult) {
  const processedJSON = {
    data: {
      systems: {},
    },
  };
  const [systems] = queryResult;
  const csvData = await csv().fromString(systems);
  for (const jsonFacility of csvData) {
    if (processedJSON.data.systems[jsonFacility['VAMC system']]) {
      processedJSON.data.systems[jsonFacility['VAMC system']].push([
        jsonFacility['Facility Locator API ID'],
        jsonFacility['VAMC facility name'],
      ]);
    } else {
      processedJSON.data.systems[jsonFacility['VAMC system']] = [
        [
          jsonFacility['Facility Locator API ID'],
          jsonFacility['VAMC facility name'],
        ],
      ];
    }
  }
  return processedJSON;
}
module.exports.postProcessVamcSystems = postProcessVamcSystems;
