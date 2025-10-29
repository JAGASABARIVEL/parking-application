// settings/settings.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { StorageService } from 'src/app/core/services/storage.service';

interface AppSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  backgroundLocation: boolean;
  locationAccuracy: string;
  shareProfile: boolean;
  activityStatus: boolean;
  theme: string;
  language: string;
  saveCards: boolean;
  autoDownloadImages: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false
})
export class SettingsPage implements OnInit {
  settings: AppSettings = {
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    backgroundLocation: true,
    locationAccuracy: 'high',
    shareProfile: true,
    activityStatus: true,
    theme: 'system',
    language: 'en',
    saveCards: true,
    autoDownloadImages: 'wifi'
  };

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private storage: StorageService
  ) {}

  ngOnInit() {
    this.loadSettings();
  }

  async loadSettings() {
    const savedSettings = await this.storage.get('app_settings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...savedSettings };
    }
  }

  async saveSettings() {
    await this.storage.set('app_settings', this.settings);
    this.showToast('Settings saved', 'success');
  }

  onThemeChange() {
    this.applyTheme(this.settings.theme);
    this.saveSettings();
  }

  applyTheme(theme: string) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (theme === 'dark' || (theme === 'system' && prefersDark.matches)) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  managePaymentMethods() {
    this.alertController.create({
      header: 'Payment Methods',
      message: 'Payment method management coming soon',
      buttons: ['OK']
    }).then(alert => alert.present());
  }

  async clearCache() {
    const alert = await this.alertController.create({
      header: 'Clear Cache',
      message: 'Are you sure you want to clear app cache? This will free up storage space.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Clear',
          handler: () => {
            this.showToast('Cache cleared successfully', 'success');
          }
        }
      ]
    });
    await alert.present();
  }

  viewTerms() {
    this.router.navigate(['/terms']);
  }

  viewPrivacy() {
    this.router.navigate(['/privacy']);
  }

  async contactSupport() {
    const alert = await this.alertController.create({
      header: 'Contact Support',
      message: 'How would you like to contact us?',
      buttons: [
        {
          text: 'Email',
          handler: () => {
            window.open('mailto:support@parkingapp.com', '_system');
          }
        },
        {
          text: 'Phone',
          handler: () => {
            window.open('tel:+911234567890', '_system');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  async resetSettings() {
    const alert = await this.alertController.create({
      header: 'Reset Settings',
      message: 'Are you sure you want to reset all settings to default?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reset',
          role: 'destructive',
          handler: () => {
            this.settings = {
              pushNotifications: true,
              emailNotifications: true,
              smsNotifications: false,
              backgroundLocation: true,
              locationAccuracy: 'high',
              shareProfile: true,
              activityStatus: true,
              theme: 'system',
              language: 'en',
              saveCards: true,
              autoDownloadImages: 'wifi'
            };
            this.saveSettings();
            this.showToast('Settings reset to default', 'success');
          }
        }
      ]
    });
    await alert.present();
  }

  private showToast(message: string, color: string = 'primary') {
    this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    }).then(toast => toast.present());
  }
}