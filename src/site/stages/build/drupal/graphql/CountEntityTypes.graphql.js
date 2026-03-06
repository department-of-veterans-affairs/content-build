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

  landingPage: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["landing_page"]}
      ]}
  	) {
    count
  }

  publicationListing: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["publication_listing"]}
      ]}
  	) {
    count
  }

  faqMultipleQa: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["faq_multiple_q_a"]}
      ]}
  	) {
    count
  }

  stepByStep: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["step_by_step"]}
      ]}
  	) {
    count
  }

  mediaListImages: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["media_list_images"]}
      ]}
  	) {
    count
  }

  checklist: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["checklist"]}
      ]}
  	) {
    count
  }

  mediaListVideos: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["media_list_videos"]}
      ]}
  	) {
    count
  }

  supportResourcesDetailPage: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["support_resources_detail_page"]}
      ]}
  	) {
    count
  }

  basicLandingPage: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["basic_landing_page"]}
      ]}
  	) {
    count
  }

  campaignLandingPage: nodeQuery(
    filter: {
      conditions: [
        {field: "status", value: ["1"]},
        {field: "type", value: ["campaign_landing_page"]}
      ]}
  	) {
    count
  }
}
`;

module.exports = {
  CountEntityTypes,
};
