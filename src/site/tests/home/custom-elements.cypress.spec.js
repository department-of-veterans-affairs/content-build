const webComponentDocs = require('@department-of-veterans-affairs/web-components/component-docs.json');

const webComponentTags = webComponentDocs.components.map(comp => comp.tag);

describe('Web Components', () => {
  it('browser has VADS web components defined in its registry', () => {
    cy.visit('/');
    cy.window().then(window => {
      webComponentTags.forEach(tag => {
        const customElement = window.customElements.get(tag);
        assert.isFunction(customElement);
      });
    });
  });
});
