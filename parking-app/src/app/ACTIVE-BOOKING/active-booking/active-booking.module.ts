import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ACTIVEBOOKINGPageRoutingModule } from './active-booking-routing.module';

import { ActiveBookingPage } from './active-booking.page';
import { DistancePipe } from 'src/app/shared/pipes/distance.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DistancePipe,
    ACTIVEBOOKINGPageRoutingModule
  ],
  declarations: [ActiveBookingPage]
})
export class ACTIVEBOOKINGPageModule {}
