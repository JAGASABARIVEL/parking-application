import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookingFlowPage } from './booking-flow.page';

const routes: Routes = [
  {
    path: '',
    component: BookingFlowPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BOOKINGFLOWPageRoutingModule {}
