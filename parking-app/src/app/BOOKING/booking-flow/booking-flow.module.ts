import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule, IonItemDivider } from '@ionic/angular';

import { BOOKINGFLOWPageRoutingModule } from './booking-flow-routing.module';

import { BookingFlowPage } from './booking-flow.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BOOKINGFLOWPageRoutingModule
  ],
  declarations: [BookingFlowPage]
})
export class BOOKINGFLOWPageModule {}
