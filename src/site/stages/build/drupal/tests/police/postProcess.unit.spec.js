/* eslint-disable camelcase */
/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import path from 'path';
import fs from 'fs-extra';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import csv from 'csvtojson';
import {
  postProcessPolice,
  processJsonPoliceData,
} from '../../static-data-files/vaPoliceData/postProcessPolice';

/* This is not a FE test but a unit test. */
describe('process police csv files', () => {
  const contact = fs.readFileSync(
    path.join(__dirname, 'fixtures/police-contact.csv'),
  );
  const policeData = fs.readFileSync(
    path.join(__dirname, 'fixtures/police.csv'),
  );
  it('should process individual row of police data', async () => {
    const readin = await csv().fromString(policeData.toString('utf-8'));
    const firstLine = readin[0];
    const processed = processJsonPoliceData(firstLine);
    expect(processed).to.deep.equal({
      VISN: 19,
      arrests: 600,
      complaintsInvestigations: 50,
      criminalTickets: 100,
      date: '12/2023',
      disciplinaryActions: 2,
      facilityAPIId: 'avha_635',
      facilityName: 'Oklahoma City VA Medical Center',
      numServiceCalls: 4000,
      sustainedAllegations: 10,
      trafficParkingTickets: 100,
    });
  });
  it('should have an error', async () => {
    const queryResultMock = [policeData.toString('utf-8')];
    expect(await postProcessPolice(queryResultMock)).to.be.an('error');
  });
  it('should process files of CSV content', async () => {
    const queryResultMock = [
      contact.toString('utf-8'),
      policeData.toString('utf-8'),
    ];
    // testing this function
    const processed = await postProcessPolice(queryResultMock);

    expect(processed).to.deep.equal({
      data: {
        contacts: [
          {
            'Contact Name': 'Abc Jameson',
            'Contact Number': '12345689',
            'Facility API ID': 'avha_635',
            VISN: '19',
          },
          {
            'Contact Name': 'Zyz Adamson',
            'Contact Number': '1123456799',
            'Facility API ID': 'avha_523A5',
            VISN: '1',
          },
        ],
        statistics: {
          avha_523A5: [
            {
              VISN: 1,
              arrests: 752,
              complaintsInvestigations: 78,
              criminalTickets: 325,
              date: '12/2023',
              disciplinaryActions: 3,
              facilityAPIId: 'avha_523A5',
              facilityName: 'Brockton VA Medical Center',
              numServiceCalls: 5200,
              sustainedAllegations: 8,
              trafficParkingTickets: 220,
            },
          ],
          avha_635: [
            {
              VISN: 19,
              arrests: 600,
              complaintsInvestigations: 50,
              criminalTickets: 100,
              date: '12/2023',
              disciplinaryActions: 2,
              facilityAPIId: 'avha_635',
              facilityName: 'Oklahoma City VA Medical Center',
              numServiceCalls: 4000,
              sustainedAllegations: 10,
              trafficParkingTickets: 100,
            },
          ],
        },
      },
    });
  });
});
