import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ShortLocation } from '../models/short-location';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  private baseUrl = 'https://twm-a0gahqe6exa7fxh6.westeurope-01.azurewebsites.net/locations/';
  private http = inject(HttpClient);
  getAllLocations(): Observable<ShortLocation[]> {
    return this.http.get<ShortLocation[]>(this.baseUrl);
  }

}
