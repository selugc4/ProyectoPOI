import { inject, Injectable } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.Uri
      });
      return image;
    } catch (error) {
      console.error('Error al capturar la foto:', error);
      return null;
    }
  }
  public async getLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      return position;
    } catch (error) {
      console.error('Error al obtener la geolocalización:', error);
      return null;
    }
  }
}
