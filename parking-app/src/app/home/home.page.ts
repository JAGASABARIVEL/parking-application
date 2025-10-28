// ============================= HOME/HOME.PAGE.TS =============================
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, RefresherCustomEvent } from '@ionic/angular';
import { ParkingService } from '../core/services/parking.service';
import { LocationService } from '../core/services/location.service';
import { BookingService } from '../core/services/booking.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  parkingSpaces: any[] = [];
  currentLocation: any = null;
  activeBooking: any = null;
  isLoading = false;
  searchText = '';
  selectedFilter = 'All';
  filters = ['All', 'Garage', 'Open', 'Covered'];

  constructor(
    private parkingService: ParkingService,
    private locationService: LocationService,
    private bookingService: BookingService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadCurrentLocation();
    this.loadNearbyParking();
    this.checkActiveBooking();
  }

  loadCurrentLocation() {
    this.locationService.getCurrentLocation().then(
      (location) => {
        this.currentLocation = {
          address: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
          latitude: location.latitude,
          longitude: location.longitude
        };
      },
      (error) => {
        console.error('Error getting location:', error);
        this.showToast('Unable to get your location');
      }
    );
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
        this.parkingSpaces = spaces;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading parking spaces:', error);
        this.isLoading = false;
        this.showToast('Error loading parking spaces');
      }
    );
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
    this.loadNearbyParking();
  }

  onSearchChange() {
    if (!this.searchText.trim()) {
      this.loadNearbyParking();
      return;
    }

    this.isLoading = true;
    this.parkingService.searchByCity(this.searchText).subscribe(
      (response) => {
        this.parkingSpaces = response.results || response;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error searching:', error);
        this.isLoading = false;
      }
    );
  }

  selectFilter(filter: string) {
    this.selectedFilter = filter;
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
      },
      (error) => {
        console.error('Error filtering:', error);
        this.isLoading = false;
      }
    );
  }

  viewParkingDetails(space: any) {
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