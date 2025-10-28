// core/services/parking.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ParkingSpace } from 'src/app/shared/models/parking.model';

@Injectable({
  providedIn: 'root'
})
export class ParkingService {
  private apiUrl = `${environment.apiUrl}/parking-spaces`;
  private parkingSpacesSubject = new BehaviorSubject<ParkingSpace[]>([]);
  public parkingSpaces$ = this.parkingSpacesSubject.asObservable();

  constructor(private http: HttpClient) {}

  searchNearby(latitude: number, longitude: number, radius: number = 5): Observable<ParkingSpace[]> {
    const params = new HttpParams()
      .set('lat', latitude.toString())
      .set('lng', longitude.toString())
      .set('radius', radius.toString());

    return this.http.get<ParkingSpace[]>(`${this.apiUrl}/nearby/`, { params });
  }

  searchByCity(city: string, pageSize: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('city', city)
      .set('page_size', pageSize.toString());

    return this.http.get<any>(`${this.apiUrl}/`, { params });
  }

  searchByFilters(filters: any): Observable<ParkingSpace[]> {
    const params = new HttpParams(
      { fromObject: { ...filters } }
    );

    return this.http.get<ParkingSpace[]>(`${this.apiUrl}/`, { params });
  }

  getParkingSpaceDetails(id: number): Observable<ParkingSpace> {
    return this.http.get<ParkingSpace>(`${this.apiUrl}/${id}/`);
  }

  getOwnerStats(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/owner_stats/`);
  }

  getAvailabilitySlots(id: number, startDate: string, endDate: string): Observable<any[]> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get<any[]>(`${this.apiUrl}/${id}/availability_slots/`, { params });
  }

  createParkingSpace(spaceData: any): Observable<ParkingSpace> {
    return this.http.post<ParkingSpace>(`${this.apiUrl}/`, spaceData);
  }

  updateParkingSpace(id: number, spaceData: any): Observable<ParkingSpace> {
    return this.http.put<ParkingSpace>(`${this.apiUrl}/${id}/`, spaceData);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/update_status/`, { status });
  }

  getOwnerSpaces(): Observable<ParkingSpace[]> {
    return this.http.get<ParkingSpace[]>(`${this.apiUrl}/my_spaces/`);
  }

  deleteParkingSpace(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}