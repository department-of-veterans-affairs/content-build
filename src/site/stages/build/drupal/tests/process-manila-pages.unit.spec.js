/* eslint-disable @department-of-veterans-affairs/axe-check-required */
const { expect } = require('chai');
const { processManilaPages } = require('../process-manila-pages');

describe('processManilaPages', () => {
  it('should process Manila VA Clinic pages and update links', () => {
    const mockDrupalData = {
      data: {
        nodeQuery: {
          entities: [
            {
              fieldAdministration: {
                entity: {
                  entityId: '1187',
                },
              },
              entityUrl: {
                path: '/manila-va-system/test',
                breadcrumb: [
                  { url: '/manila-va-system' },
                  { url: '/manila-va-system/test' },
                ],
              },
              fieldOffice: {
                entity: {
                  entityUrl: {
                    path: '/manila-va-system/office',
                  },
                },
              },
              fieldListing: {
                entity: {
                  entityUrl: {
                    path: '/manila-va-system/listing',
                  },
                },
              },
            },
            {
              fieldAdministration: {
                entity: {
                  entityId: '999',
                },
              },
              entityUrl: {
                path: '/other-path',
              },
            },
          ],
        },
      },
    };

    processManilaPages(mockDrupalData);

    const processedEntities = mockDrupalData.data.nodeQuery.entities;
    const manilaPage = processedEntities[0];
    const otherPage = processedEntities[1];

    expect(manilaPage.entityUrl.path).to.equal('/manila-va-clinic/test');
    expect(manilaPage.entityUrl.breadcrumb[0].url).to.equal(
      '/manila-va-clinic',
    );
    expect(manilaPage.entityUrl.breadcrumb[1].url).to.equal(
      '/manila-va-clinic/test',
    );
    expect(manilaPage.fieldOffice.entity.entityUrl.path).to.equal(
      '/manila-va-clinic/office',
    );
    expect(manilaPage.fieldListing.entity.entityUrl.path).to.equal(
      '/manila-va-clinic/listing',
    );
    expect(otherPage.entityUrl.path).to.equal('/other-path');
  });

  it('should handle empty data gracefully', () => {
    const emptyDrupalData = {
      data: {
        nodeQuery: {
          entities: [],
        },
      },
    };

    processManilaPages(emptyDrupalData);
    expect(emptyDrupalData.data.nodeQuery.entities).to.deep.equal([]);
  });
});
