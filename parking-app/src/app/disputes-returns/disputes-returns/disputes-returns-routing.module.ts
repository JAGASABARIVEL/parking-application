import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DisputesReturnsPage } from './disputes-returns.page';

const routes: Routes = [
  {
    path: '',
    component: DisputesReturnsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DisputesReturnsPageRoutingModule {}
