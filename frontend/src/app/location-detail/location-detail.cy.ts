import { LocationDetailPage } from './location-detail.page';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from 'src/environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';

const activatedRouteStub = {
  paramMap: of({ get: (key: string) => '6842310e07c3dd348e75515d' }),
  snapshot: {
    paramMap: {
      get: (key: string) => '6842310e07c3dd348e75515d',
    },
  },
};
describe('LocationDetailPage', () => {
  beforeEach(() => {
    cy.mount(LocationDetailPage, {
      providers: [
        {
          provide: ActivatedRoute, useValue: activatedRouteStub
        },
        provideHttpClient(),
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideAuth(() => getAuth())
      ]
    });
  });

  it('should display the location detail title', () => {
    cy.contains('ion-title', 'location-detail').should('exist');
  });

  it('should show Detalles de la ubicación card title', () => {
    cy.contains('ion-card-title', 'Detalles de la ubicación').should('exist');
  });

  it('should show form fields for location details', () => {
    cy.contains('ion-label', 'Nombre *').should('exist');
    cy.contains('ion-label', 'Dirección').should('exist');
    cy.contains('ion-label', 'Localidad *').should('exist');
    cy.contains('ion-label', 'Región *').should('exist');
    cy.contains('ion-label', 'País *').should('exist');
    cy.contains('ion-label', 'Coordenadas (lng, lat) *').should('exist');
    cy.contains('ion-label', 'Coordenadas propias (lng, lat) *').should('exist');
  });

  it('should show the review section', () => {
    cy.contains('ion-title', '¡Agrega un nuevo comentario al POI!').should('exist');
    cy.get('ion-textarea[placeholder="Escribe tu comentario"]').should('exist');
    cy.contains('ion-button', 'Comentar').should('exist');
  });

  it('should show "No hay comentarios disponibles" if there are no reviews', () => {
    cy.contains('strong', 'No hay comentarios disponibles').should('exist');
  });
});
