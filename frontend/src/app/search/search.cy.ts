import { provideHttpClient } from "@angular/common/http";
import { SearchPage } from "./search.page";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { environment } from "src/environments/environment";
import { getAuth, provideAuth } from "@angular/fire/auth";

describe('Search Page', () => {
  beforeEach(() => {
    cy.mount(SearchPage, {
      providers: [
        provideHttpClient(),
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideAuth(() => getAuth())
      ],
    });
  });

  it('should display the search page title', () => {
    cy.contains('ion-title', 'search').should('be.visible');
  });

  it('should display all search input fields', () => {
    cy.get('ion-input[name="name"]').should('exist');
    cy.get('ion-input[name="date"]').should('exist');
    cy.get('ion-input[name="region"]').should('exist');
  });

  it('should allow typing in the search fields', () => {
    cy.get('ion-input[name="name"] input').type('Museo');
    cy.get('ion-input[name="name"] input').should('have.value', 'Museo');

    cy.get('ion-input[name="date"] input').type('2024-06-01');
    cy.get('ion-input[name="date"] input').should('have.value', '2024-06-01');

    cy.get('ion-input[name="region"] input').type('Madrid');
    cy.get('ion-input[name="region"] input').should('have.value', 'Madrid');
  });
  it('should trigger search when clicking the Buscar button', () => {
    cy.get('ion-button').contains('Buscar').click();
  });
});
