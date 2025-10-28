import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PARKINGDETAILSPageRoutingModule } from './parking-details-routing.module';

import { ParkingDetailsPage } from './parking-details.page';
import { DistancePipe } from 'src/app/shared/pipes/distance.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time-format.pipe';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Add this
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DistancePipe,
    TimeFormatPipe,
    PARKINGDETAILSPageRoutingModule
  ],
  declarations: [ParkingDetailsPage]
})
export class PARKINGDETAILSPageModule {}
