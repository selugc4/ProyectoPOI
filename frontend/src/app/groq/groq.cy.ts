import { provideHttpClient } from '@angular/common/http';
import { GroqPage } from './groq.page';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from 'src/environments/environment';

describe('GroqPage', () => {
  beforeEach(() => {
    cy.mount(GroqPage, {
      providers: [
        provideHttpClient(),
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideAuth(() => getAuth())
      ],
    });
  });

  it('should have an input for prompt', () => {
    cy.get('.prompt').should('exist');
  });

  it('should have a submit button', () => {
    cy.get('.boton').contains('Buscar Ruta');
  });
});
