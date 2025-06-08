import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonListHeader, IonSpinner, IonCol, IonIcon, IonRow, IonButton } from '@ionic/angular/standalone';
import { LongLocation } from '../models/long-location';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocationsService } from '../services/locations.service';
import { star, starOutline} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ChangeDetectorRef } from '@angular/core';
import { filter } from 'rxjs';
import { ReviewToSend } from '../models/review-to-send';
import { ToastController } from '@ionic/angular';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../services/auth.service';
import { ReviewToSendLogged } from '../models/review-to-send-logged';

@Component({
  selector: 'app-location-detail',
  templateUrl: './location-detail.page.html',
  styleUrls: ['./location-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonList, IonListHeader, IonSpinner, IonCol, IonIcon, IonRow, IonButton ]
})
export class LocationDetailPage implements OnInit {
  locationId: string = '';
  changeDetectorRef = inject(ChangeDetectorRef);
  router: Router = inject(Router);
  toastController = inject(ToastController);
  logged = false;
  location: LongLocation = {
    _id: '',
    name: '',
    address: '',
    locality: '',
    region: '',
    country: '',
    fsq_id: '',
    image: '',
    locationCoords: { coordinates: [] },
    ownCoords: { coordinates: [] },
    date: '',
    reviews: []
  };
  review: ReviewToSend = {
    author: '',
    rating: 0,
    reviewText: '',
  };
  reviewLog: ReviewToSendLogged = {
    author: '',
    rating: 0,
    Ownlng: 0,
    Ownlat: 0,
    reviewText: ''
  };
  loading = true;
  errorMessage = '';
  private route = inject(ActivatedRoute);
  private locationsService = inject(LocationsService);
  authService: AuthService = inject(AuthService);
  constructor() {
    addIcons({
      star: star,
      starOutline: starOutline
    });
  }
  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const currentRoute = (event as NavigationEnd).url;
        if (!currentRoute.startsWith('/location-detail')) {
          this.resetReviewForm();
        }
      });
    this.authService['user$'].subscribe(user => {
      this.logged = !!user;
    });
    this.locationId = this.route.snapshot.paramMap.get('id')!;
    this.fetchLocation();
  }
get locationCoordsString(): string {
  return this.location?.locationCoords?.coordinates?.join(', ') ?? 'No disponible';
}

get ownCoordsString(): string {
  return this.location?.ownCoords?.coordinates?.join(', ') ?? 'No disponible';
}
  fetchLocation() {
    this.locationsService.getLocationById(this.locationId).subscribe({
      next: (data) => {
        this.location = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error cargando la ubicación: ' + err.message;
        this.loading = false;
      }
    });
  }
  submitReview() {
    if (!this.logged && (!this.review.author || !this.review.reviewText || this.review.rating <= 0)) {
      this.showToast('Por favor, completa todos los campos del comentario', 'warning');
      return;
    }
    else if (this.logged && (!this.reviewLog.author || !this.reviewLog.reviewText || this.reviewLog.rating <= 0 || !this.location.ownCoords?.coordinates)) {
      this.showToast('Por favor, completa todos los campos del comentario', 'warning');
      return;
    }
    if(!this.logged) {
      this.locationsService.addReview(this.locationId, this.review).subscribe({
        next: (response) => {
          console.log('Review insertada:', response);
          this.showToast('Comentario enviado con éxito');
          this.resetReviewForm();
          this.fetchLocation();
        },
        error: (err) => {
          console.error('Error al insertar review:', err);
          this.showToast('Error al enviar comentario', 'danger');
        }
      });
    }
    else{
      this.reviewLog.Ownlng = 10;
      this.reviewLog.Ownlat = -10;
      console.log('Review a enviar:', this.reviewLog);
      this.locationsService.addReviewLogged(this.locationId, this.reviewLog).subscribe({
        next: (response) => {
          console.log('Review insertada:', response);
          this.showToast('Comentario enviado con éxito');
          this.resetReviewForm();
          this.fetchLocation();
        },
        error: (err) => {
          console.error('Error al insertar review:', err);
          this.showToast('Error al enviar comentario', 'danger');
        }
      });
    }
  }
  resetReviewForm() {
    console.log('Reseteando formulario');
    this.review.author = '';
    this.review.reviewText = '';
    this.review.rating = 0;
    this.reviewLog.author = '';
    this.reviewLog.reviewText = '';
    this.reviewLog.rating = 0;
    this.changeDetectorRef.detectChanges();
  }
  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
