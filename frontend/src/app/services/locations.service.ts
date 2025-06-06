import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ShortLocation } from '../models/short-location';
import { LongLocation } from '../models/long-location';
import { ReviewToSend } from '../models/review-to-send';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  private baseUrl = 'https://twm-a0gahqe6exa7fxh6.westeurope-01.azurewebsites.net/locations/';
  private http = inject(HttpClient);
  getAllLocations(): Observable<ShortLocation[]> {
    return this.http.get<ShortLocation[]>(this.baseUrl);
  }
  searchLocations(params: { name?: string; date?: string; region?: string }): Observable<ShortLocation[]> {
    let httpParams = new HttpParams();
    if (params.name) {
      httpParams = httpParams.set('name', params.name);
    }
    if (params.date) {
      httpParams = httpParams.set('date', params.date);
    }
    if (params.region) {
      httpParams = httpParams.set('region', params.region);
    }

    return this.http.get<ShortLocation[]>(this.baseUrl, { params: httpParams });
  }
  getLocationById(id: string): Observable<LongLocation> {
    return this.http.get<LongLocation>(`${this.baseUrl}${id}`);
  }
  addReview(locationId: string, review: ReviewToSend): Observable<any> {
    const url = `${this.baseUrl}${locationId}/reviews`;
    return this.http.post(url, review);
  }
}
