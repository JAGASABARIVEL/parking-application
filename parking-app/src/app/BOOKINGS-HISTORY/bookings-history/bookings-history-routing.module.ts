import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookingsHistoryPage } from './bookings-history.page';

const routes: Routes = [
  {
    path: '',
    component: BookingsHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BOOKINGSHISTORYPageRoutingModule {}
