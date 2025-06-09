import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton} from '@ionic/angular/standalone';
import { LocationsService } from '../services/locations.service';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';
import { LocationToSend } from '../models/location-to-send';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.page.html',
  styleUrls: ['./formulario.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem, IonLabel, IonButton]
})
export class FormularioPage implements OnInit {
  location: Partial<LocationToSend> = {};
  loading = false;
  imageSource: string = '';
  imageValid: boolean = true;
  private locationService: LocationsService = inject(LocationsService);
  private authService: AuthService = inject(AuthService);
  private toastController: ToastController = inject(ToastController);
  private photoService: PhotoService = inject(PhotoService);
  constructor() {}
  ngOnInit(): void {
  }

  async onSubmit() {
    this.loading = true;

    try {
      const user = await this.authService.getCurrentUser();
      const position = await this.getCurrentPosition();

      const locationToSend: LocationToSend = {
        name: this.location.name ?? '',
        address: this.location.address ?? '',
        locality: this.location.locality ?? '',
        region: this.location.region ?? '',
        country: this.location.country ?? '',
        fsq_id: this.location.fsq_id ?? '',
        Otherlng: this.location.Otherlng ?? 0,
        Otherlat: this.location.Otherlat ?? 0,
        Ownlng: position?.coords.longitude ?? 0,
        Ownlat: position?.coords.latitude ?? 0,
        image:  this.location.image ?? '',
        createdBy: user?.uid ?? ''
      };

      await this.locationService.insert(locationToSend);
      this.showToast('POI insertado correctamente', 'success');
      this.resetForm();
    } catch (err) {
      console.error(err);
      this.showToast('Error al insertar el POI', 'danger');
    } finally {
      this.loading = false;
    }
  }
  onImageLoad() {
    this.imageValid = true;
  }

  onImageError() {
    if(this.location.image !=''){
      this.imageValid = false;
    }
  }
  private async getCurrentPosition(): Promise<GeolocationPosition | null> {
    try {
      return await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
    } catch {
      return null;
    }
  }

  private resetForm() {
    this.location = {};
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }

  async onImageUrlChange() {
    this.imageSource = 'url';
  }

  async onUploadPhoto() {
    const base64Image = await this.photoService.takePicture();
    if (base64Image) {
      this.location.image = base64Image;
      this.imageSource = 'camera';
    }
  }
  clearImage() {
    this.location.image = '';
    this.imageSource = 'none';
  }
}
