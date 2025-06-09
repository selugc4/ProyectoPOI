import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { LocationsService } from '../services/locations.service';
import { RouteResponse } from '../models/locations-groq';
import { IonButton, IonText, IonItem, IonList, IonLabel, IonSearchbar} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-groq',
  templateUrl: './groq.page.html',
  styleUrls: ['./groq.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonText, IonItem, IonList, IonLabel, IonSearchbar]
})
export class GroqPage implements OnInit {
  city = '';
  locations: RouteResponse | undefined;
  loading = false;
  error = '';
  locationServices: LocationsService = inject(LocationsService);
  authService: AuthService = inject(AuthService);
  constructor() { }

  ngOnInit() {
  }
  async search() {
    this.error = '';
    this.loading = true;
    try {
      const user = await this.authService.getCurrentUser();
      this.locations = await this.locationServices.getRecommendedRoute(this.city, user?.uid ?? '') || [];
      console.log(this.locations)
    } catch (err) {
      this.error = 'No se pudo obtener la ruta';
    }
    this.loading = false;
  }

}
