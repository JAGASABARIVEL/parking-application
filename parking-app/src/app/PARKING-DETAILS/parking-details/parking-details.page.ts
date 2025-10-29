// PARKING-DETAILS/parking-details/parking-details.page.ts (Updated)
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParkingService } from '../../core/services/parking.service';
import { LocationService } from '../../core/services/location.service';
import { AlertController } from '@ionic/angular';
import { GoogleMapsService } from 'src/app/core/services/google-maps';

// Declare google for TypeScript
declare var google: any;

@Component({
  selector: 'app-parking-details',
  templateUrl: 'parking-details.page.html',
  styleUrls: ['parking-details.page.scss'],
  standalone: false,
})
export class ParkingDetailsPage implements OnInit, AfterViewInit {
  parkingSpace: any = null;
  isLoading = true;
  distance: number | null = null;
  topReviews: any[] = [];
  private map: any = null;
  private parkingId: number | null = null;

  constructor(
    private parkingService: ParkingService,
    private locationService: LocationService,
    private googleMapsService: GoogleMapsService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.parkingId = params['id'];
        this.loadParkingDetails(params['id']);
      }
    });
  }

  ngAfterViewInit() {
    // Map will be initialized after data is loaded
  }

  ionViewDidEnter() {
    if (this.parkingSpace && !this.map) {
      setTimeout(() => {
        this.initializeMap();
      }, 300);
    }
  }

  loadParkingDetails(id: number) {
    this.isLoading = true;
    this.parkingService.getParkingSpaceDetails(id).subscribe(
      (space: any) => {
        this.parkingSpace = space;
        this.topReviews = space.reviews ? space.reviews.slice(0, 3) : [];
        this.calculateDistance();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading parking details:', error);
        this.isLoading = false;
      }
    );
  }

  /**
   * Parse location string from Django GIS format
   */
  private parseLocation(locStr: string): { lat: number; lng: number } | null {
    // Example: "SRID=4326;POINT (77.869875 9.152102)"
    const match = locStr.match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/);
    
    if (!match) {
      console.error('Could not parse location string:', locStr);
      return null;
    }

    return {
      lng: parseFloat(match[1]),
      lat: parseFloat(match[2])
    };
  }

  async initializeMap() {
    if (!this.parkingSpace || !this.parkingId) return;

    try {
      const mapElement = document.getElementById(`map-${this.parkingId}`);
      if (!mapElement) {
        console.error('Map element not found');
        return;
      }

      // Parse location from string
      const position = this.parseLocation(this.parkingSpace.location);
      if (!position) {
        console.error('Invalid location data');
        return;
      }

      // Create map
      this.map = await this.googleMapsService.createMap(mapElement, {
        center: position,
        zoom: 16
      });

      // Add marker for parking space
      const marker = await this.googleMapsService.addMarker(
        this.map,
        position,
        {
          title: this.parkingSpace.title,
          animation: 'DROP'
        }
      );

      // Add info window
      const infoContent = `
        <div style="padding: 10px;">
          <h3 style="margin: 0 0 5px 0;">${this.parkingSpace.title}</h3>
          <p style="margin: 0;">${this.parkingSpace.address}</p>
          <p style="margin: 5px 0 0 0; color: #3498db; font-weight: bold;">
            ₹${this.parkingSpace.price_per_day}/day
          </p>
        </div>
      `;
      await this.googleMapsService.addInfoWindow(marker, infoContent);

      // Get user location and show route
      this.showRouteToParking(position);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  async showRouteToParking(destination: { lat: number; lng: number }) {
    try {
      const userLocation = await this.locationService.getCurrentLocation();
      const origin = {
        lat: userLocation.latitude,
        lng: userLocation.longitude
      };

      // Add marker for user location
      await this.googleMapsService.addMarker(
        this.map,
        origin,
        {
          title: 'Your Location',
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
      );

      // Try to calculate and display route
      try {
        const route = await this.googleMapsService.calculateRoute(
          origin,
          destination
        );
        await this.googleMapsService.displayRoute(this.map, route, true);

        // Try to get accurate distance using Google Maps API
        try {
          const distanceData = await this.googleMapsService.calculateDistance(
            origin,
            destination
          );
          this.distance = distanceData.distance;
        } catch (distanceError) {
          console.warn('Distance Matrix API not available, using Haversine formula');
          // Fallback to Haversine formula if Distance Matrix API is not enabled
          this.distance = this.locationService.calculateDistance(
            origin.lat,
            origin.lng,
            destination.lat,
            destination.lng
          );
        }
      } catch (routeError) {
        console.warn('Directions API not available:', routeError);
        // Just calculate straight-line distance if routing fails
        this.distance = this.locationService.calculateDistance(
          origin.lat,
          origin.lng,
          destination.lat,
          destination.lng
        );
      }
    } catch (error) {
      console.error('Error showing route:', error);
      // Fallback: just show the distance without route
      this.calculateDistance();
    }
  }

  calculateDistance() {
    if (!this.parkingSpace) return;

    const position = this.parseLocation(this.parkingSpace.location);
    if (!position) return;

    this.locationService.getCurrentLocation().then(location => {
      this.distance = this.locationService.calculateDistance(
        location.latitude,
        location.longitude,
        position.lat,
        position.lng
      );
    }).catch(error => {
      console.error('Error calculating distance:', error);
    });
  }

  startBooking() {
    if (!this.parkingSpace) return;
    this.router.navigate(['/booking', this.parkingSpace.id]);
  }

  callOwner() {
    if (this.parkingSpace?.owner?.phone_number) {
      const phoneNumber = this.parkingSpace.owner.phone_number;
      // Open phone dialer
      window.open(`tel:${phoneNumber}`, '_system');
    } else {
      this.showAlert('Contact Info', 'Owner contact number not available');
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}