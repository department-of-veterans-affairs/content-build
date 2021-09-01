import { expect } from 'chai';
import { pipeDrupalPagesIntoMetalsmith } from '../metalsmith-drupal';
import {
  personProfileWithoutBio,
  personProfileWithBio,
} from './fixtures/metalsmith-drupdal.fixture';

describe('addIdToSubheadings', () => {
  it('should not create a page for a person_profile without a bio', () => {
    const files = {};
    pipeDrupalPagesIntoMetalsmith(personProfileWithoutBio, files);

    expect(files['profile-sans-bio/index.html']).to.equal(undefined);
  });

  it('should create a page for a person_profile with a bio', () => {
    const files = {};
    pipeDrupalPagesIntoMetalsmith(personProfileWithBio, files);

    expect(files['profile-with-bio/index.html']).to.include({
      entityBundle: 'person_profile',
      fieldIntroText: 'This person has a bio',
      fieldBody: 'Lorem ipsum dolor amet',
      layout: 'person_profile.drupal.liquid',
    });
  });
});
