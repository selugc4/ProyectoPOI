import { provideHttpClient } from "@angular/common/http";
import { SearchPOIsPage } from "./search-pois.page";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { environment } from "src/environments/environment";
import { getAuth, provideAuth } from "@angular/fire/auth";

describe('SearchPois Page', () => {
  beforeEach(() => {
    cy.mount(SearchPOIsPage, {
      providers: [
        provideHttpClient(),
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideAuth(() => getAuth())
      ],
    });
  });

  it('should display the page title', () => {
    cy.contains('ion-title', 'Buscador de ubicaciones').should('be.visible');
  });

  it('should display all search input fields', () => {
    cy.get('ion-input[name="searchName"] input').should('exist');
    cy.get('ion-input[name="searchLat"] input').should('exist');
    cy.get('ion-input[name="searchLng"] input').should('exist');
  });

  it('should allow typing in the search fields', () => {
    cy.get('ion-input[name="searchName"] input').type('Museo', { force: true });
    cy.get('ion-input[name="searchLat"] input').type('40.4168', { force: true });
    cy.get('ion-input[name="searchLng"] input').type('-3.7038', { force: true });
  });
  it('should show "No hay POIs añadidos aún." when no POIs are added', () => {
    cy.contains('No hay POIs añadidos aún.').should('be.visible');
  });
});
