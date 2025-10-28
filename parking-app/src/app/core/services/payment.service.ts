// core/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Payment, RazorpayOrderResponse } from 'src/app/shared/models/payment.model';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {
    this.loadRazorpayScript();
  }

  private loadRazorpayScript() {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }

  initiatePayment(bookingId: number, paymentMethod: string): Observable<RazorpayOrderResponse> {
    return this.http.post<RazorpayOrderResponse>(`${this.apiUrl}/initiate/`, {
      booking_id: bookingId,
      payment_method: paymentMethod
    });
  }

  verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/verify/`, {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature
    });
  }

  getPaymentStatus(bookingId: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/status/`, { params: { booking_id: bookingId.toString() } });
  }

  openRazorpayCheckout(orderResponse: RazorpayOrderResponse): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        key: orderResponse.key_id,
        amount: orderResponse.amount * 100,
        currency: orderResponse.currency,
        order_id: orderResponse.razorpay_order_id,
        handler: (response: any) => {
          resolve(response);
        },
        prefill: {
          email: '',
          contact: ''
        },
        theme: {
          color: '#3498db'
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    });
  }
}