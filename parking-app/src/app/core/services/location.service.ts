// core/services/location.service.ts
import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private currentLocationSubject = new BehaviorSubject<Location | null>(null);
  public currentLocation$ = this.currentLocationSubject.asObservable();
  
  private isTrackingSubject = new BehaviorSubject<boolean>(false);
  public isTracking$ = this.isTrackingSubject.asObservable();
  
  private locationWatchId: ReturnType<typeof setInterval> | null = null;
  
  constructor() {
    this.requestLocationPermission();
  }
  
  async requestLocationPermission() {
    try {
      const permission = await Geolocation.requestPermissions();
      if (permission.location === 'granted') { // Changed from 'geolocation' to 'location'
        await this.getCurrentLocation();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  }
  
  async getCurrentLocation(): Promise<Location> {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const location: Location = {
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
        accuracy: coordinates.coords.accuracy,
        timestamp: coordinates.timestamp
      };
      this.currentLocationSubject.next(location);
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }
  
  startTracking(intervalMs: number = 5000): void {
    if (this.locationWatchId) {
      return; // Already tracking
    }
    
    this.isTrackingSubject.next(true);
    this.locationWatchId = setInterval(async () => {
      await this.getCurrentLocation();
    }, intervalMs);
  }
  
  stopTracking(): void {
    if (this.locationWatchId) {
      clearInterval(this.locationWatchId); // No need for 'as any' now
      this.locationWatchId = null;
    }
    this.isTrackingSubject.next(false);
  }
  
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  calculateETA(distanceKm: number, avgSpeedKmh: number = 40): number {
    return Math.ceil((distanceKm / avgSpeedKmh) * 60);
  }
}