import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonText, IonList, IonGrid, IonCol, IonCard, IonRow, IonCardTitle} from '@ionic/angular/standalone';
import { LocationToSend } from '../models/location-to-send';
import { LocationsService } from '../services/locations.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-search-pois',
  templateUrl: './search-pois.page.html',
  styleUrls: ['./search-pois.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonLabel, IonButton, IonText, IonList, IonGrid, IonCol, IonCard, IonRow, IonCardTitle]
})
export class SearchPOIsPage implements OnInit {

  searchName: string = '';
  searchLat: number | null = null;
  searchLng: number | null = null;
  results: LocationToSend[] = [];
  locationService: LocationsService = inject(LocationsService);
  loading = false;
  errorMessage = '';
  addedPois: LocationToSend[] = [];
  saving = false;
  authService: AuthService = inject(AuthService);
  constructor() {}
  ngOnInit(): void {
  }
addPoi(loc: any) {
  if (!this.addedPois.some(poi => poi.fsq_id === loc.fsq_id)) {
    this.addedPois.push(loc);
  }
}

removePoi(index: number) {
  this.addedPois.splice(index, 1);
}
async onSearch() {
  this.errorMessage = '';
  this.results = [];

  const lat = this.searchLat ?? undefined;
  const lng = this.searchLng ?? undefined;
  const hasName = !!this.searchName?.trim();
  const hasCoords = lat !== undefined && lng !== undefined;
  if (hasCoords) {
    if (lat! < -90 || lat! > 90 || lng! < -180 || lng! > 180) {
      this.errorMessage = 'Las coordenadas no son válidas.';
      return;
    }
  }
  if (!hasName && !hasCoords) {
    this.errorMessage = 'Por favor, introduce un nombre o coordenadas válidas para buscar.';
    return;
  }

  this.loading = true;

  try {
    this.results = await this.locationService.getApiPOIs(
      this.searchName || '',
      lat,
      lng
    );

    if (this.results.length === 0) {
      this.errorMessage = 'No se encontraron resultados para esos criterios.';
    }
  } catch (error) {
    this.errorMessage = 'Error al buscar ubicaciones.';
    console.error(error);
    this.results = [];
  } finally {
    this.loading = false;
  }
}
async guardarPois() {
  this.saving = true;
  try {
    const user = await this.authService.getCurrentUser();
    if (!user || !user.uid) {
      throw new Error('Usuario no autenticado');
    }

    // Asignar el uid a cada POI antes de enviarlos
    const locationsConUid = this.addedPois.map(poi => ({
      ...poi,
      createdBy: user.uid
    }));
    console.log(locationsConUid);
    await this.locationService.insertMany(locationsConUid);
    this.resetFormulario();
  } catch (err) {
    console.error('Error al guardar POIs:', err);
    this.errorMessage = 'Error al guardar los POIs.';
  } finally {
    this.saving = false;
  }
}

resetFormulario() {
  this.searchName = '';
  this.searchLat = null;
  this.searchLng = null;
  this.results = [];
  this.addedPois = [];
  this.errorMessage = '';
}
}
