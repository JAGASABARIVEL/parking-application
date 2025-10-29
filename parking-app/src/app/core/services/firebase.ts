// core/services/firebase.service.ts
import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getMessaging, 
  getToken, 
  onMessage, 
  Messaging 
} from 'firebase/messaging';
import { 
  getAnalytics, 
  Analytics,
  logEvent 
} from 'firebase/analytics';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp;
  private messaging: Messaging | null = null;
  private analytics: Analytics | null = null;

  constructor() {
    // Initialize Firebase
    this.app = initializeApp(environment.firebaseConfig);
    
    // Initialize Firebase Cloud Messaging and Analytics (browser only)
    if (typeof window !== 'undefined') {
      try {
        this.messaging = getMessaging(this.app);
        this.analytics = getAnalytics(this.app);
      } catch (error) {
        console.error('Error initializing Firebase services:', error);
      }
    }
  }

  /**
   * Request permission for push notifications and get FCM token
   */
  async requestPermissionAndGetToken(): Promise<string | null> {
    if (!this.messaging) {
      console.error('Firebase Messaging not initialized');
      return null;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        
        // Get FCM token
        const token = await getToken(this.messaging, {
          vapidKey: environment.firebaseConfig.vapidKey // Add this to environment
        });
        
        if (token) {
          console.log('FCM Token:', token);
          return token;
        } else {
          console.log('No registration token available.');
          return null;
        }
      } else {
        console.log('Notification permission denied.');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Listen for foreground messages
   */
  onMessageListener() {
    if (!this.messaging) {
      console.error('Firebase Messaging not initialized');
      return;
    }

    onMessage(this.messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      
      // Show notification
      if (payload.notification) {
        this.showNotification(
          payload.notification.title || 'New Notification',
          payload.notification.body || ''
        );
      }
    });
  }

  /**
   * Show browser notification
   */
  private showNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/assets/icon/favicon.png'
      });
    }
  }

  /**
   * Log analytics event
   */
  logAnalyticsEvent(eventName: string, params?: { [key: string]: any }) {
    if (!this.analytics) {
      console.error('Firebase Analytics not initialized');
      return;
    }

    try {
      logEvent(this.analytics, eventName, params);
    } catch (error) {
      console.error('Error logging analytics event:', error);
    }
  }

  /**
   * Track screen view
   */
  trackScreenView(screenName: string) {
    this.logAnalyticsEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenName
    });
  }

  /**
   * Track booking event
   */
  trackBooking(bookingId: number, amount: number) {
    this.logAnalyticsEvent('booking_created', {
      booking_id: bookingId,
      value: amount,
      currency: 'INR'
    });
  }

  /**
   * Track search event
   */
  trackSearch(searchTerm: string) {
    this.logAnalyticsEvent('search', {
      search_term: searchTerm
    });
  }

  /**
   * Track user signup
   */
  trackSignup(method: string) {
    this.logAnalyticsEvent('sign_up', {
      method
    });
  }

  /**
   * Track user login
   */
  trackLogin(method: string) {
    this.logAnalyticsEvent('login', {
      method
    });
  }
}