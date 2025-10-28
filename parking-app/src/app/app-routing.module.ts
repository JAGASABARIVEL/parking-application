import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'parking-details',
    loadChildren: () => import('./PARKING-DETAILS/parking-details/parking-details.module').then( m => m.PARKINGDETAILSPageModule)
  },
  {
    path: 'booking-flow',
    loadChildren: () => import('./BOOKING/booking-flow/booking-flow.module').then( m => m.BOOKINGFLOWPageModule)
  },
  {
    path: 'active-booking',
    loadChildren: () => import('./ACTIVE-BOOKING/active-booking/active-booking.module').then( m => m.ACTIVEBOOKINGPageModule)
  },
  {
    path: 'bookings-history',
    loadChildren: () => import('./BOOKINGS-HISTORY/bookings-history/bookings-history.module').then( m => m.BOOKINGSHISTORYPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./PROFILE/profile/profile.module').then( m => m.PROFILEPageModule)
  },
  {
    path: 'owner-dashboard',
    loadChildren: () => import('./OWNER-DASHBOARD/owner-dashboard/owner-dashboard.module').then( m => m.OWNERDASHBOARDPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
