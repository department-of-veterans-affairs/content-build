/* eslint-disable @department-of-veterans-affairs/axe-check-required */

import { expect } from 'chai';
import queryResult from '../fixtures/queryResult.json';
import { normalizePages } from '../../normalizers/pages';

describe('normalizePages', () => {
  const queryForm = queryResult.data.nodeQuery.entities[1];
  const queryChapter = queryForm.fieldChapters.find(
    chapter =>
      chapter.entity.type.entity.entityId === 'digital_form_custom_step',
  );
  const normalizedPages = normalizePages(
    queryChapter.entity.fieldDigitalFormPages,
  );
  const normalizedPage = normalizedPages[0];
  const queryEntity = queryChapter.entity;
  const queryPage = queryEntity.fieldDigitalFormPages[0].entity;

  it('includes the correct number of pages', () => {
    expect(normalizedPages.length).to.eq(
      queryEntity.fieldDigitalFormPages.length,
    );
  });

  it('includes the entity ID', () => {
    expect(normalizedPage.id).to.eq(queryPage.entityId);
  });

  it('includes the correct page title', () => {
    expect(normalizedPage.pageTitle).to.eq(queryPage.fieldTitle);
  });

  it('includes the correct body text', () => {
    expect(normalizedPage.bodyText).to.eq(queryPage.fieldDigitalFormBodyText);
  });

  it('include the correct number of components', () => {
    expect(normalizedPage.components.length).to.eq(
      queryPage.fieldDigitalFormComponents.length,
    );
  });

  it('includes an ID for components', () => {
    expect(normalizedPage.components[0].id).to.eq(
      queryPage.fieldDigitalFormComponents[0].entity.entityId,
    );
  });
});
