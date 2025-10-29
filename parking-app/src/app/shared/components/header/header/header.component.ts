// shared/components/header/header.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    // Add Ionic imports here if needed
    CommonModule,
    IonicModule
  ]
})
export class HeaderComponent {
  @Input() title: string = '';
  @Input() showBack: boolean = false;
  @Input() showMenu: boolean = true;
  @Input() showNotifications: boolean = false;
  @Input() backUrl: string = '/home';

  @Output() toggleViewEvent = new EventEmitter();

  notificationCount = 0;

  constructor(private router: Router) {}

  goBack() {
    if (this.backUrl) {
      this.router.navigate([this.backUrl]);
    } else {
      window.history.back();
    }
  }

  openNotifications() {
    this.router.navigate(['/notifications']);
  }

  viewMode: 'list' | 'map' = 'list';
  toggleView() {
    this.viewMode = this.viewMode === 'list' ? 'map' : 'list';
    this.toggleViewEvent.emit(this.viewMode) 
  }
}
