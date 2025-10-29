// app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { BookingService } from './core/services/booking.service';
import { FirebaseService } from './core/services/firebase';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  currentUser: any = null;
  activeBookingsCount = 0;

  constructor(
    private platform: Platform,
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private bookingService: BookingService,
    private router: Router,
    private alertController: AlertController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Initialize Firebase Cloud Messaging
      this.initializeFirebase();
    });
  }

  ngOnInit() {
    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadActiveBookingsCount();
      }
    });

    // Track screen views with Firebase Analytics
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const screenName = event.urlAfterRedirects?.split('?')[0] || 'unknown';
        this.firebaseService.trackScreenView(screenName);
      });
  }

  /**
   * Initialize Firebase services
   */
  private async initializeFirebase() {
    try {
      // Request notification permission and get FCM token
      const fcmToken = await this.firebaseService.requestPermissionAndGetToken();
      
      if (fcmToken) {
        console.log('FCM Token obtained:', fcmToken);
        // TODO: Send this token to your backend to store for push notifications
        // this.sendTokenToServer(fcmToken);
      }

      // Listen for foreground messages
      this.firebaseService.onMessageListener();
      
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }

  /**
   * Load active bookings count
   */
  private loadActiveBookingsCount() {
    this.bookingService.getMyBookings().subscribe(
      (bookings) => {
        this.activeBookingsCount = bookings.filter(
          b => b.status === 'active' || b.status === 'arrived' || b.status === 'parked'
        ).length;
      },
      (error) => console.error('Error loading bookings:', error)
    );
  }

  /**
   * Get badge color based on user type
   */
  getUserTypeBadgeColor(userType: string): string {
    const colors: { [key: string]: string } = {
      'driver': 'primary',
      'owner': 'success',
      'both': 'warning'
    };
    return colors[userType] || 'medium';
  }

  /**
   * Open help page
   */
  openHelp() {
    this.router.navigate(['/help']);
  }

  /**
   * Share app
   */
  async shareApp() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Parking App',
          text: 'Check out this amazing parking app!',
          url: window.location.origin
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      this.showAlert('Share', 'Share feature is not supported on this device');
    }
  }

  /**
   * Rate app
   */
  rateApp() {
    this.showAlert('Rate Us', 'Thank you for your feedback! Rating feature coming soon.');
  }

  /**
   * Logout
   */
  async logout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          role: 'destructive',
          handler: () => {
            this.authService.logout().subscribe(
              () => {
                this.firebaseService.logAnalyticsEvent('logout', {
                  method: 'manual'
                });
                this.router.navigate(['/auth/login']);
              },
              (error) => console.error('Error logging out:', error)
            );
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Show alert
   */
  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  /**
   * Send FCM token to backend (optional)
   */
  private sendTokenToServer(token: string) {
    // Implement API call to save token
    // this.http.post(`${environment.apiUrl}/fcm-token/`, { token }).subscribe();
  }
}