// ACTIVE-BOOKING/active-booking/active-booking.page.ts (Updated)
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { LocationService } from '../../core/services/location.service';
import { AlertController } from '@ionic/angular';
import { GoogleMapsService } from 'src/app/core/services/google-maps';

@Component({
  selector: 'app-active-booking',
  templateUrl: 'active-booking.page.html',
  styleUrls: ['active-booking.page.scss'],
  standalone: false
})
export class ActiveBookingPage implements OnInit, OnDestroy, AfterViewInit {
  booking: any = null;
  timeRemaining = '';
  private countdownInterval: any;
  private locationTrackingInterval: any;
  private map: any = null;
  private userMarker: any = null;
  private destinationMarker: any = null;
  private routeRenderer: any = null;

  constructor(
    private bookingService: BookingService,
    private locationService: LocationService,
    private googleMapsService: GoogleMapsService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadBooking(params['id']);
      }
    });
  }

  ngAfterViewInit() {
    // Map will be initialized after booking data is loaded
  }

  loadBooking(id: number) {
    this.bookingService.getBookingDetails(id).subscribe(
      (booking) => {
        this.booking = booking;
        this.startCountdown();
        this.initializeMap();
        this.startLocationTracking();
      },
      (error) => console.error('Error loading booking:', error)
    );
  }

  async initializeMap() {
    if (!this.booking) return;

    try {
      const mapElement = document.getElementById('tracking-map');
      if (!mapElement) {
        console.error('Map element not found');
        return;
      }

      const destination = {
        lat: this.booking.parking_space.location.coordinates[1],
        lng: this.booking.parking_space.location.coordinates[0]
      };

      // Get user's current location
      const userLocation = await this.locationService.getCurrentLocation();
      const userPosition = {
        lat: userLocation.latitude,
        lng: userLocation.longitude
      };

      // Create map centered between user and destination
      const centerLat = (userPosition.lat + destination.lat) / 2;
      const centerLng = (userPosition.lng + destination.lng) / 2;

      this.map = await this.googleMapsService.createMap(mapElement, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 13
      });

      // Add destination marker
      this.destinationMarker = await this.googleMapsService.addMarker(
        this.map,
        destination,
        {
          title: this.booking.parking_space.title,
          animation: 'DROP'
        }
      );

      // Add info window to destination
      const infoContent = `
        <div style="padding: 10px;">
          <h3 style="margin: 0 0 5px 0;">${this.booking.parking_space.title}</h3>
          <p style="margin: 0;">${this.booking.parking_space.address}</p>
        </div>
      `;
      await this.googleMapsService.addInfoWindow(this.destinationMarker, infoContent);

      // Add user marker
      this.userMarker = await this.googleMapsService.addMarker(
        this.map,
        userPosition,
        {
          title: 'Your Location',
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          animation: 'DROP'
        }
      );

      // Calculate and display route
      await this.updateRoute(userPosition, destination);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  async updateRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    try {
      // Remove old route if exists
      if (this.routeRenderer) {
        this.routeRenderer.setMap(null);
      }

      // Calculate new route
      const route = await this.googleMapsService.calculateRoute(origin, destination);
      this.routeRenderer = await this.googleMapsService.displayRoute(this.map, route);

      // Calculate distance and ETA
      const distanceData = await this.googleMapsService.calculateDistance(origin, destination);
      
      // Update booking location tracking
      if (this.booking.location_tracking) {
        this.booking.location_tracking.distance_remaining = distanceData.distance;
        this.booking.location_tracking.eta_minutes = Math.round(distanceData.duration);
      }
    } catch (error) {
      console.error('Error updating route:', error);
    }
  }

  startCountdown() {
    if (!this.booking) return;

    this.updateCountdown();
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  updateCountdown() {
    if (!this.booking) return;

    const end = new Date(this.booking.end_datetime).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) {
      this.timeRemaining = 'Time\'s up!';
      clearInterval(this.countdownInterval);
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    this.timeRemaining = `${hours}h ${minutes}m ${seconds}s`;
  }

  startLocationTracking() {
    if (!this.booking || this.booking.status !== 'active') return;

    // Update location every 30 seconds
    this.locationTrackingInterval = setInterval(async () => {
      try {
        const location = await this.locationService.getCurrentLocation();
        const userPosition = {
          lat: location.latitude,
          lng: location.longitude
        };

        const destination = {
          lat: this.booking.parking_space.location.coordinates[1],
          lng: this.booking.parking_space.location.coordinates[0]
        };

        // Update user marker position
        if (this.userMarker) {
          this.userMarker.setPosition(userPosition);
        }

        // Update route
        await this.updateRoute(userPosition, destination);

        // Calculate distance for backend
        const distance = this.locationService.calculateDistance(
          location.latitude,
          location.longitude,
          destination.lat,
          destination.lng
        );

        const eta = this.locationService.calculateETA(distance);

        // Send location update to backend
        this.bookingService.updateLocation(
          this.booking.id,
          location.latitude,
          location.longitude,
          distance,
          eta
        ).subscribe(
          () => console.log('Location updated'),
          (error) => console.error('Error updating location:', error)
        );
      } catch (error) {
        console.error('Error tracking location:', error);
      }
    }, 30000); // Every 30 seconds
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'confirmed': 'success',
      'active': 'warning',
      'arrived': 'warning',
      'parked': 'secondary',
      'completed': 'success',
      'cancelled': 'danger'
    };
    return colors[status] || 'medium';
  }

  getStatusMessage(status: string): string {
    const messages: { [key: string]: string } = {
      'confirmed': 'Ready to start your journey',
      'active': 'You are on your way to the parking',
      'arrived': 'You\'ve arrived at the destination',
      'parked': 'Your vehicle is parked',
      'completed': 'Booking completed',
      'cancelled': 'Booking cancelled'
    };
    return messages[status] || '';
  }

  startNavigation() {
    if (!this.booking || !this.booking.parking_space) return;
    const lat = this.booking.parking_space.location.coordinates[1];
    const lng = this.booking.parking_space.location.coordinates[0];
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_system');
  }

  markAsParked() {
    this.bookingService.updateBookingStatus(this.booking.id, 'parked').subscribe(
      (updated) => {
        this.booking = updated;
        this.stopLocationTracking();
      },
      (error) => console.error('Error updating booking:', error)
    );
  }

  cancelBooking() {
    this.alertController.create({
      header: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking?',
      buttons: [
        { text: 'No' },
        {
          text: 'Yes',
          handler: () => {
            this.bookingService.cancelBooking(this.booking.id).subscribe(
              () => {
                this.router.navigate(['/bookings']);
              },
              (error) => console.error('Error cancelling booking:', error)
            );
          }
        }
      ]
    }).then(alert => alert.present());
  }

  callOwner() {
    if (this.booking?.parking_space?.owner?.phone_number) {
      const phoneNumber = this.booking.parking_space.owner.phone_number;
      window.open(`tel:${phoneNumber}`, '_system');
    }
  }

  private stopLocationTracking() {
    if (this.locationTrackingInterval) {
      clearInterval(this.locationTrackingInterval);
    }
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.stopLocationTracking();
  }
}