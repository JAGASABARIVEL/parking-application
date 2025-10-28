// ============================= BOOKINGS-HISTORY/BOOKINGS-HISTORY.PAGE.TS =============================
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { RefresherCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-bookings-history',
  templateUrl: 'bookings-history.page.html',
  styleUrls: ['bookings-history.page.scss'],
  standalone: false
})
export class BookingsHistoryPage implements OnInit {
  allBookings: any[] = [];
  filteredBookings: any[] = [];
  selectedTab = 'all';
  isLoading = false;

  constructor(
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading = true;
    this.bookingService.getMyBookings().subscribe(
      (bookings) => {
        this.allBookings = bookings;
        this.filterBookings();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading bookings:', error);
        this.isLoading = false;
      }
    );
  }

  onTabChange() {
    this.filterBookings();
  }

  filterBookings() {
    const now = new Date();

    if (this.selectedTab === 'all') {
      this.filteredBookings = this.allBookings;
    } else if (this.selectedTab === 'upcoming') {
      this.filteredBookings = this.allBookings.filter(
        b => new Date(b.start_datetime) > now && b.status !== 'cancelled'
      );
    } else if (this.selectedTab === 'completed') {
      this.filteredBookings = this.allBookings.filter(
        b => b.status === 'completed' || b.status === 'cancelled'
      );
    }
  }

  viewBookingDetails(booking: any) {
    this.router.navigate(['/active-booking', booking.id]);
  }

  reviewBooking(booking: any) {
    this.router.navigate(['/review', booking.id]);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'confirmed': 'success',
      'active': 'warning',
      'completed': 'success',
      'cancelled': 'danger'
    };
    return colors[status] || 'medium';
  }

  doRefresh(event: RefresherCustomEvent) {
    this.loadBookings();
    setTimeout(() => event.detail.complete(), 1000);
  }
}
