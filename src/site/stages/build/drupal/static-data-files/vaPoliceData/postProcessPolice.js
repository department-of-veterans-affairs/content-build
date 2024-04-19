const csv = require('csvtojson');

function processJsonPoliceData(unprocessedJson) {
  const processedJSON = {
    VISN: null,
    facilityAPIId: '',
    facilityName: '',
    date: '',
    numServiceCalls: null,
    trafficParkingTickets: null,
    criminalTickets: null,
    arrests: null,
    complaintsInvestigations: null,
    sustainedAllegations: null,
    disciplinaryActions: null,
  };
  for (const [key, value] of Object.entries(unprocessedJson)) {
    switch (key) {
      case 'VISN':
        processedJSON.VISN = parseInt(value, 10);
        break;
      case 'Facility API ID':
        processedJSON.facilityAPIId = value;
        break;
      case 'Facility Name':
        processedJSON.facilityName = value;
        break;
      case 'MM/YYYY':
        processedJSON.date = value;
        break;
      case 'Number of service calls (officer initiated and response to calls)':
        processedJSON.numServiceCalls = parseInt(value, 10);
        break;
      case 'Traffic and parking tickets':
        processedJSON.trafficParkingTickets = parseInt(value, 10);
        break;
      case 'Non-traffic (criminal) tickets':
        processedJSON.criminalTickets = parseInt(value, 10);
        break;
      case 'Arrests':
        processedJSON.arrests = parseInt(value, 10);
        break;
      case 'Complaints and investigations':
        processedJSON.complaintsInvestigations = parseInt(value, 10);
        break;
      case 'Numbers of sustained allegations':
        processedJSON.sustainedAllegations = parseInt(value, 10);
        break;
      case 'Numbers of disciplinary actions':
        processedJSON.disciplinaryActions = parseInt(value, 10);
        break;
      default:
        break;
    }
  }
  return processedJSON;
}

async function postProcessPolice(queryResult) {
  const processedJSON = {
    data: {
      statistics: {}, // keys:facilityAPIId, values: array of objects in processed format
      contacts: {},
    },
  };
  const [contact, ...events] = queryResult;
  if (!contact || !events || events.length === 0) {
    throw new Error(
      'Police data files must have at least one contact file and one events file.',
    );
  }
  const contactData = await csv().fromString(contact);
  const eventsData = await Promise.all(
    events.map(eventsFile => csv().fromString(eventsFile)),
  ); // each file has its own header, but JSON's are the same
  const processedEventsData = eventsData.flat().map(processJsonPoliceData); // convert keys to usable format
  for (const processedEventsDataEntry of processedEventsData) {
    if (
      processedEventsDataEntry.facilityAPIId in processedJSON.data.statistics
    ) {
      processedJSON.data.statistics[
        processedEventsDataEntry.facilityAPIId
      ].push(processedEventsDataEntry);
    } else {
      processedJSON.data.statistics[processedEventsDataEntry.facilityAPIId] = [
        processedEventsDataEntry,
      ];
    }
  }

  processedJSON.data.contacts = contactData;

  // TODO: Process jsonEvents and Join data with contact info for a Facility Police Page content
  return processedJSON;
}
module.exports.postProcessPolice = postProcessPolice;
module.exports.processJsonPoliceData = processJsonPoliceData;
