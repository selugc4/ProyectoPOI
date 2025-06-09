/// <reference types="cypress" />

import { getAuth, provideAuth } from '@angular/fire/auth';
import { FormularioPage } from './formulario.page';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from 'src/environments/environment';
import { ReactiveFormsModule } from '@angular/forms';

describe('FormularioPage', () => {
  beforeEach(() => {
    cy.mount(FormularioPage, {
      providers: [
        provideHttpClient(),
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideAuth(() => getAuth())
      ],
      imports: [
        ReactiveFormsModule,
      ]
    });
  });

  it('debería mostrar el formulario', () => {
    cy.get('form').should('exist');
  });

  it('debería tener campos requeridos', () => {
    cy.get('.name').should('exist');
    cy.get('.address').should('exist');
    cy.get('.locality').should('exist');
    cy.get('.region').should('exist');
    cy.get('.country').should('exist');
    cy.get('.image').should('exist');
  });

  it('El botón debería debe estar deshabilitado', () => {
    cy.get('ion-button[type="submit"]').should('have.attr', 'disabled');
  });

  it('debería permitir escribir en los campos', () => {
    cy.get('.name').type('Juan');
    cy.get('.address').type('Hola, este es un mensaje de prueba.');
    cy.get('.locality').type('Hola, este es un mensaje de prueba.');
    cy.get('.region').type('Hola, este es un mensaje de prueba.');
    cy.get('.country').type('Hola, este es un mensaje de prueba.');
    cy.get('.image').type('Hola, este es un mensaje de prueba.');
  });
    it('debería permitir escribir en los campos y enviar el resultado', () => {
    cy.get('.name').type('Juan');
    cy.get('.address').type('Hola, este es un mensaje de prueba.');
    cy.get('.locality').type('Hola, este es un mensaje de prueba.');
    cy.get('.region').type('Hola, este es un mensaje de prueba.');
    cy.get('.country').type('Hola, este es un mensaje de prueba.');
    cy.get('.image').type('https://www.freeiconspng.com/uploads/location-black-png-10.png');
    cy.get('ion-button[type="submit"]').should('not.have.attr', 'disabled');
  });
});
