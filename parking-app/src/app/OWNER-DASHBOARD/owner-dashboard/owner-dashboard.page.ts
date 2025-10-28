// ============================= OWNER-DASHBOARD/OWNER-DASHBOARD.PAGE.TS =============================
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ParkingService } from '../../core/services/parking.service';
import { BookingService } from '../../core/services/booking.service';

@Component({
  selector: 'app-owner-dashboard',
  templateUrl: 'owner-dashboard.page.html',
  styleUrls: ['owner-dashboard.page.scss'],
  standalone: false
})
export class OwnerDashboardPage implements OnInit {
  parkingSpaces: any[] = [];
  totalRevenue = 0;
  activeBookingsCount = 0;
  totalBookingsCount = 0;
  averageRating = 0;
  isLoading = false;

  constructor(
    private parkingService: ParkingService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadOwnerData();
  }

  loadOwnerData() {
    this.isLoading = true;

    this.parkingService.getOwnerSpaces().subscribe(
      (spaces) => {
        this.parkingSpaces = spaces;
        this.calculateStats();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading owner data:', error);
        this.isLoading = false;
      }
    );
  }

  calculateStats() {
    this.totalRevenue = 0;
    this.activeBookingsCount = 0;
    this.totalBookingsCount = 0;
    let totalRating = 0;
    let ratingCount = 0;

    this.parkingSpaces.forEach(space => {
      this.totalRevenue += space.total_revenue || 0;
      this.activeBookingsCount += space.active_bookings || 0;
      this.totalBookingsCount += space.total_bookings || 0;
      totalRating += space.rating || 0;
      ratingCount++;
    });

    this.averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) as any : 0;
  }

  addNewSpace() {
    this.router.navigate(['/add-parking']);
  }

  viewSpaceDetails(space: any) {
    this.router.navigate(['/parking', space.id]);
  }

  editSpace(space: any) {
    this.router.navigate(['/edit-parking', space.id]);
  }

  viewBookings(space: any) {
    this.router.navigate(['/space-bookings', space.id]);
  }

  trackDriver(space: any) {
    this.router.navigate(['/track-driver', space.id]);
  }
}