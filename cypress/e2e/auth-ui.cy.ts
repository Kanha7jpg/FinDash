describe('Authentication UI', () => {
  it('shows login form and surfaces API error feedback', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: {
        message: 'Invalid credentials'
      }
    }).as('loginRequest');

    cy.visit('/login');
    cy.contains('h1', /sign in/i).should('be.visible');

    cy.get('input[placeholder="Email"]').type('investor@example.com');
    cy.get('input[placeholder="Password"]').type('WrongPassword123!');
    cy.contains('button', /^login$/i).click();

    cy.wait('@loginRequest');
    cy.contains('Invalid credentials').should('be.visible');
  });
});
