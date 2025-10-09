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
