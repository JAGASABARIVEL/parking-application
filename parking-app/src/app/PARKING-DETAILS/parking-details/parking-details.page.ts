// ============================= PARKING-DETAILS/PARKING-DETAILS.PAGE.TS =============================
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParkingService } from '../../core/services/parking.service';
import { LocationService } from '../../core/services/location.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-parking-details',
  templateUrl: 'parking-details.page.html',
  styleUrls: ['parking-details.page.scss'],
  standalone: false,
})
export class ParkingDetailsPage implements OnInit {
  parkingSpace: any = null;
  isLoading = true;
  distance: number | null = null;
  topReviews: any[] = [];

  constructor(
    private parkingService: ParkingService,
    private locationService: LocationService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadParkingDetails(params['id']);
      }
    });
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

  calculateDistance() {
    if (!this.parkingSpace) return;

    this.locationService.getCurrentLocation().then(
      (location) => {
        this.distance = this.locationService.calculateDistance(
          location.latitude,
          location.longitude,
          this.parkingSpace.location.coordinates[1],
          this.parkingSpace.location.coordinates[0]
        );
      }
    );
  }

  startBooking() {
    if (!this.parkingSpace) return;
    this.router.navigate(['/booking', this.parkingSpace.id]);
  }
}

