// vehicles/vehicle-form/vehicle-form.page.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { VehicleService } from 'src/app/core/services/vehicle.service';

@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.page.html',
  styleUrls: ['./vehicle-form.page.scss'],
  standalone: false
})
export class VehicleFormPage implements OnInit {
  @ViewChild('dlFileInput') dlFileInput!: ElementRef;
  @ViewChild('vehicleFileInput') vehicleFileInput!: ElementRef;
  
  vehicleForm: FormGroup;
  isEditMode = false;
  vehicleId: number | null = null;
  isLoading = false;
  
  dlFile: File | null = null;
  dlFileName: string = '';
  vehicleFile: File | null = null;
  vehicleFileName: string = '';

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
  ) {
    this.vehicleForm = this.fb.group({
      vehicleNumber: ['', [Validators.required]],
      vehicleType: ['car', [Validators.required]],
      vehicleModel: ['', [Validators.required]],
      vehicleColor: ['', [Validators.required]],
      dlNumber: ['', [Validators.required]],
      dlExpiryDate: ['', [Validators.required]],
      length: [4.5, [Validators.required, Validators.min(0.1)]],
      width: [1.8, [Validators.required, Validators.min(0.1)]],
      height: [1.5, [Validators.required, Validators.min(0.1)]],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.vehicleId = +params['id'];
        this.loadVehicle();
      }
    });
  }

  loadVehicle() {
    if (!this.vehicleId) return;

    this.vehicleService.getVehicles().subscribe(
      (vehicles) => {
        const vehicle = vehicles.find(v => v.id === this.vehicleId);
        if (vehicle) {
          this.vehicleForm.patchValue({
            vehicleNumber: vehicle.vehicle_number,
            vehicleType: vehicle.vehicle_type,
            vehicleModel: vehicle.vehicle_model,
            vehicleColor: vehicle.vehicle_color,
            dlNumber: vehicle.dl_number,
            dlExpiryDate: vehicle.dl_expiry_date,
            length: vehicle.length_in_meters,
            width: vehicle.width_in_meters,
            height: vehicle.height_in_meters,
            isActive: vehicle.is_active
          });
        }
      },
      (error) => {
        console.error('Error loading vehicle:', error);
        this.showToast('Error loading vehicle', 'danger');
      }
    );
  }

  onDlFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.dlFile = file;
      this.dlFileName = file.name;
    }
  }

  removeDlFile() {
    this.dlFile = null;
    this.dlFileName = '';
    if (this.dlFileInput) {
      this.dlFileInput.nativeElement.value = '';
    }
  }

  onVehicleFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.vehicleFile = file;
      this.vehicleFileName = file.name;
    }
  }

  removeVehicleFile() {
    this.vehicleFile = null;
    this.vehicleFileName = '';
    if (this.vehicleFileInput) {
      this.vehicleFileInput.nativeElement.value = '';
    }
  }

  onSubmit() {
    if (this.vehicleForm.invalid) {
      this.markFormGroupTouched(this.vehicleForm);
      return;
    }

    this.isLoading = true;
    const formData = this.prepareFormData();

    if (this.isEditMode && this.vehicleId) {
      this.vehicleService.updateVehicle(this.vehicleId, formData).subscribe(
        () => {
          this.isLoading = false;
          this.showToast('Vehicle updated successfully', 'success');
          this.router.navigate(['/vehicles']);
        },
        (error) => {
          this.isLoading = false;
          this.handleError(error);
        }
      );
    } else {
      this.vehicleService.registerVehicle(formData).subscribe(
        () => {
          this.isLoading = false;
          this.showToast('Vehicle added successfully', 'success');
          this.router.navigate(['/vehicles']);
        },
        (error) => {
          this.isLoading = false;
          this.handleError(error);
        }
      );
    }
  }

  prepareFormData(): FormData {
    const formData = new FormData();
    const values = this.vehicleForm.value;

    formData.append('vehicle_number', values.vehicleNumber);
    formData.append('vehicle_type', values.vehicleType);
    formData.append('vehicle_model', values.vehicleModel);
    formData.append('vehicle_color', values.vehicleColor);
    formData.append('dl_number', values.dlNumber);
    formData.append('dl_expiry_date', values.dlExpiryDate);
    formData.append('length_in_meters', values.length.toString());
    formData.append('width_in_meters', values.width.toString());
    formData.append('height_in_meters', values.height.toString());
    formData.append('is_active', values.isActive.toString());

    // Only append files if they exist (make them optional)
    if (this.dlFile) {
      formData.append('dl_document', this.dlFile);
    }
    
    if (this.vehicleFile) {
      formData.append('vehicle_document', this.vehicleFile);
    }

    return formData;
  }

  cancel() {
    this.router.navigate(['/vehicles']);
  }

  private handleError(error: any) {
    const errorMsg = this.getErrorMessage(error);
    this.showToast(errorMsg, 'danger');
  }

  private getErrorMessage(error: any): string {
    if (error.error) {
      if (typeof error.error === 'string') return error.error;
      if (error.error.detail) return error.error.detail;
      
      const firstKey = Object.keys(error.error)[0];
      if (firstKey && error.error[firstKey]) {
        return `${firstKey}: ${error.error[firstKey][0]}`;
      }
    }
    return 'An error occurred. Please try again.';
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
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