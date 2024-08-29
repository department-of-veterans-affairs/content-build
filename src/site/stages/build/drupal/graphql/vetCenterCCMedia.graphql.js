const mediaFragment = `
  fragment mediaFragment on MediaImage {
      ... on MediaImage {
        entityId
        image {
          alt
          title
          derivative(style: _72MEDIUMTHUMBNAIL) {
            url
          }
        }
      }
  }
`;

const GetVetCenterCCMedia = `
  ${mediaFragment}

  query GetVetCenterCCMedia {
    mediaQuery(limit: 1, filter: {
      conditions: [
        { field: "status", value: ["1"], enabled: true },
        { field: "mid", value: ["35232"] }
      ]
    }) {
      entities {
        ... mediaFragment
      }
    }
  }
`;

module.exports = {
  fragment: mediaFragment,
  GetVetCenterCCMedia,
};
