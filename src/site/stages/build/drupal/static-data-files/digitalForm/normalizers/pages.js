const { normalizeComponent } = require('./components');

/**
 *
 * @param {Array<Object>} pages
 * @returns {Array<Object>}
 */
const normalizePages = pages =>
  pages.map(({ entity: pageEntity }) => ({
    bodyText: pageEntity.fieldDigitalFormBodyText,
    components: pageEntity.fieldDigitalFormComponents.map(
      ({ entity: componentEntity }) => normalizeComponent(componentEntity),
    ),
    id: pageEntity.entityId,
    pageTitle: pageEntity.fieldTitle,
  }));

module.exports = { normalizePages };
