import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { LocationsService } from '../services/locations.service';
import { LocationsGroq } from '../models/locations-groq';
import { IonButton, IonText, IonItem, IonList, IonLabel} from '@ionic/angular/standalone';

@Component({
  selector: 'app-groq',
  templateUrl: './groq.page.html',
  styleUrls: ['./groq.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonText, IonItem, IonList, IonLabel]
})
export class GroqPage implements OnInit {
  city = '';
  userId = 'user123';
  locations: LocationsGroq[] = [];
  loading = false;
  error = '';
  locationServices: LocationsService = inject(LocationsService);
  constructor() { }

  ngOnInit() {
  }
  async search() {
    this.error = '';
    this.loading = true;
    this.locations = [];
    try {
      this.locations = await this.locationServices.getRecommendedRoute(this.city, this.userId) || [];
    } catch (err) {
      this.error = 'No se pudo obtener la ruta';
    }
    this.loading = false;
  }

}
