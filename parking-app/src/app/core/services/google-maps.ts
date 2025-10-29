// core/services/google-maps.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;

  constructor() {}

  /**
   * Load Google Maps script
   */
  load(): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };

      script.onerror = (error) => {
        console.error('Error loading Google Maps:', error);
        reject(error);
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Create a map instance
   */
  async createMap(
    element: HTMLElement,
    options: {
      center: { lat: number; lng: number };
      zoom?: number;
      mapTypeId?: string;
    }
  ): Promise<any> {
    await this.load();

    const defaultOptions = {
      zoom: options.zoom || 15,
      mapTypeId: options.mapTypeId || 'roadmap',
      center: options.center,
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: true
    };

    return new google.maps.Map(element, defaultOptions);
  }

  /**
   * Add a marker to the map
   */
  async addMarker(
    map: any,
    position: { lat: number; lng: number },
    options?: {
      title?: string;
      icon?: string;
      draggable?: boolean;
      animation?: string;
    }
  ): Promise<any> {
    await this.load();

    const markerOptions: any = {
      position,
      map,
      title: options?.title || '',
      draggable: options?.draggable || false
    };

    if (options?.icon) {
      markerOptions.icon = options.icon;
    }

    if (options?.animation) {
      markerOptions.animation = google.maps.Animation[options.animation];
    }

    return new google.maps.Marker(markerOptions);
  }

  /**
   * Add an info window
   */
  async addInfoWindow(
    marker: any,
    content: string
  ): Promise<any> {
    await this.load();

    const infoWindow = new google.maps.InfoWindow({
      content
    });

    marker.addListener('click', () => {
      infoWindow.open(marker.getMap(), marker);
    });

    return infoWindow;
  }

  /**
   * Calculate route between two points
   */
  async calculateRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    travelMode: string = 'DRIVING'
  ): Promise<any> {
    await this.load();

    const directionsService = new google.maps.DirectionsService();

    return new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode[travelMode]
        },
        (result: any, status: any) => {
          if (status === 'OK') {
            resolve(result);
          } else {
            reject(status);
          }
        }
      );
    });
  }

  /**
   * Display route on map
   */
  async displayRoute(
    map: any,
    route: any,
    supressMarker:boolean=false
  ): Promise<any> {
    await this.load();

    const directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: supressMarker,
      polylineOptions: {
        strokeColor: '#3498db',
        strokeWeight: 5
      }
    });

    directionsRenderer.setDirections(route);
    return directionsRenderer;
  }

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    await this.load();

    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          reject(`Geocoding failed: ${status}`);
        }
      });
    });
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(
    lat: number,
    lng: number
  ): Promise<string> {
    await this.load();

    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latlng }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(`Reverse geocoding failed: ${status}`);
        }
      });
    });
  }

  /**
   * Setup autocomplete for address input
   */
  async setupAutocomplete(
    inputElement: HTMLInputElement,
    onPlaceSelected: (place: any) => void
  ): Promise<any> {
    await this.load();

    const autocomplete = new google.maps.places.Autocomplete(inputElement, {
      types: ['address'],
      componentRestrictions: { country: 'IN' } // Restrict to India
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        onPlaceSelected(place);
      }
    });

    return autocomplete;
  }

  /**
   * Calculate distance between two points (using Google Maps API)
   */
  async calculateDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<{ distance: number; duration: number }> {
    await this.load();

    const service = new google.maps.DistanceMatrixService();

    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: 'DRIVING',
          unitSystem: google.maps.UnitSystem.METRIC
        },
        (response: any, status: any) => {
          if (status === 'OK' && response.rows[0]?.elements[0]) {
            const element = response.rows[0].elements[0];
            if (element.status === 'OK') {
              resolve({
                distance: element.distance.value / 1000, // Convert to km
                duration: element.duration.value / 60 // Convert to minutes
              });
            } else {
              reject('Route not found');
            }
          } else {
            reject(`Distance Matrix failed: ${status}`);
          }
        }
      );
    });
  }

  /**
   * Add circle overlay (for radius visualization)
   */
  async addCircle(
    map: any,
    center: { lat: number; lng: number },
    radius: number, // in meters
    options?: {
      fillColor?: string;
      strokeColor?: string;
      fillOpacity?: number;
      strokeOpacity?: number;
      strokeWeight?: number;
    }
  ): Promise<any> {
    await this.load();

    const circleOptions = {
      strokeColor: options?.strokeColor || '#3498db',
      strokeOpacity: options?.strokeOpacity || 0.8,
      strokeWeight: options?.strokeWeight || 2,
      fillColor: options?.fillColor || '#3498db',
      fillOpacity: options?.fillOpacity || 0.2,
      map,
      center,
      radius
    };

    return new google.maps.Circle(circleOptions);
  }
}