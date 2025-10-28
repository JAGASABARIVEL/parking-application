// core/services/vehicle.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DriverVehicle } from 'src/app/shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehicles`;
  private vehiclesSubject = new BehaviorSubject<DriverVehicle[]>([]);
  public vehicles$ = this.vehiclesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadVehicles();
  }

  registerVehicle(vehicleData: FormData): Observable<DriverVehicle> {
    return this.http.post<DriverVehicle>(`${this.apiUrl}/`, vehicleData).pipe(
      tap(() => this.loadVehicles())
    );
  }

  getVehicles(): Observable<DriverVehicle[]> {
    return this.http.get<DriverVehicle[]>(`${this.apiUrl}/`).pipe(
      tap(vehicles => this.vehiclesSubject.next(vehicles))
    );
  }

  getActiveVehicles(): Observable<DriverVehicle[]> {
    return this.http.get<DriverVehicle[]>(`${this.apiUrl}/active_vehicles/`);
  }

  updateVehicle(id: number, vehicleData: any): Observable<DriverVehicle> {
    return this.http.put<DriverVehicle>(`${this.apiUrl}/${id}/`, vehicleData).pipe(
      tap(() => this.loadVehicles())
    );
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`).pipe(
      tap(() => this.loadVehicles())
    );
  }

  private loadVehicles() {
    this.getVehicles().subscribe();
  }
}