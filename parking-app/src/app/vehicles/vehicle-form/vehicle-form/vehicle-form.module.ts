import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VehicleFormPageRoutingModule } from './vehicle-form-routing.module';

import { VehicleFormPage } from './vehicle-form.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    VehicleFormPageRoutingModule
  ],
  declarations: [VehicleFormPage]
})
export class VehicleFormPageModule {}
