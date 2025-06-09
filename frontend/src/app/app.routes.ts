import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    children: [
      {
        path: 'search',
        loadComponent: () =>
          import('./search/search.page').then(m => m.SearchPage),
      },
      {
        path: 'list',
        loadComponent: () =>
          import('./list/list.page').then(m => m.ListPage),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./register/register.page').then(m => m.RegisterPage),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./login/login.page').then(m => m.LoginPage),
      },
      {
        path: 'location-detail/:id',
        loadComponent: () => import('./location-detail/location-detail.page').then( m => m.LocationDetailPage)
      },
      {
        path: 'search-pois',
        loadComponent: () => import('./search-pois/search-pois.page').then( m => m.SearchPOIsPage)
      },
      {
        path: 'formulario',
        loadComponent: () => import('./formulario/formulario.page').then( m => m.FormularioPage)
      },
      {
        path: '',
        redirectTo: 'search',
        pathMatch: 'full',
      },
    ]
  },


];
