// ============================= ACTIVE-BOOKING/ACTIVE-BOOKING.PAGE.TS =============================
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { LocationService } from '../../core/services/location.service';
//import { CallNumber } from '@ionic-native/call-number/ngx';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-active-booking',
  templateUrl: 'active-booking.page.html',
  styleUrls: ['active-booking.page.scss'],
  standalone: false
})
export class ActiveBookingPage implements OnInit {
  booking: any = null;
  timeRemaining = '';
  private countdownInterval: any;

  constructor(
    private bookingService: BookingService,
    private locationService: LocationService,
    //private callNumber: CallNumber,
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

  loadBooking(id: number) {
    this.bookingService.getBookingDetails(id).subscribe(
      (booking) => {
        this.booking = booking;
        this.startCountdown();
        this.startLocationTracking();
      },
      (error) => console.error('Error loading booking:', error)
    );
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

    setInterval(() => {
      this.locationService.getCurrentLocation().then(
        (location) => {
          this.bookingService.updateLocation(
            this.booking.id,
            location.latitude,
            location.longitude,
            0,
            15
          ).subscribe(
            () => {
              // Location updated
            },
            (error) => console.error('Error updating location:', error)
          );
        }
      );
    }, 30000); // Update every 30 seconds
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
    if (!this.booking || !this.booking.location_tracking) return;
    // Open maps
    const lat = this.booking.location_tracking.destination_latitude;
    const lng = this.booking.location_tracking.destination_longitude;
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_system');
  }

  markAsParked() {
    this.bookingService.updateBookingStatus(this.booking.id, 'parked').subscribe(
      (updated) => {
        this.booking = updated;
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

  //callOwner() {
  //  if (this.booking?.parking_space?.owner?.phone_number) {
  //    this.callNumber.callNumber(this.booking.parking_space.owner.phone_number, true)
  //      .catch(err => console.error('Error making call:', err));
  //  }
  //}

  callOwner() {
    if (this.booking?.parking_space?.owner?.phone_number) {
      const phoneNumber = this.booking.parking_space.owner.phone_number;
      // Use the Browser API to open the phone dialer
      window.open(`tel:${phoneNumber}`, '_system');
    }
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
