// active-booking/active-booking.page.ts - FIXED
import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('trackingMap', { read: ElementRef }) mapElement: ElementRef | undefined;

  booking: any = null;
  timeRemaining = '';
  isLoading = true;
  mapInitialized = false;
  
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
    // Map initialization will happen after booking data is loaded
    // Use a small delay to ensure view is rendered
    setTimeout(() => {
      if (this.booking && !this.mapInitialized) {
        this.initializeMap();
      }
    }, 500);
  }

  /**
   * Load booking details
   */
  loadBooking(id: number) {
    this.isLoading = true;
    this.bookingService.getBookingDetails(id).subscribe(
      (booking) => {
        this.booking = booking;
        console.log('Booking loaded:', booking);
        
        // Ensure location_tracking is initialized
        if (!this.booking.location_tracking) {
          this.booking.location_tracking = {
            distance_remaining: 0,
            eta_minutes: 0
          };
        }

        this.startCountdown();
        this.startLocationTracking();
        this.isLoading = false;

        // Initialize map after data is loaded
        setTimeout(() => {
          this.initializeMap();
        }, 300);
      },
      (error) => {
        console.error('Error loading booking:', error);
        this.isLoading = false;
        this.showAlert(
          'Error',
          'Failed to load booking details. Please try again.',
          [{ text: 'OK', handler: () => this.router.navigate(['/bookings-history']) }]
        );
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

  /**
   * Initialize map with booking location
   */
  async initializeMap() {
    if (!this.booking || this.mapInitialized) return;

    try {
      // Get the map container element
      const mapContainer = document.getElementById('tracking-map');
      
      if (!mapContainer) {
        console.error('Map container element not found');
        return;
      }

      console.log('Map container found, initializing map...');

      // Ensure Google Maps is loaded
      await this.googleMapsService.load();

      const destination = this.parseLocation(this.booking.parking_space.location);
      if (!destination) {
        console.error('Invalid location data');
        return;
      }

      console.log('Destination coordinates:', destination);

      // Get user's current location
      try {
        const userLocation = await this.locationService.getCurrentLocation();
        const userPosition = {
          lat: userLocation.latitude,
          lng: userLocation.longitude
        };

        console.log('User position:', userPosition);

        // Create map centered between user and destination
        const centerLat = (userPosition.lat + destination.lat) / 2;
        const centerLng = (userPosition.lng + destination.lng) / 2;

        this.map = await this.googleMapsService.createMap(mapContainer, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 13
        });

        console.log('Map created successfully');

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
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 600;">
              ${this.booking.parking_space.title}
            </h3>
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">
              ${this.booking.parking_space.address}
            </p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">
              ${this.booking.parking_space.area}
            </p>
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

        this.mapInitialized = true;
        console.log('Map initialized successfully');
      } catch (locationError) {
        console.error('Error getting user location:', locationError);
        // Show destination only if we can't get user location
        this.map = await this.googleMapsService.createMap(mapContainer, {
          center: destination,
          zoom: 16
        });

        this.destinationMarker = await this.googleMapsService.addMarker(
          this.map,
          destination,
          {
            title: this.booking.parking_space.title,
            animation: 'DROP'
          }
        );

        this.mapInitialized = true;
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  /**
   * Update route between user and destination
   */
  async updateRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
    try {
      // Remove old route if exists
      if (this.routeRenderer) {
        this.routeRenderer.setMap(null);
      }

      // Calculate new route
      const route = await this.googleMapsService.calculateRoute(origin, destination);
      this.routeRenderer = await this.googleMapsService.displayRoute(this.map, route, true);

      // Calculate distance and ETA
      const distanceData = await this.googleMapsService.calculateDistance(origin, destination);
      
      // Update booking location tracking
      if (this.booking.location_tracking) {
        this.booking.location_tracking.distance_remaining = distanceData.distance;
        this.booking.location_tracking.eta_minutes = Math.round(distanceData.duration);
      } else {
        this.booking.location_tracking = {
          distance_remaining: distanceData.distance,
          eta_minutes: Math.round(distanceData.duration)
        };
      }

      console.log('Route updated:', distanceData);
    } catch (error) {
      console.error('Error updating route:', error);
    }
  }

  /**
   * Start countdown timer
   */
  startCountdown() {
    if (!this.booking) return;

    this.updateCountdown();
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  /**
   * Update countdown display
   */
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

  /**
   * Start location tracking
   */
  startLocationTracking() {
    console.log("this.booking.status ", this.booking.status)
    if (!this.booking || this.booking.status !== 'active') return;

    // Update location every 30 seconds
    this.locationTrackingInterval = setInterval(async () => {
      console.log("Updating");
      try {
        const location = await this.locationService.getCurrentLocation();
        const userPosition = {
          lat: location.latitude,
          lng: location.longitude
        };

        const destination = this.parseLocation(this.booking.parking_space.location);
        // Update user marker position if map is initialized
        if (this.userMarker && this.mapInitialized) {
          this.userMarker.setPosition(userPosition);
        }

        // Update route
        if (this.mapInitialized) {
          await this.updateRoute(userPosition, destination);
        }

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

  /**
   * Get status color
   */
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

  /**
   * Get status message
   */
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

  /**
   * Start navigation
   */
  startNavigation() {
    if (!this.booking || !this.booking.parking_space) return;
    let destination = this.parseLocation(this.booking.parking_space.location);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`;
    window.open(url, '_system'); // '_system' ensures it opens in Google Maps app (on mobile)
  }

  /**
   * Mark as active
   */
  markAsActive() {
    this.bookingService.updateBookingStatus(this.booking.id, 'active').subscribe(
      (updated) => {
        this.booking = updated;
        this.startNavigation();
        this.showAlert('Success', 'Booking marked as active');
      },
      (error) => {
        console.error('Error updating booking:', error);
        this.showAlert('Error', 'Failed to mark as active');
      }
    );
  }

  /**
   * Mark as parked
   */
  markAsParked() {
    this.bookingService.updateBookingStatus(this.booking.id, 'parked').subscribe(
      (updated) => {
        this.booking = updated;
        this.stopLocationTracking();
        this.showAlert('Success', 'Booking marked as parked');
      },
      (error) => {
        console.error('Error updating booking:', error);
        this.showAlert('Error', 'Failed to mark as parked');
      }
    );
  }

  /**
   * Cancel booking
   */
  cancelBooking() {
    this.alertController.create({
      header: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes',
          role: 'destructive',
          handler: () => {
            this.bookingService.cancelBooking(this.booking.id).subscribe(
              () => {
                this.router.navigate(['/bookings-history']);
              },
              (error) => {
                console.error('Error cancelling booking:', error);
                this.showAlert('Error', 'Failed to cancel booking');
              }
            );
          }
        }
      ]
    }).then(alert => alert.present());
  }

  /**
   * Call owner
   */
  callOwner() {
    if (this.booking?.parking_space?.owner?.phone_number) {
      const phoneNumber = this.booking.parking_space.owner.phone_number;
      window.open(`tel:${phoneNumber}`, '_system');
    } else {
      this.showAlert('Error', 'Owner contact number not available');
    }
  }

  /**
   * Stop location tracking
   */
  private stopLocationTracking() {
    if (this.locationTrackingInterval) {
      clearInterval(this.locationTrackingInterval);
    }
  }

  /**
   * Show alert
   */
  private showAlert(header: string, message: string, buttons?: any[]) {
    this.alertController.create({
      header,
      message,
      buttons: buttons || ['OK']
    }).then(alert => alert.present());
  }

  /**
   * Cleanup on destroy
   */
  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.stopLocationTracking();
  }
}