
// ============================= BOOKING/BOOKING-FLOW.PAGE.TS =============================
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ParkingService } from '../../core/services/parking.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { BookingService } from '../../core/services/booking.service';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-booking-flow',
  templateUrl: 'booking-flow.page.html',
  styleUrls: ['booking-flow.page.scss'],
  standalone: false
})
export class BookingFlowPage implements OnInit {
  currentStep = 1;
  parkingSpace: any = null;
  parkingSpaceId: number | null = null;
  vehicles: any[] = [];
  selectedVehicleId: number | null = null;
  selectedVehicle: any = null;
  selectedBookingType = 'daily';
  startDateTime: string = '';
  endDateTime: string = '';
  minDateTime: string = '';
  duration = '';
  calculatedPrice = 0;
  specialInstructions = '';
  selectedPaymentMethod: string | null = null;
  availablePaymentMethods: string[] = [];

  constructor(
    private parkingService: ParkingService,
    private vehicleService: VehicleService,
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.parkingSpaceId = params['id'];
        this.loadParkingSpace();
      }
    });

    this.setMinDateTime();
    this.loadVehicles();
  }

  loadParkingSpace() {
  if (!this.parkingSpaceId) return;

  this.parkingService.getParkingSpaceDetails(this.parkingSpaceId).subscribe(
    (space) => {
      this.parkingSpace = space;

      // Parse if backend sends JSON string
      if (typeof space.accepted_payment_methods === 'string') {
        try {
          this.availablePaymentMethods = JSON.parse(space.accepted_payment_methods);
        } catch (e) {
          console.warn('Error parsing payment methods:', e);
          this.availablePaymentMethods = ['cod', 'razorpay'];
        }
      } else {
        this.availablePaymentMethods = space.accepted_payment_methods || ['cod', 'razorpay'];
      }
    },
    (error) => console.error('Error loading parking space:', error)
  );
}

  loadVehicles() {
    this.vehicleService.getActiveVehicles().subscribe(
      (vehicles) => {
        this.vehicles = vehicles;
      },
      (error) => console.error('Error loading vehicles:', error)
    );
  }

  setMinDateTime() {
    const now = new Date();
    this.minDateTime = now.toISOString();
    this.startDateTime = now.toISOString();
  }

  compareVehicles(v1: any, v2: any) {
    return v1 && v2 ? v1.id === v2.id : v1 === v2;
  }

  onBookingTypeChange() {
    this.calculatePrice();
  }

  onDateTimeChange() {
    this.calculateDuration();
    this.calculatePrice();
  }

  calculateDuration() {
    const start = new Date(this.startDateTime);
    const end = new Date(this.endDateTime);

    if (end <= start) {
      this.duration = 'Invalid dates';
      return;
    }

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

    if (this.selectedBookingType === 'hourly') {
      this.duration = `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (this.selectedBookingType === 'daily') {
      this.duration = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (this.selectedBookingType === 'weekly') {
      this.duration = `${Math.ceil(diffDays / 7)} week`;
    } else if (this.selectedBookingType === 'monthly') {
      this.duration = `${Math.ceil(diffDays / 30)} month`;
    }
  }

  calculatePrice() {
    if (!this.parkingSpace || !this.startDateTime || !this.endDateTime) return;

    const start = new Date(this.startDateTime);
    const end = new Date(this.endDateTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    let price = 0;
    if (this.selectedBookingType === 'hourly') {
      price = (this.parkingSpace.price_per_day / 24) * diffHours;
    } else if (this.selectedBookingType === 'daily') {
      price = this.parkingSpace.price_per_day * diffDays;
    } else if (this.selectedBookingType === 'weekly') {
      price = this.parkingSpace.price_per_week * (diffDays / 7);
    } else if (this.selectedBookingType === 'monthly') {
      price = this.parkingSpace.price_per_month * (diffDays / 30);
    }

    this.calculatedPrice = Math.ceil(price);
  }

  nextStep() {
    if (this.currentStep === 1 && !this.selectedVehicleId) {
      this.showAlert('Please select a vehicle');
      return;
    }
    if (this.currentStep === 2 && !this.startDateTime) {
      this.showAlert('Please select dates');
      return;
    }
    if (this.currentStep < 4) {
      console.log("selectedVehicleId ", this.selectedVehicleId, this.vehicles);
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onVehicleSelect() {
    this.selectedVehicle = this.vehicles.find(v => v.id === this.selectedVehicleId);
    this.nextStep();
  }

  proceedToPayment() {
    
    if (!this.selectedVehicleId || !this.selectedPaymentMethod || !this.parkingSpaceId) {
      this.showAlert('Please complete all steps');
      return;
    }

    

    const bookingData = {
      parking_space: this.parkingSpaceId,
      vehicle_id: this.selectedVehicleId,
      booking_type: this.selectedBookingType,
      start_datetime: this.startDateTime,
      end_datetime: this.endDateTime,
      special_instructions: this.specialInstructions
    };

    this.bookingService.createBooking(bookingData).subscribe(
      (booking) => {
        this.router.navigate(['/payment', booking.id], {
          queryParams: { method: this.selectedPaymentMethod }
        });
      },
      (error) => {
        console.error('Error creating booking:', error);
        this.showAlert('Error creating booking');
      }
    );
  }

  addNewVehicle() {
    this.router.navigate(['/vehicle-register']);
  }

  getPaymentMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'cod': 'Cash on Delivery',
      'razorpay': 'Razorpay',
      'upi': 'UPI Transfer'
    };
    return labels[method] || method;
  }

  getPaymentMethodDescription(method: string): string {
    const descriptions: { [key: string]: string } = {
      'cod': 'Pay when you arrive',
      'razorpay': 'Secure online payment',
      'upi': 'Pay via UPI instantly'
    };
    return descriptions[method] || '';
  }

  private showAlert(message: string) {
    this.alertController.create({
      message,
      buttons: ['OK']
    }).then(alert => alert.present());
  }
}


