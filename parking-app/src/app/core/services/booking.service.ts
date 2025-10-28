// core/services/booking.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, BookingStatus } from 'src/app/shared/models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;
  private activeBookingSubject = new BehaviorSubject<Booking | null>(null);
  public activeBooking$ = this.activeBookingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadActiveBooking();
  }

  createBooking(bookingData: any): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/`, bookingData);
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/my_bookings/`);
  }

  getSpaceBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/my_space_bookings/`);
  }

  getBookingDetails(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}/`);
  }

  updateBookingStatus(id: number, status: BookingStatus): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/${id}/update_status/`, { status });
  }

  cancelBooking(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/cancel_booking/`, {});
  }

  updateLocation(id: number, latitude: number, longitude: number, distanceRemaining: number, etaMinutes: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/update_location/`, {
      current_latitude: latitude,
      current_longitude: longitude,
      distance_remaining: distanceRemaining,
      eta_minutes: etaMinutes
    });
  }

  getTrackingInfo(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/tracking_info/`);
  }

  confirmBooking(id: number): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/${id}/confirm_booking/`, {});
  }

  private loadActiveBooking() {
    this.getMyBookings().subscribe(bookings => {
      const active = bookings.find(b => b.status === 'active' || b.status === 'arrived' || b.status === 'parked');
      if (active) {
        this.activeBookingSubject.next(active);
      }
    });
  }

  getActiveBooking(): Booking | null {
    return this.activeBookingSubject.value;
  }
}