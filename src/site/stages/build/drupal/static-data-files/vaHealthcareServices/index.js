const { JSDOM } = require('jsdom');

const query = `
query {
  taxonomyTermQuery(
    offset: 0
    filter: {conditions: [{field: "vid", value: ["health_care_service_taxonomy"]}]}
    limit: 1000
  ) {
    count
    entities {
      ... on TaxonomyTermHealthCareServiceTaxonomy {
        name
        fieldAlsoKnownAs
        fieldCommonlyTreatedCondition
        fieldHealthServiceApiId
        fieldServiceTypeOfCare
        fieldShowForVetCenters
        fieldShowForVbaFacilities
        fieldShowForVamcFacilities
        fieldTricareSpecificService
        description {
          processed
        }
        descriptionOfTaxonomyTermHealthCareServiceTaxonomy {
          processed
        }
        fieldTricareDescription
        reverseFieldServiceNameAndDescriptiNode {
          count
        }
      }
    }
  }
}
`;

function decodeEntities(str) {
  // this prevents any overhead from creating the object each time
  const dom = new JSDOM(`<!DOCTYPE html><body>${str}</body>`);
  return dom.window.document.body.textContent || '';
}

const postProcess = queryResult => {
  // [{
  //   name: 'name',
  //   fieldAlsoKnownAs: 'aka',
  //   fieldCommonlyTreatedCondition: 'commonconditions',
  //   fieldHealthServiceApiId: 'fieldHealthServiceApiId',
  //   fieldServiceTypeOfCare: 'typeOfCare',
  //   fieldShowForVetCenters: true,
  //   fieldShowForVbaFacilities: true,
  //   fieldShowForVamcFacilities: false,
  //   fieldTricareSpecificService: false,
  //   reverseFieldServiceNameAndDescriptiNode: { count: 0 },
  //   description: 'description',
  //   descriptionOfTaxonomyTermHealthCareServiceTaxonomy: 'descriptionOfTaxonomyTermHealthCareServiceTaxonomy',
  //   fieldTricareDescription: 'fieldTricareDescription'
  // }]
  // GraphQL query filter is pretty bad, so we'll do the filtering here (can't do a successful nested OR on the show for VetCenter,VAMC,VBA fields - it returns 3 elements)
  // 1. Filter out services that are false for fieldShowForVetCenters, fieldShowForVbaFacilities, and fieldShowForVamcFacilities
  // 2. Sort by frequency of use (revereFieldServiceNameAndDescriptiNode.count)
  // 3. Convert to an array of arrays of ["name", "aka", "commonconditions", "fieldHealthServiceApiId", "typeOfCare", true, false, true, false, count]
  const taxonomies = queryResult.data.taxonomyTermQuery.entities
    .filter(
      service =>
        (service.fieldShowForVetCenters ||
          service.fieldShowForVbaFacilities ||
          service.fieldShowForVamcFacilities) &&
        service.reverseFieldServiceNameAndDescriptiNode?.count,
    )
    .map(service => {
      const {
        name,
        fieldAlsoKnownAs,
        fieldCommonlyTreatedCondition,
        fieldHealthServiceApiId,
        fieldServiceTypeOfCare,
        fieldShowForVetCenters,
        fieldShowForVbaFacilities,
        fieldShowForVamcFacilities,
        fieldTricareSpecificService,
        reverseFieldServiceNameAndDescriptiNode,
        description,
        descriptionOfTaxonomyTermHealthCareServiceTaxonomy,
        fieldTricareDescription,
      } = service;
      return [
        name,
        fieldAlsoKnownAs,
        fieldCommonlyTreatedCondition,
        fieldHealthServiceApiId,
        fieldServiceTypeOfCare,
        fieldShowForVetCenters,
        fieldShowForVbaFacilities,
        fieldShowForVamcFacilities,
        fieldTricareSpecificService,
        reverseFieldServiceNameAndDescriptiNode.count, // i=9
        decodeEntities(description?.processed || ''),
        decodeEntities(
          descriptionOfTaxonomyTermHealthCareServiceTaxonomy?.processed || '',
        ),
        decodeEntities(fieldTricareDescription || ''),
      ];
    });
  // descending sort by frequency of use
  taxonomies.sort((a, b) => b[9] - a[9]);
  return taxonomies;
};

module.exports = {
  query,
  postProcess,
};
