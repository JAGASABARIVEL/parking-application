// payment/payment/payment.page.ts - UPDATED TO MATCH NEW SERVICE
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { BookingService } from 'src/app/core/services/booking.service';
import { PaymentService, PaymentRequest } from 'src/app/core/services/payment.service';
import { FirebaseService } from 'src/app/core/services/firebase';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  standalone: false
})
export class PaymentPage implements OnInit {
  bookingId: number | null = null;
  booking: any = null;
  paymentMethod: any = 'cod';
  isLoading = false;
  walletBalance: number = 0;
  canPayWithWallet: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private bookingService: BookingService,
    private firebaseService: FirebaseService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.bookingId = +params['id'];
        this.loadBooking();
        this.loadWalletBalance();
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['method']) {
        this.paymentMethod = params['method'];
      }
    });

    // Track page view
    this.firebaseService.trackScreenView('payment_page');
  }

  /**
   * Load booking details
   */
  loadBooking() {
    if (!this.bookingId) return;

    this.bookingService.getBookingDetails(this.bookingId).subscribe(
      (booking) => {
        this.booking = booking;
        console.log('Booking loaded:', booking);
      },
      (error) => {
        console.error('Error loading booking:', error);
        this.showToast('Error loading booking details', 'danger');
      }
    );
  }

  /**
   * Load wallet balance
   */
  loadWalletBalance() {
    this.paymentService.getWalletBalance().subscribe(
      (response) => {
        this.walletBalance = response.balance;
        this.canPayWithWallet = response.balance >= this.booking?.total_price;
      },
      (error) => {
        console.warn('Could not load wallet balance:', error);
        this.walletBalance = 0;
        this.canPayWithWallet = false;
      }
    );
  }

  /**
   * Main payment processing method
   */
  async processPayment() {
    if (!this.bookingId || !this.booking) {
      this.showToast('Booking information is missing', 'danger');
      return;
    }

    // Track payment attempt
    this.firebaseService.logAnalyticsEvent('payment_attempt', {
      booking_id: this.bookingId,
      payment_method: this.paymentMethod,
      amount: this.booking.total_price
    });

    switch (this.paymentMethod) {
      case 'cod':
        await this.processCOD();
        break;
      case 'razorpay':
        await this.processRazorpay();
        break;
      case 'upi':
        await this.processRazorpay(); // UPI also uses Razorpay
        break;
      case 'wallet':
        await this.processWalletPayment();
        break;
      default:
        this.showToast('Invalid payment method selected', 'danger');
    }
  }

  /**
   * Process Cash on Delivery (COD) payment
   */
  async processCOD() {
    const loading = await this.loadingController.create({
      message: 'Confirming booking...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const paymentRequest: PaymentRequest = {
        booking_id: this.bookingId!,
        amount: this.booking.total_price,
        payment_method: 'cod',
        currency: 'INR'
      };

      this.paymentService.initiatePayment(paymentRequest).subscribe(
        (response) => {
          loading.dismiss();
          console.log('COD payment initiated:', response);

          // Track successful payment
          this.firebaseService.logAnalyticsEvent('payment_success', {
            booking_id: this.bookingId,
            payment_method: 'cod',
            amount: this.booking.total_price
          });

          this.showToast('Booking confirmed! Please pay on arrival', 'success');
          
          // Navigate after a short delay to show toast
          setTimeout(() => {
            this.router.navigate(['/active-booking', this.bookingId]);
          }, 1500);
        },
        (error) => {
          loading.dismiss();
          console.error('COD payment error:', error);

          // Track failed payment
          this.firebaseService.logAnalyticsEvent('payment_failed', {
            booking_id: this.bookingId,
            payment_method: 'cod',
            error: error.message
          });

          this.handlePaymentError(error);
        }
      );
    } catch (error) {
      loading.dismiss();
      console.error('Unexpected error in COD processing:', error);
      this.showToast('An unexpected error occurred', 'danger');
    }
  }

  /**
   * Process Razorpay/UPI payment
   */
  async processRazorpay() {
    const loading = await this.loadingController.create({
      message: 'Initializing payment...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const paymentRequest: PaymentRequest = {
        booking_id: this.bookingId!,
        amount: this.booking.total_price,
        payment_method: this.paymentMethod === 'upi' ? 'razorpay' : this.paymentMethod,
        currency: 'INR'
      };

      this.paymentService.initiatePayment(paymentRequest).subscribe(
        async (orderResponse) => {
          loading.dismiss();
          console.log('Razorpay order created:', orderResponse);

          try {
            // Open Razorpay checkout
            const paymentResponse = await this.paymentService.openRazorpayCheckout(orderResponse);
            console.log('Razorpay payment response:', paymentResponse);

            // Verify payment with backend
            const verifyLoading = await this.loadingController.create({
              message: 'Verifying payment...',
              spinner: 'crescent'
            });
            await verifyLoading.present();

            this.paymentService.verifyPayment(
              paymentResponse.razorpay_order_id,
              paymentResponse.razorpay_payment_id,
              paymentResponse.razorpay_signature
            ).subscribe(
              (verifyResponse) => {
                verifyLoading.dismiss();
                console.log('Payment verified:', verifyResponse);

                // Track successful payment
                this.firebaseService.logAnalyticsEvent('payment_success', {
                  booking_id: this.bookingId,
                  payment_method: this.paymentMethod,
                  amount: this.booking.total_price,
                  transaction_id: paymentResponse.razorpay_payment_id
                });

                this.showToast('Payment successful!', 'success');
                
                setTimeout(() => {
                  this.router.navigate(['/active-booking', this.bookingId]);
                }, 1500);
              },
              (verifyError) => {
                verifyLoading.dismiss();
                console.error('Payment verification failed:', verifyError);

                // Track verification failure
                this.firebaseService.logAnalyticsEvent('payment_verification_failed', {
                  booking_id: this.bookingId,
                  error: verifyError.message
                });

                this.handleVerificationError(verifyError);
              }
            );
          } catch (razorpayError) {
            console.error('Razorpay error:', razorpayError);

            // Track Razorpay checkout error
            this.firebaseService.logAnalyticsEvent('razorpay_checkout_error', {
              booking_id: this.bookingId,
              error: (razorpayError as Error).message
            });

            // Check if it's a user cancellation or actual error
            if ((razorpayError as Error).message === 'Payment cancelled') {
              this.showToast('Payment cancelled', 'warning');
            } else {
              this.showToast('Payment failed. Please try again', 'danger');
            }

            // Offer retry option
            this.offerRetryOption();
          }
        },
        (initError) => {
          loading.dismiss();
          console.error('Payment initiation error:', initError);

          // Track initiation failure
          this.firebaseService.logAnalyticsEvent('payment_initiation_failed', {
            booking_id: this.bookingId,
            payment_method: this.paymentMethod,
            error: initError.message
          });

          this.handlePaymentError(initError);
        }
      );
    } catch (error) {
      loading.dismiss();
      console.error('Unexpected error in Razorpay processing:', error);
      this.showToast('An unexpected error occurred', 'danger');
    }
  }

  /**
   * Process Wallet payment
   */
  async processWalletPayment() {
    if (this.walletBalance < this.booking.total_price) {
      this.showToast(
        `Insufficient wallet balance. Need ₹${this.booking.total_price - this.walletBalance} more`,
        'warning'
      );
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Processing wallet payment...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      this.paymentService.payWithWallet(
        this.bookingId!,
        this.booking.total_price
      ).subscribe(
        (response) => {
          loading.dismiss();
          console.log('Wallet payment successful:', response);

          // Track successful wallet payment
          this.firebaseService.logAnalyticsEvent('payment_success', {
            booking_id: this.bookingId,
            payment_method: 'wallet',
            amount: this.booking.total_price
          });

          this.showToast('Payment successful!', 'success');
          
          setTimeout(() => {
            this.router.navigate(['/active-booking', this.bookingId]);
          }, 1500);
        },
        (error) => {
          loading.dismiss();
          console.error('Wallet payment error:', error);

          // Track failed wallet payment
          this.firebaseService.logAnalyticsEvent('payment_failed', {
            booking_id: this.bookingId,
            payment_method: 'wallet',
            error: error.message
          });

          this.handlePaymentError(error);
        }
      );
    } catch (error) {
      loading.dismiss();
      console.error('Unexpected error in wallet payment:', error);
      this.showToast('An unexpected error occurred', 'danger');
    }
  }

  /**
   * Handle payment errors with specific messages
   */
  private handlePaymentError(error: any) {
    let errorMessage = 'Payment failed';

    if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.status === 400) {
      errorMessage = error.error?.detail || 'Invalid payment request';
    } else if (error.status === 401) {
      errorMessage = 'Session expired. Please login again.';
      this.router.navigate(['/auth/login']);
      return;
    } else if (error.status === 403) {
      errorMessage = 'You are not authorized to make this payment.';
    } else if (error.status === 409) {
      errorMessage = 'Booking is no longer available for payment.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.error?.detail) {
      errorMessage = error.error.detail;
    }

    this.showToast(errorMessage, 'danger');
    this.offerRetryOption();
  }

  /**
   * Handle payment verification errors
   */
  private handleVerificationError(error: any) {
    let errorMessage = 'Payment verification failed';

    if (error.error?.detail) {
      errorMessage = error.error.detail;
    }

    this.showToast(errorMessage, 'danger');

    // Show option to check payment status
    this.alertController.create({
      header: 'Payment Issue',
      message: 'Your payment might be processing. Would you like to check the status?',
      buttons: [
        {
          text: 'Check Status',
          handler: () => {
            this.checkPaymentStatus();
          }
        },
        {
          text: 'Retry',
          handler: () => {
            this.processPayment();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present());
  }

  /**
   * Check payment status
   */
  private checkPaymentStatus() {
    if (!this.bookingId) return;

    const loading = this.loadingController.create({
      message: 'Checking payment status...',
      spinner: 'crescent'
    }).then(l => {
      l.present();
      
      this.paymentService.getPaymentStatus(this.bookingId!).subscribe(
        (response) => {
          l.dismiss();
          console.log('Payment status:', response);

          if (response.status === 'completed') {
            this.showToast('Payment completed successfully!', 'success');
            setTimeout(() => {
              this.router.navigate(['/active-booking', this.bookingId]);
            }, 1500);
          } else if (response.status === 'pending') {
            this.showToast('Payment is still processing. Please wait...', 'warning');
          } else if (response.status === 'failed') {
            this.showToast('Payment failed. Please try again.', 'danger');
          }
        },
        (error) => {
          l.dismiss();
          console.error('Error checking payment status:', error);
          this.showToast('Could not check payment status', 'danger');
        }
      );
    });
  }

  /**
   * Offer retry option after payment failure
   */
  private offerRetryOption() {
    this.alertController.create({
      header: 'Payment Failed',
      message: 'Would you like to retry the payment or go back?',
      buttons: [
        {
          text: 'Retry',
          handler: () => {
            this.processPayment();
          }
        },
        {
          text: 'Go Back',
          role: 'destructive',
          handler: () => {
            this.router.navigate(['/booking', this.bookingId]);
          }
        }
      ]
    }).then(alert => alert.present());
  }

  /**
   * Add funds to wallet
   */
  async addFundsToWallet() {
    const alert = await this.alertController.create({
      header: 'Add Funds to Wallet',
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: 'Amount (₹)',
          min: 100,
          max: 100000
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add Funds',
          handler: (data) => {
            if (data.amount && data.amount > 0) {
              this.proceedWithWalletTopup(data.amount);
            } else {
              this.showToast('Please enter a valid amount', 'warning');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Process wallet top-up
   */
  private proceedWithWalletTopup(amount: number) {
    const loading = this.loadingController.create({
      message: 'Processing wallet top-up...',
      spinner: 'crescent'
    }).then(l => {
      l.present();

      this.paymentService.addWalletFunds(amount, 'razorpay').subscribe(
        (response) => {
          l.dismiss();
          console.log('Wallet top-up successful:', response);
          this.showToast('Wallet top-up successful!', 'success');
          this.loadWalletBalance();
        },
        (error) => {
          l.dismiss();
          console.error('Wallet top-up error:', error);
          this.handlePaymentError(error);
        }
      );
    });
  }

  /**
   * Cancel payment
   */
  cancel() {
    this.alertController.create({
      header: 'Cancel Payment?',
      message: 'Are you sure you want to go back? Your booking will not be confirmed.',
      buttons: [
        {
          text: 'Continue Paying',
          role: 'cancel'
        },
        {
          text: 'Go Back',
          role: 'destructive',
          handler: () => {
            this.router.navigate(['/booking', this.bookingId]);
          }
        }
      ]
    }).then(alert => alert.present());
  }

  /**
   * Show toast notification
   */
  private showToast(message: string, color: string = 'primary') {
    this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    }).then(toast => toast.present());
  }
}