// vehicles/vehicles.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, RefresherCustomEvent } from '@ionic/angular';
import { VehicleService } from 'src/app/core/services/vehicle.service';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.page.html',
  styleUrls: ['./vehicles.page.scss'],
  standalone: false
})
export class VehiclesPage implements OnInit {
  vehicles: any[] = [];
  isLoading = false;

  constructor(
    private vehicleService: VehicleService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadVehicles();
  }

  loadVehicles() {
    this.isLoading = true;
    this.vehicleService.getVehicles().subscribe(
      (vehicles: any) => {
        this.vehicles = vehicles.results;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading vehicles:', error);
        this.isLoading = false;
        this.showToast('Error loading vehicles', 'danger');
      }
    );
  }

  addVehicle() {
    this.router.navigate(['/vehicles/add']);
  }

  editVehicle(vehicle: any) {
    this.router.navigate(['/vehicles/edit', vehicle.id]);
  }

  deleteVehicle(vehicle: any) {
    this.alertController.create({
      header: 'Delete Vehicle',
      message: `Are you sure you want to delete ${vehicle.vehicle_number}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.vehicleService.deleteVehicle(vehicle.id).subscribe(
              () => {
                this.showToast('Vehicle deleted successfully', 'success');
                this.loadVehicles();
              },
              (error) => {
                console.error('Error deleting vehicle:', error);
                this.showToast('Error deleting vehicle', 'danger');
              }
            );
          }
        }
      ]
    }).then(alert => alert.present());
  }

  doRefresh(event: RefresherCustomEvent) {
    this.loadVehicles();
    setTimeout(() => event.detail.complete(), 1000);
  }

  private showToast(message: string, color: string = 'primary') {
    this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    }).then(toast => toast.present());
  }
}