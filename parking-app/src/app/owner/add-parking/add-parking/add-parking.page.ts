// owner/add-parking/add-parking.page.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { LocationService } from 'src/app/core/services/location.service';
import { ParkingService } from 'src/app/core/services/parking.service';

@Component({
  selector: 'app-add-parking',
  templateUrl: './add-parking.page.html',
  styleUrls: ['./add-parking.page.scss'],
  standalone: false
})
export class AddParkingPage implements OnInit {
  @ViewChild('photoInput') photoInput!: ElementRef;
  
  parkingForm: FormGroup;
  currentStep = 1;
  isEditMode = false;
  parkingId: number | null = null;
  isLoading = false;
  photoPreview: string[] = [];
  photoFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private parkingService: ParkingService,
    private locationService: LocationService,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
  ) {
    this.parkingForm = this.fb.group({
      // Basic Info
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      spaceType: ['garage', [Validators.required]],
      totalSpaces: [1, [Validators.required, Validators.min(1)]],
      availableSpaces: [1, [Validators.required, Validators.min(0)]],
      
      // Location
      address: ['', [Validators.required]],
      landmark: [''],
      city: ['', [Validators.required]],
      area: ['', [Validators.required]],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      
      // Pricing
      pricePerDay: [100, [Validators.required, Validators.min(0)]],
      pricePerWeek: [600, [Validators.min(0)]],
      pricePerMonth: [2000, [Validators.min(0)]],
      pricePerYear: [20000, [Validators.min(0)]],
      
      // Availability
      availableFrom: ['00:00', [Validators.required]],
      availableUntil: ['23:59', [Validators.required]],
      
      // Vehicle Restrictions
      maxHeight: [2.5, [Validators.min(0)]],
      maxLength: [5.5, [Validators.min(0)]],
      maxWidth: [2.0, [Validators.min(0)]],
      allowedVehicleTypes: [['car', 'suv'], [Validators.required]],
      
      // Amenities
      hasSecurityCamera: [false],
      hasLighting: [false],
      hasEvCharging: [false],
      hasSurveillance: [false],
      hasCovered: [false],
      has247Access: [false],
      
      // Payment
      paymentMethods: [['cod', 'razorpay'], [Validators.required]]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.parkingId = +params['id'];
        this.loadParkingSpace();
      }
    });
  }

  loadParkingSpace() {
    if (!this.parkingId) return;

    this.parkingService.getParkingSpaceDetails(this.parkingId).subscribe(
      (space) => {
        this.parkingForm.patchValue({
          title: space.title,
          description: space.description,
          spaceType: space.space_type,
          totalSpaces: space.total_spaces,
          availableSpaces: space.available_spaces,
          address: space.address,
          landmark: space.landmark,
          city: space.city,
          area: space.area,
          latitude: space.location.coordinates[1],
          longitude: space.location.coordinates[0],
          pricePerDay: space.price_per_day,
          pricePerWeek: space.price_per_week,
          pricePerMonth: space.price_per_month,
          pricePerYear: space.price_per_year,
          availableFrom: space.available_from,
          availableUntil: space.available_until,
          maxHeight: space.max_vehicle_height,
          maxLength: space.max_vehicle_length,
          maxWidth: space.max_vehicle_width,
          allowedVehicleTypes: space.allowed_vehicle_types,
          hasSecurityCamera: space.has_security_camera,
          hasLighting: space.has_lighting,
          hasEvCharging: space.has_ev_charging,
          hasSurveillance: space.has_surveillance,
          hasCovered: space.has_covered,
          has247Access: space.has_24_7_access,
          paymentMethods: space.accepted_payment_methods
        });

        // Load existing photos
        if (space.image) {
          this.photoPreview.push(space.image);
        }
        if (space.images) {
          space.images.forEach((img: any) => {
            this.photoPreview.push(img.image);
          });
        }
      },
      (error) => {
        console.error('Error loading parking space:', error);
        this.showToast('Error loading parking space', 'danger');
      }
    );
  }

  async getCurrentLocation() {
    try {
      const location = await this.locationService.getCurrentLocation();
      this.parkingForm.patchValue({
        latitude: location.latitude.toFixed(6),
        longitude: location.longitude.toFixed(6)
      });
      this.showToast('Location set successfully', 'success');
    } catch (error) {
      this.showToast('Error getting location', 'danger');
    }
  }

  selectPhotos() {
    this.photoInput.nativeElement.click();
  }

  onPhotosSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.photoFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.photoPreview.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removePhoto(index: number) {
    this.photoPreview.splice(index, 1);
    if (this.photoFiles[index]) {
      this.photoFiles.splice(index, 1);
    }
  }

  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStep1Valid(): boolean {
    return this.parkingForm.get('title')?.valid &&
           this.parkingForm.get('description')?.valid &&
           this.parkingForm.get('spaceType')?.valid &&
           this.parkingForm.get('totalSpaces')?.valid &&
           this.parkingForm.get('availableSpaces')?.valid || false;
  }

  isStep2Valid(): boolean {
    return this.parkingForm.get('address')?.valid &&
           this.parkingForm.get('city')?.valid &&
           this.parkingForm.get('area')?.valid &&
           this.parkingForm.get('latitude')?.valid &&
           this.parkingForm.get('longitude')?.valid || false;
  }

  isStep3Valid(): boolean {
    return this.parkingForm.get('pricePerDay')?.valid &&
           this.parkingForm.get('availableFrom')?.valid &&
           this.parkingForm.get('availableUntil')?.valid || false;
  }

  onSubmit() {
    if (this.parkingForm.invalid) {
      this.showToast('Please fill all required fields', 'warning');
      return;
    }

    this.isLoading = true;
    const formData = this.prepareFormData();

    if (this.isEditMode && this.parkingId) {
      this.parkingService.updateParkingSpace(this.parkingId, formData).subscribe(
        () => {
          this.isLoading = false;
          this.showToast('Parking space updated successfully', 'success');
          this.router.navigate(['/owner-dashboard']);
        },
        (error) => {
          this.isLoading = false;
          this.handleError(error);
        }
      );
    } else {
      this.parkingService.createParkingSpace(formData).subscribe(
        () => {
          this.isLoading = false;
          this.showToast('Parking space created successfully', 'success');
          this.router.navigate(['/owner-dashboard']);
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
    const values = this.parkingForm.value;

    // Basic info
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('space_type', values.spaceType);
    formData.append('total_spaces', values.totalSpaces.toString());
    formData.append('available_spaces', values.availableSpaces.toString());

    // Location
    // After: GeoJSON + lat/lng
    const locationGeoJSON = {
      type: 'Point',
      coordinates: [
        parseFloat(values.longitude), // Longitude first!
        parseFloat(values.latitude)
      ]
    };
    formData.append('location', JSON.stringify(locationGeoJSON));
    formData.append('latitude', values.latitude.toString());
    formData.append('longitude', values.longitude.toString());
    formData.append('address', values.address);
    formData.append('landmark', values.landmark || '');
    formData.append('city', values.city);
    formData.append('area', values.area);
    

    // Pricing
    formData.append('price_per_day', values.pricePerDay.toString());
    formData.append('price_per_week', values.pricePerWeek.toString());
    formData.append('price_per_month', values.pricePerMonth.toString());
    formData.append('price_per_year', values.pricePerYear.toString());

    // Availability
    formData.append('available_from', values.availableFrom);
    formData.append('available_until', values.availableUntil);

    // Vehicle restrictions
    formData.append('max_vehicle_height', values.maxHeight.toString());
    formData.append('max_vehicle_length', values.maxLength.toString());
    formData.append('max_vehicle_width', values.maxWidth.toString());
    formData.append('allowed_vehicle_types', JSON.stringify(values.allowedVehicleTypes));

    // Amenities
    formData.append('has_security_camera', values.hasSecurityCamera.toString());
    formData.append('has_lighting', values.hasLighting.toString());
    formData.append('has_ev_charging', values.hasEvCharging.toString());
    formData.append('has_surveillance', values.hasSurveillance.toString());
    formData.append('has_covered', values.hasCovered.toString());
    formData.append('has_24_7_access', values.has247Access.toString());

    // Payment methods
    formData.append('accepted_payment_methods', JSON.stringify(values.paymentMethods));

    // Photos
    if (this.photoFiles.length > 0) {
      this.photoFiles.forEach((file, index) => {
        if (index === 0) {
          formData.append('image', file);
        } else {
          formData.append('additional_images', file);
        }
      });
    }

    return formData;
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

  private showToast(message: string, color: string = 'primary') {
    this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    }).then(toast => toast.present());
  }
}