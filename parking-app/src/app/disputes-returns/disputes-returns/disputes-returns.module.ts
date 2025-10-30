import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DisputesReturnsPageRoutingModule } from './disputes-returns-routing.module';

import { DisputesReturnsPage } from './disputes-returns.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DisputesReturnsPageRoutingModule
  ],
  declarations: [DisputesReturnsPage]
})
export class DisputesReturnsPageModule {}
