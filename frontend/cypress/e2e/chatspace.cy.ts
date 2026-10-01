describe('ChatSpace E2E Tests', () => {

  beforeEach(() => {
    cy.visit('http://localhost:4200/login');
  });

  it('should display the login page', () => {
    cy.contains('ChatSpace').should('be.visible');
    cy.contains('Welcome back').should('be.visible');
    cy.contains('Sign in').should('be.visible');
  });

  it('should reject an invalid login', () => {

    cy.intercept('POST', '**/api/auth/login').as('loginRequest');

    cy.get('input').eq(0).type('invaliduser');
    cy.get('input').eq(1).type('wrongpassword');

    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest')
      .its('response.statusCode')
      .should('eq', 401);

    cy.url().should('include', '/login');
  });
  it('should login successfully and open the groups page', () => {

    const username = 'cypresstest';
    const password = 'test123';

    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/auth/register',
      body: {
        username: username,
        password: password
      },
      failOnStatusCode: false
    });

    cy.visit('/login');

    cy.get('input').eq(0).type(username);
    cy.get('input').eq(1).type(password);

    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/groups');

    cy.contains('ChatSpace').should('be.visible');
    cy.contains('Groups').should('be.visible');
  });
});