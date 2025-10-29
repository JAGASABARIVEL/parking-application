// app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard]
  },
  // Auth Routes
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadChildren: () => import('./auth/login/login/login.module').then(m => m.LoginPageModule)
      },
      {
        path: 'register',
        loadChildren: () => import('./auth/register/register/register.module').then(m => m.RegisterPageModule)
      }
    ]
  },
  // Parking Routes
  {
    path: 'parking/:id',
    loadChildren: () => import('./PARKING-DETAILS/parking-details/parking-details.module').then(m => m.PARKINGDETAILSPageModule),
    canActivate: [AuthGuard]
  },
  // Booking Routes
  {
    path: 'booking/:id',
    loadChildren: () => import('./BOOKING/booking-flow/booking-flow.module').then(m => m.BOOKINGFLOWPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'payment/:id',
    loadChildren: () => import('./payment/payment/payment.module').then(m => m.PaymentPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'active-booking/:id',
    loadChildren: () => import('./ACTIVE-BOOKING/active-booking/active-booking.module').then(m => m.ACTIVEBOOKINGPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'bookings-history',
    loadChildren: () => import('./BOOKINGS-HISTORY/bookings-history/bookings-history.module').then(m => m.BOOKINGSHISTORYPageModule),
    canActivate: [AuthGuard]
  },
  // Profile Routes
  {
    path: 'profile',
    loadChildren: () => import('./PROFILE/profile/profile.module').then(m => m.PROFILEPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('./PROFILE/edit-profile/edit-profile/edit-profile.module').then(m => m.EditProfilePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings/settings.module').then(m => m.SettingsPageModule),
    canActivate: [AuthGuard]
  },
  // Vehicle Routes
  {
    path: 'vehicles',
    loadChildren: () => import('./vehicles/vehicles/vehicles.module').then(m => m.VehiclesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'vehicles/add',
    loadChildren: () => import('./vehicles/vehicle-form/vehicle-form/vehicle-form.module').then(m => m.VehicleFormPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'vehicles/edit/:id',
    loadChildren: () => import('./vehicles/vehicle-form/vehicle-form/vehicle-form.module').then(m => m.VehicleFormPageModule),
    canActivate: [AuthGuard]
  },
  // Owner Routes
  {
    path: 'owner-dashboard',
    loadChildren: () => import('./OWNER-DASHBOARD/owner-dashboard/owner-dashboard.module').then(m => m.OWNERDASHBOARDPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'owner' }
  },
  {
    path: 'add-parking',
    loadChildren: () => import('./owner/add-parking/add-parking/add-parking.module').then(m => m.AddParkingPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'owner' }
  },
  {
    path: 'edit-parking/:id',
    loadChildren: () => import('./owner/add-parking/add-parking/add-parking.module').then(m => m.AddParkingPageModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'owner' }
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./admin/dashboard/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }