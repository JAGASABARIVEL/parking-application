// home/home.page.ts (Complete with Map View)
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, RefresherCustomEvent } from '@ionic/angular';
import { ParkingService } from '../core/services/parking.service';
import { LocationService } from '../core/services/location.service';
import { BookingService } from '../core/services/booking.service';
import { GoogleMapsService } from '../core/services/google-maps';
import { FirebaseService } from '../core/services/firebase';

// Declare google for TypeScript
declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef;

  parkingSpaces: any[] = [];
  currentLocation: any = null;
  activeBooking: any = null;
  isLoading = false;
  searchText = '';
  selectedFilter = 'All';
  filters = ['All', 'Garage', 'Open', 'Covered'];
  viewMode: 'list' | 'map' = 'list';
  
  private map: any = null;
  private markers: any[] = [];
  private autocomplete: any = null;

  constructor(
    private parkingService: ParkingService,
    private locationService: LocationService,
    private bookingService: BookingService,
    private googleMapsService: GoogleMapsService,
    private firebaseService: FirebaseService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadCurrentLocation();
    this.checkActiveBooking();
    
    // Track page view
    this.firebaseService.trackScreenView('home');
  }

  ngAfterViewInit() {
    // Setup address autocomplete after view is initialized
    setTimeout(() => {
      this.setupAutocomplete();
    }, 500);
  }

  async setupAutocomplete() {
    if (!this.searchInput) return;

    try {
      this.autocomplete = await this.googleMapsService.setupAutocomplete(
        this.searchInput.nativeElement,
        (place) => {
          if (place.geometry) {
            this.currentLocation = {
              address: place.formatted_address,
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng()
            };
            this.searchText = place.formatted_address || '';
            this.loadNearbyParking();
            
            // Center map if in map view
            if (this.viewMode === 'map' && this.map) {
              this.map.setCenter(place.geometry.location);
              this.initializeMap();
            }
          }
        }
      );
    } catch (error) {
      console.error('Error setting up autocomplete:', error);
    }
  }

  async loadCurrentLocation() {
    try {
      const location = await this.locationService.getCurrentLocation();
      
      // Reverse geocode to get address
      const address = await this.googleMapsService.reverseGeocode(
        location.latitude,
        location.longitude
      );
      
      this.currentLocation = {
        address: address,
        latitude: location.latitude,
        longitude: location.longitude
      };
      
      this.loadNearbyParking();
    } catch (error) {
      console.error('Error getting location:', error);
      this.currentLocation = {
        address: 'Location unavailable',
        latitude: 12.9716, // Default to Bangalore
        longitude: 77.5946
      };
      this.showToast('Unable to get your location. Using default location.');
      this.loadNearbyParking();
    }
  }

  loadNearbyParking() {
  if (!this.currentLocation) return;

  this.isLoading = true;
  this.parkingService.searchNearby(
    this.currentLocation.latitude,
    this.currentLocation.longitude,
    5
  ).subscribe(
    (spaces) => {
      this.parkingSpaces = spaces || [];
      this.isLoading = false;

      // 🟩 If map view active, reinitialize map after data loads
      if (this.viewMode === 'map') {
        setTimeout(() => this.initializeMap(), 300);
      }
    },
    (error) => {
      console.error('Error loading parking spaces:', error);
      this.isLoading = false;
      this.showToast('Error loading parking spaces');
    }
  );
}


  async initializeMap() {
    if (!this.currentLocation) return;

    try {
      const mapElement = document.getElementById('home-map');
      if (!mapElement) return;

      // Create or update map
      if (!this.map) {
        this.map = await this.googleMapsService.createMap(mapElement, {
          center: {
            lat: this.currentLocation.latitude,
            lng: this.currentLocation.longitude
          },
          zoom: 13
        });
      } else {
        this.map.setCenter({
          lat: this.currentLocation.latitude,
          lng: this.currentLocation.longitude
        });
        if (this.parkingSpaces.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            this.markers.forEach(marker => bounds.extend(marker.getPosition()));
            this.map.fitBounds(bounds);
        }
      }

      // Clear existing markers
      this.markers.forEach(marker => marker.setMap(null));
      this.markers = [];

      // Add user location marker
      const userMarker = await this.googleMapsService.addMarker(
        this.map,
        {
          lat: this.currentLocation.latitude,
          lng: this.currentLocation.longitude
        },
        {
          title: 'Your Location',
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          animation: 'DROP'
        }
      );
      this.markers.push(userMarker);

      // Add parking space markers
      console.log("this.parkingSpaces && this.parkingSpaces.length ", this.parkingSpaces, this.parkingSpaces.length)
      if (this.parkingSpaces && this.parkingSpaces.length > 0) {
      for (const space of this.parkingSpaces) {
        if (space.location) {
          let lat: number, lng: number;
        
          if (typeof space.location === 'string' && space.location.includes('POINT')) {
            // Parse WKT string: "SRID=4326;POINT (lng lat)"
            const match = space.location.match(/POINT\s*\(([-\d.]+)\s+([-\d.]+)\)/);
            if (match) {
              lng = parseFloat(match[1]);
              lat = parseFloat(match[2]);
            }
          } else if (space.location.coordinates) {
            // Handle GeoJSON format just in case
            lng = space.location.coordinates[0];
            lat = space.location.coordinates[1];
          }
        
          if (lat && lng) {
            const marker = await this.googleMapsService.addMarker(
              this.map,
              { lat, lng },
              {
                title: space.title,
                animation: 'DROP'
              }
            );
        
            // Info window
            const infoContent = `
              <div style="padding: 10px; min-width: 200px;">
                <h3 style="margin: 0 0 5px 0;">${space.title}</h3>
                <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">${space.area}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                  <span style="color: #3498db; font-weight: bold;">₹${space.price_per_day}/day</span>
                  <span style="font-size: 12px; color: #666;">${space.available_spaces}/${space.total_spaces} available</span>
                </div>
              </div>
            `;
            await this.googleMapsService.addInfoWindow(marker, infoContent);
        
            marker.addListener('click', () => this.viewParkingDetails(space));
        
            this.markers.push(marker);
          }
        }
      }
    }

      // Fit bounds to show all markers
      if (this.markers.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        this.markers.forEach(marker => {
          bounds.extend(marker.getPosition());
        });
        this.map.fitBounds(bounds);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  onToggleView(mode) {
    this.viewMode = mode;
  this.viewMode = this.viewMode === 'list' ? 'map' : 'list';

  this.firebaseService.logAnalyticsEvent('view_mode_changed', {
    mode: this.viewMode
  });

  if (this.viewMode === 'map') {
    // reset existing map to avoid referencing destroyed DOM
    this.map = null;

    // Wait for DOM to update
    setTimeout(() => {
      this.initializeMap();
    }, 300);
  }
}


  checkActiveBooking() {
    this.bookingService.getMyBookings().subscribe(
      (bookings) => {
        this.activeBooking = bookings.find(b =>
          b.status === 'active' || b.status === 'arrived' || b.status === 'parked'
        );
      },
      (error) => console.error('Error loading active booking:', error)
    );
  }

  refetchLocation() {
    this.loadCurrentLocation();
  }

  onSearchInput() {
    // Autocomplete will handle this
    // Manual search is triggered by autocomplete selection
  }

  selectFilter(filter: string) {
    this.selectedFilter = filter;
    
    // Track filter selection
    this.firebaseService.logAnalyticsEvent('filter_selected', {
      filter_type: filter
    });

    if (filter === 'All') {
      this.loadNearbyParking();
    } else {
      this.filterByType(filter.toLowerCase());
    }
  }

  filterByType(type: string) {
    this.isLoading = true;
    this.parkingService.searchByFilters({ space_type: type }).subscribe(
      (spaces) => {
        this.parkingSpaces = spaces;
        this.isLoading = false;
        
        if (this.viewMode === 'map') {
          this.initializeMap();
        }
      },
      (error) => {
        console.error('Error filtering:', error);
        this.isLoading = false;
      }
    );
  }

  viewParkingDetails(space: any) {
    // Track view event
    this.firebaseService.logAnalyticsEvent('view_parking_space', {
      parking_space_id: space.id,
      parking_space_title: space.title
    });

    this.router.navigate(['/parking', space.id]);
  }

  goToActiveBooking() {
    if (this.activeBooking) {
      this.router.navigate(['/active-booking', this.activeBooking.id]);
    }
  }

  openNotifications() {
    this.router.navigate(['/notifications']);
  }

  doRefresh(event: RefresherCustomEvent) {
    this.loadNearbyParking();
    this.checkActiveBooking();
    setTimeout(() => event.detail.complete(), 1000);
  }

  private showToast(message: string) {
    this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    }).then(toast => toast.present());
  }
}