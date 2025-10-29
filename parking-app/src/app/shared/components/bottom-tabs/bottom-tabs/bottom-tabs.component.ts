// shared/components/bottom-tabs/bottom-tabs.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-bottom-tabs',
  templateUrl: './bottom-tabs.component.html',
  styleUrls: ['./bottom-tabs.component.scss'],
  imports: [
    CommonModule,
    IonicModule
  ],
  standalone: true
})
export class BottomTabsComponent implements OnInit {
  currentUrl: string = '';
  currentUser: any = null;

  tabs = [
    {
      label: 'Home',
      icon: 'home',
      route: '/home',
      roles: ['driver', 'owner', 'both']
    },
    {
      label: 'Bookings',
      icon: 'calendar',
      route: '/bookings-history',
      roles: ['driver', 'both']
    },
    {
      label: 'Dashboard',
      icon: 'business',
      route: '/owner-dashboard',
      roles: ['owner', 'both']
    },
    {
      label: 'Profile',
      icon: 'person',
      route: '/profile',
      roles: ['driver', 'owner', 'both']
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get current URL
    this.currentUrl = this.router.url;
    
    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects;
      });

    // Get current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.currentUrl === route || this.currentUrl.startsWith(route + '/');
  }

  shouldShowTab(tab: any): boolean {
    if (!this.currentUser) return false;
    return tab.roles.includes(this.currentUser.user_type);
  }
}
