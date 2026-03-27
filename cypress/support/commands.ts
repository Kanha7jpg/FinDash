declare global {
  namespace Cypress {
    interface Chainable {
      apiUrl(path: string): Chainable<string>;
    }
  }
}

Cypress.Commands.add('apiUrl', (path: string) => {
  const base = String(Cypress.env('apiUrl') || '').replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return cy.wrap(`${base}${suffix}`);
});

export {};
