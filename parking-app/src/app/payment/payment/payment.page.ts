// payment/payment.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { BookingService } from 'src/app/core/services/booking.service';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  standalone: false
})
export class PaymentPage implements OnInit {
  bookingId: number | null = null;
  booking: any = null;
  paymentMethod: string = 'cod';
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private bookingService: BookingService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.bookingId = +params['id'];
        this.loadBooking();
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['method']) {
        this.paymentMethod = params['method'];
      }
    });
  }

  loadBooking() {
    if (!this.bookingId) return;

    this.bookingService.getBookingDetails(this.bookingId).subscribe(
      (booking) => {
        this.booking = booking;
      },
      (error) => {
        console.error('Error loading booking:', error);
        this.showToast('Error loading booking details', 'danger');
      }
    );
  }

  async processPayment() {
    if (!this.bookingId) return;

    if (this.paymentMethod === 'cod') {
      await this.processCOD();
    } else if (this.paymentMethod === 'razorpay') {
      await this.processRazorpay();
    }
  }

  async processCOD() {
    const loading = await this.loadingController.create({
      message: 'Processing...'
    });
    await loading.present();

    this.paymentService.initiatePayment(this.bookingId!, 'cod').subscribe(
      () => {
        loading.dismiss();
        this.showToast('Booking confirmed! Pay on arrival', 'success');
        this.router.navigate(['/active-booking', this.bookingId]);
      },
      (error) => {
        loading.dismiss();
        console.error('Payment error:', error);
        this.showToast('Payment failed', 'danger');
      }
    );
  }

  async processRazorpay() {
    const loading = await this.loadingController.create({
      message: 'Initializing payment...'
    });
    await loading.present();

    this.paymentService.initiatePayment(this.bookingId!, 'razorpay').subscribe(
      async (orderResponse) => {
        loading.dismiss();
        
        try {
          const paymentResponse = await this.paymentService.openRazorpayCheckout(orderResponse);
          
          // Verify payment
          this.paymentService.verifyPayment(
            paymentResponse.razorpay_order_id,
            paymentResponse.razorpay_payment_id,
            paymentResponse.razorpay_signature
          ).subscribe(
            () => {
              this.showToast('Payment successful!', 'success');
              this.router.navigate(['/active-booking', this.bookingId]);
            },
            (error) => {
              console.error('Verification error:', error);
              this.showToast('Payment verification failed', 'danger');
            }
          );
        } catch (error) {
          console.error('Razorpay error:', error);
          this.showToast('Payment cancelled', 'warning');
        }
      },
      (error) => {
        loading.dismiss();
        console.error('Payment initiation error:', error);
        this.showToast('Failed to initialize payment', 'danger');
      }
    );
  }

  cancel() {
    this.router.navigate(['/bookings-history']);
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
