import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BOOKINGSHISTORYPageRoutingModule } from './bookings-history-routing.module';

import { BookingsHistoryPage } from './bookings-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BOOKINGSHISTORYPageRoutingModule
  ],
  declarations: [BookingsHistoryPage]
})
export class BOOKINGSHISTORYPageModule {}
