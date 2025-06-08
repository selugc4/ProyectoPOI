import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonText, IonGrid, IonCol, IonRow, IonCard, IonCardTitle} from '@ionic/angular/standalone';
import { ShortLocation } from '../models/short-location';
import { LocationsService } from '../services/locations.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';


@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonLabel, IonButton, IonText, IonGrid, IonCol, IonRow, IonCard, IonCardTitle]
})
export class SearchPage implements OnInit {
  name = '';
  date = '';
  region = '';
  locations: ShortLocation[] = [];
  locationsService: LocationsService = inject(LocationsService);
  errorMessage = '';
  router: Router = inject(Router);

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const currentRoute = (event as NavigationEnd).url;
        if (!currentRoute.startsWith('/search')) {
          this.resetFields();
        }
      });
  }
  search() {
    const paramsEntered = [this.name?.trim(), this.date?.trim?.(), this.region?.trim()].filter(field => field);
    if (paramsEntered.length > 1) {
      this.errorMessage = 'Por favor, busca solo por uno de estos parámetros a la vez: nombre, fecha o región.';
      this.locations = [];
      return;
    }

    this.errorMessage = '';
    this.locationsService.searchLocations({
      name: this.name || undefined,
      date: this.date || undefined,
      region: this.region || undefined
    }).subscribe({
      next: data => {
        this.locations = data;
        if (data.length === 0) {
          this.errorMessage = 'No se encontraron resultados.';
        }
      },
      error: err => {
        if( err.status === 404) {
          this.errorMessage = 'Error al buscar: No se puede encontrar el POI con el parámetro proporcionados';
        }
        else {
          this.errorMessage = 'Error al buscar: La base de datos no está disponible';
        }
      }
    });
  }
  openLocationDetail(id: string) {
    this.router.navigate(['/location-detail', id]);
  }
  resetFields(){
    this.name = '';
    this.date = '';
    this.region = '';
    this.locations = [];
    this.errorMessage = '';
  }
}
