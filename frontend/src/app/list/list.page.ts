import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardContent, IonCardTitle} from '@ionic/angular/standalone';
import { ShortLocation } from '../models/short-location';
import { LocationsService } from '../services/locations.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardContent, IonCardTitle]
})
export class ListPage implements OnInit {

  locations: ShortLocation[] = [];
  locationsService: LocationsService = inject(LocationsService);
  router: Router = inject(Router);
  constructor() { }

  ngOnInit() {
    this.getAllLocations();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const currentRoute = (event as NavigationEnd).url;
        if (!currentRoute.startsWith('/list')) {
          this.getAllLocations();
        }
      });
  }
  getAllLocations() {
    this.locationsService.getAllLocations().subscribe({
      next: (data) => {
        this.locations = data;
      },
      error: (err) => {
        console.error('Error al cargar locations:', err);
      }
    });
  }
  openLocationDetail(id: string) {
    this.router.navigate(['/location-detail', id]);
  }
}
