describe('API smoke checks', () => {
  it('validates auth route contract on malformed login payload', () => {
    cy.apiUrl('/auth/login').then((url) => {
      cy.request({
        method: 'POST',
        url,
        failOnStatusCode: false,
        body: {
          email: 'invalid-email',
          password: 'short'
        }
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.message).to.eq('Validation failed');
      });
    });
  });

  it('requires authorization on portfolio endpoints', () => {
    cy.apiUrl('/portfolios').then((url) => {
      cy.request({
        method: 'GET',
        url,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body.message).to.eq('Unauthorized');
      });
    });
  });

  it('validates stock search query contract', () => {
    cy.apiUrl('/stocks/search').then((url) => {
      cy.request({
        method: 'GET',
        url,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(422);
        expect(response.body.message).to.eq('Validation failed');
      });
    });
  });
});
