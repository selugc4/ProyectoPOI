import { mount } from 'cypress/angular';
import { ListPage } from './list.page';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from 'src/environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';

describe('ListPage', () => {
  beforeEach(() => {
    cy.mount(ListPage, {
      providers: [
        provideHttpClient(),
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideAuth(() => getAuth())
      ],
      componentProperties: { locations: mockLocations }
    });
  });
  const mockLocations = [
    {
      _id: '1',
      name: 'Parque Central',
      address: 'Calle Falsa 123',
      locality: 'Ciudad',
      country: 'País',
      image: 'assets/test-image1.png'
    },
    {
      _id: '2',
      name: 'Museo de Arte',
      address: '',
      locality: 'Centro',
      country: 'País',
      image: ''
    }
  ];

  it('should render the list page with title', () => {
    cy.get('ion-title').should('contain.text', 'list');
  });

  it('should render a card for each location', () => {
    cy.get('.location-card').should('have.length', mockLocations.length);
    cy.contains('Parque Central').should('exist');
    cy.contains('Museo de Arte').should('exist');
  });

  it('should display default image if location image is missing', () => {
    cy.get('.location-card').eq(1).find('img').should('have.attr', 'src', 'assets/LocationDefault.png');
  });

  it('should display "Dirección no disponible" if address is missing', () => {
    cy.get('.location-card').eq(1).contains('Dirección no disponible').should('exist');
  });
});
