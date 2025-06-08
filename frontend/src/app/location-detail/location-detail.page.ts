import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonListHeader, IonSpinner, IonCol, IonIcon, IonRow, IonButton, IonItem, IonLabel, IonInput} from '@ionic/angular/standalone';
import { LongLocation } from '../models/long-location';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LocationsService } from '../services/locations.service';
import { star, starOutline, trash} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ChangeDetectorRef } from '@angular/core';
import { filter } from 'rxjs';
import { ReviewToSend } from '../models/review-to-send';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { ReviewToSendLogged } from '../models/review-to-send-logged';
import { PhotoService } from '../services/photo.service';
import { LocationToSend } from '../models/location-to-send';

@Component({
  selector: 'app-location-detail',
  templateUrl: './location-detail.page.html',
  styleUrls: ['./location-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonListHeader, IonSpinner, IonCol, IonIcon, IonRow, IonButton, IonItem, IonLabel, IonInput]
})
export class LocationDetailPage implements OnInit {
  locationId: string = '';
  changeDetectorRef = inject(ChangeDetectorRef);
  router: Router = inject(Router);
  toastController = inject(ToastController);
  logged = false;
  editing = false;
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
  photoService = inject(PhotoService);
  constructor() {
    addIcons({
      star: star,
      starOutline: starOutline,
      trash: trash
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
  async submitReview() {
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
      await this.getLocation();
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
  private async getLocation() {
    const position = await this.photoService.getLocation();
    if (position) {
      this.reviewLog.Ownlat = position.coords.latitude;
      this.reviewLog.Ownlng = position.coords.longitude;
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
  deleteReview(reviewId: string) {
    this.locationsService.deleteReview(this.locationId, reviewId).subscribe({
      next: (response) => {
        console.log('Review eliminada:', response);
        this.showToast('Comentario eliminado con éxito');
        this.fetchLocation();
      },
      error: (err) => {
        console.error('Error al eliminar review:', err);
        this.showToast('Error al eliminar comentario', 'danger');
      }
    });
  }
  toggleEditing() {
    this.editing = !this.editing;
    if (!this.editing) {
      this.fetchLocation();
    }
  }

  isValid(): boolean {
    const loc = this.location;
    if (!loc.name?.trim()) return false;
    if (!loc.locality?.trim()) return false;
    if (!loc.region?.trim()) return false;
    if (!loc.country?.trim()) return false;
    if (!loc.image?.trim()) return false;
    const coords = loc.locationCoords.coordinates;
    if (!this.isValidCoord(coords)) return false;

    const ownCoords = loc.ownCoords.coordinates;
    if (!this.isValidCoord(ownCoords)) return false;

    return true;
  }

  isValidCoord(coords: number[]): boolean {
    if (!Array.isArray(coords) || coords.length !== 2) return false;
    const [lng, lat] = coords;
    if (typeof lng !== 'number' || typeof lat !== 'number') return false;
    if (lng < -180 || lng > 180) return false;
    if (lat < -90 || lat > 90) return false;
    return true;
  }

  saveLocation() {
    const locationToSend: LocationToSend = {
      name: this.location.name,
      address: this.location.address,
      locality: this.location.locality,
      region: this.location.region,
      country: this.location.country,
      fsq_id: this.location.fsq_id,
      image: this.location.image,
      Otherlat: this.location.ownCoords.coordinates[1],
      Otherlng: this.location.ownCoords.coordinates[0],
      Ownlat: this.location.ownCoords.coordinates[1],
      Ownlng: this.location.ownCoords.coordinates[0],
      date: this.location.date,
      reviews: this.location.reviews,
    }
    if (!this.isValid()) {
      this.showToast('Por favor completa todos los campos correctamente', 'warning');
      return;
    }
    console.log('Guardando ubicación:', locationToSend);
    this.locationsService.updateLocation(locationToSend, this.location._id).subscribe({
      next: () => {
        this.showToast('Ubicación guardada con éxito');
        this.editing = false;
        this.fetchLocation();
      },
      error: err => {
        this.showToast('Error al guardar la ubicación', 'danger');
        console.error(err);
      }
    });
  }
  deleteLocation() {
    this.locationsService.deleteLocation(this.locationId).subscribe({
      next: () => {
        this.showToast('Ubicación eliminada con éxito');
        this.router.navigate(['']);
      },
      error: (err) => {
        console.error('Error al eliminar ubicación:', err);
        this.showToast('Error al eliminar ubicación', 'danger');
      }
    });
  }
}
