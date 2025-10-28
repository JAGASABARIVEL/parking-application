import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OWNERDASHBOARDPageRoutingModule } from './owner-dashboard-routing.module';

import { OwnerDashboardPage } from './owner-dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OWNERDASHBOARDPageRoutingModule
  ],
  declarations: [OwnerDashboardPage]
})
export class OWNERDASHBOARDPageModule {}
