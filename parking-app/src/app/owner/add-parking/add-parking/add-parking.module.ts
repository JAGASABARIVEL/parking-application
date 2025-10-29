import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddParkingPageRoutingModule } from './add-parking-routing.module';

import { AddParkingPage } from './add-parking.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AddParkingPageRoutingModule
  ],
  declarations: [AddParkingPage]
})
export class AddParkingPageModule {}
