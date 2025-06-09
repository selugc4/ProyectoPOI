import { inject, Injectable } from '@angular/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public async takePicture() {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
      });
      return photo.base64String ? `data:image/jpeg;base64,${photo.base64String}` : null;
    } catch (error) {
      console.error('Error al tomar foto:', error);
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
