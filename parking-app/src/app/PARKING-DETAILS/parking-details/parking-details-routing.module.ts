import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ParkingDetailsPage } from './parking-details.page';

const routes: Routes = [
  {
    path: '',
    component: ParkingDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PARKINGDETAILSPageRoutingModule {}
