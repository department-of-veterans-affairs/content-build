/* eslint-disable camelcase */
import fs from 'fs-extra';
import path from 'path';
import { expect } from 'chai';
import { postProcessVamcSystems } from '../../static-data-files/vamcSystem/postProcessVamcSystem';

describe('postProcessVamcSystems', () => {
  // Not a cypress test, but a unit test
  // eslint-disable-next-line @department-of-veterans-affairs/axe-check-required
  it('should process CSV string to JSON', async () => {
    const csvString = fs.readFileSync(
      path.join(__dirname, 'fixtures/va-gov-cms-vamc-facilities-sample.csv'),
    );
    const expectedOutput = {
      data: {
        systems: {
          'VA Pittsburgh health care': {
            vha_646GC: 'Beaver County VA Clinic',
            vha_646GA: 'Belmont County VA Clinic',
            vha_646GE: 'Fayette County VA Clinic',
            vha_646A4:
              'H. John Heinz III Department of Veterans Affairs Medical Center',
            vha_646GF: 'Monroeville VA Clinic',
            vha_646: 'Pittsburgh VA Medical Center-University Drive',
            vha_646GD: 'Washington County VA Clinic',
            vha_646GB: 'Westmoreland County VA Clinic',
          },
          'VA Altoona health care': {
            vha_503GB: 'DuBois VA Clinic',
            vha_503GD: 'Huntingdon County VA Clinic',
            vha_503GE: 'Indiana County VA Clinic',
            vha_503:
              "James E. Van Zandt Veterans' Administration Medical Center",
            vha_503GA: 'Johnstown VA Clinic',
            vha_503GC: 'State College VA Clinic',
          },
        },
      },
    };
    const result = await postProcessVamcSystems([csvString.toString('utf-8')]);
    expect(result).to.deep.equal(expectedOutput);
  });
});
