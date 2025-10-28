import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActiveBookingPage } from './active-booking.page';

const routes: Routes = [
  {
    path: '',
    component: ActiveBookingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ACTIVEBOOKINGPageRoutingModule {}
