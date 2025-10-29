import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BOOKINGSHISTORYPageRoutingModule } from './bookings-history-routing.module';

import { BookingsHistoryPage } from './bookings-history.page';
import { HeaderComponent } from 'src/app/shared/components/header/header/header.component';
import { BottomTabsComponent } from 'src/app/shared/components/bottom-tabs/bottom-tabs/bottom-tabs.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderComponent,
    BottomTabsComponent,
    BOOKINGSHISTORYPageRoutingModule
  ],
  declarations: [BookingsHistoryPage]
})
export class BOOKINGSHISTORYPageModule {}
