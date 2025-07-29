const CountEntityTypes = `
{

  benefitPages: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["page"]}
      ]}
  	) {
    count
  }

  vaForm: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["va_form"]}
      ]}
  	) {
    count
  }

  vetCenters: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["vet_center"]}
      ]}
  	) {
    count
  }

  vbaFacilities: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["vba_facility"]}
      ]}
  	) {
    count
  }

  healthCareLocalFacility: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["health_care_local_facility"]}
      ]}
  	) {
    count
  }

  healthServicesListing: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["health_services_listing"]}
      ]}
  	) {
    count
  }

  healthCareRegionDetailPage: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["health_care_region_detail_page"]}
      ]}
  	) {
    count
  }

  healthCareRegionPage: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["health_care_region_page"]}
      ]}
  	) {
    count
  }

  office: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["office"]}
      ]}
  	) {
    count
  }

  nodeQa: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["q_a"]}
      ]}
  	) {
    count
  }
}
`;

module.exports = {
  CountEntityTypes,
};
