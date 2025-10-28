// ============================= PROFILE/PROFILE.PAGE.TS =============================
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(
      (user) => {
        this.currentUser = user;
      }
    );
  }

  editProfile() {
    this.router.navigate(['/edit-profile']);
  }

  goToVehicles() {
    this.router.navigate(['/vehicles']);
  }

  goToBookings() {
    this.router.navigate(['/bookings-history']);
  }

  goToOwnerDashboard() {
    this.router.navigate(['/owner-dashboard']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  goToHelp() {
    this.router.navigate(['/help']);
  }

  logout() {
    this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        { text: 'Cancel' },
        {
          text: 'Logout',
          handler: () => {
            this.authService.logout().subscribe(
              () => {
                this.router.navigate(['/auth/login']);
              },
              (error) => console.error('Error logging out:', error)
            );
          }
        }
      ]
    }).then(alert => alert.present());
  }
}
