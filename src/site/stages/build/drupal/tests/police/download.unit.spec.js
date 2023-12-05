/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import path from 'path';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { processCurlDataFile } from '../../static-data-files/generate';
import { postProcessPolice } from '../../static-data-files/vaPoliceData/postProcessPolice';

const { pathToFileURL } = require('url');
const getCurlClient = require('../../static-data-files/fetchApi');

/* This is not a FE test but a unit test. */
describe('process police csv files', () => {
  it('should have an error if the police-contact.csv file is missing', async () => {
    const client = getCurlClient({
      'drupal-user': 'eli.selkin@va.gov',
      'drupal-password': 'drupal8',
      'drupal-max-parallel-requests': 10,
    });
    expect(
      processCurlDataFile(
        {
          description: 'Curl',
          filename: 'test-police.json',
          query: [
            pathToFileURL(
              path.join(
                __dirname,
                './fixtures/non-existant-police-contact.csv',
              ),
            ).toString(),
            pathToFileURL(
              path.join(__dirname, './fixtures/non-existant-police.csv'),
            ).toString(),
          ],
          postProcess: postProcessPolice,
        },
        client,
      ),
    ).to.be.rejectedWith(Error);
  });
  it('should process files', async () => {
    const client = getCurlClient({
      'drupal-user': 'eli.selkin@va.gov',
      'drupal-password': 'drupal8',
      'drupal-max-parallel-requests': 10,
    });
    const processedDataFile = await processCurlDataFile(
      {
        description: 'Curl',
        filename: 'test-police.json',
        query: [
          pathToFileURL(
            path.join(__dirname, './fixtures/police-contact.csv'),
          ).toString(),
          pathToFileURL(
            path.join(__dirname, './fixtures/police.csv'),
          ).toString(),
        ],
        postProcess: postProcessPolice,
      },
      client,
    );
    const keys = Object.keys(processedDataFile.data.data.statistics);
    expect(keys).to.contain('vha_635');
    expect(keys).to.contain('vha_523A5');
    expect(processedDataFile.data.data.statistics.vha_635).to.be.an('array');
    expect(processedDataFile.data.data.statistics.vha_523A5).to.be.an('array');
    expect(processedDataFile.data.data.statistics.vha_635[0].VISN).to.be.equal(
      19,
    ); // that way we know processing succeeded
    expect(
      processedDataFile.data.data.statistics.vha_523A5[0].VISN,
    ).to.be.equal(1);
  });
});
