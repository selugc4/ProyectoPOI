import { provideHttpClient } from "@angular/common/http";
import { RegisterPage } from "./register.page";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { environment } from "src/environments/environment";
import { getAuth, provideAuth } from "@angular/fire/auth";

describe('Register Page', () => {
  beforeEach(() => {
    cy.mount(RegisterPage, {
      providers: [
        provideHttpClient(),
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideAuth(() => getAuth())
      ],
    });
  });

  it('should display the login form with all fields', () => {
    cy.contains('Regístrate');
    cy.get('ion-input[type="email"]').should('exist');
    cy.get('ion-input[type="password"]').should('exist');
    cy.get('ion-button[type="submit"]').should('exist').and('have.attr', 'disabled');
  });

  it('should show email validation error when email is invalid', () => {
    cy.get('ion-input[type="email"] input').type('texto-no-email');
    cy.get('ion-input[type="email"] input').blur();
    cy.get('.button2').should('have.attr', 'disabled');
  });

  it('should show password validation error when password is too short', () => {
    cy.get('.password input').type('123');
    cy.get('ion-input[type="password"] input').blur();
    cy.get('.button2').should('have.attr', 'disabled');
  });

  it('should enable the login button when form is valid', () => {
    cy.get('ion-input[type="email"] input').type('test@example.com');
    cy.get('ion-input[type="password"] input').type('123456');
    cy.get('ion-button[type="submit"]').should('not.be.disabled');
  });

  it('should submit the form when valid', () => {
    cy.get('ion-input[type="email"] input').type('test@example.com');
    cy.get('ion-input[type="password"] input').type('123456');
    cy.get('ion-button[type="submit"]').click();
  });
});
