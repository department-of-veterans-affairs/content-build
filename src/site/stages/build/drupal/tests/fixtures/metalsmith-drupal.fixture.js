export const personProfileWithoutBio = {
  data: {
    nodeQuery: {
      entities: [
        {
          entityBundle: 'person_profile',
          entityUrl: { path: 'profile-sans-bio' },
        },
      ],
    },
  },
};

export const personProfileWithBio = {
  data: {
    nodeQuery: {
      entities: [
        {
          entityBundle: 'person_profile',
          entityUrl: { path: 'profile-with-bio' },
          fieldIntroText: 'This person has a bio',
          fieldBody: 'Lorem ipsum dolor amet',
        },
      ],
    },
  },
};
